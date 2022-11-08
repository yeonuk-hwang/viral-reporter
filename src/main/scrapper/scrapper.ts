import puppeteer, { Browser, Page, TimeoutError } from 'puppeteer';
import { INSTAGRAM_URL } from './constants';
import {
  DeactivatedIDError,
  InvalidUserNameOrPasswordError,
  PostNotExistError,
  PostURLisNotValid,
} from './errors';
import { ScreenshotPath, URL } from './types';

interface InsScarpper {
  login(userName: string, password: string): Promise<void>;
  exploreHashTag(tagName: string): Promise<Page>;
  findPost(
    page: Page,
    postURL: URL
  ): Promise<puppeteer.ElementHandle<HTMLAnchorElement>>;
  makeRedBorder(
    post: puppeteer.ElementHandle<HTMLAnchorElement>
  ): Promise<void>;
  screenshot(page: Page, path: string): Promise<ScreenshotPath>;
  close(): Promise<void>;
}

class InsScarpperImpl implements InsScarpper {
  private browser: Browser;
  private URL = INSTAGRAM_URL;
  private cookie: puppeteer.Protocol.Network.Cookie[] | null;

  constructor(browser: Browser) {
    this.browser = browser;
    this.cookie = null;
  }

  async login(userName: string, password: string) {
    const page = await this.browser.newPage();
    page.setExtraHTTPHeaders({
      'Accept-Language': 'en',
    });
    if (this.cookie) {
      page.deleteCookie(...this.cookie);
    }

    try {
      await page.goto(this.URL.ROOT, {
        waitUntil: 'networkidle0',
      });
      await page.type(`[aria-label*="username"]`, userName);
      await page.type(`[aria-label*=Password]`, password);
      await Promise.all([
        page.click(`[type="submit"]`),
        page.waitForNavigation(),
      ]);
      this.cookie = await page.cookies();

      if (page.url().startsWith('https://www.instagram.com/challenge/')) {
        throw new DeactivatedIDError();
      }
    } catch (e) {
      if (e instanceof TimeoutError && (await page.$('#slfErrorAlert'))) {
        throw new InvalidUserNameOrPasswordError();
      }

      throw e;
    } finally {
      page.close();
    }
  }

  async exploreHashTag(tagName: string): Promise<Page> {
    const page = await this.browser.newPage();
    page.setExtraHTTPHeaders({
      'Accept-Language': 'en',
    });
    await page.goto(encodeURI(this.URL.EXPLORE + tagName), {
      waitUntil: 'networkidle0',
    });
    return page;
  }

  async findPost(
    page: Page,
    postURL: URL
  ): Promise<puppeteer.ElementHandle<HTMLAnchorElement>> {
    const postURLwithoutDomain = this.extractPostURL(postURL);

    const post = await page.$(`a[href*="${postURLwithoutDomain}"]`);

    if (post !== null) {
      return post as puppeteer.ElementHandle<HTMLAnchorElement>;
    } else {
      throw new PostNotExistError(`포스트가 존재하지 않습니다: ${postURL}`);
    }
  }

  private extractPostURL(postURL: URL): string {
    const regexForFindPostURL = /p\/\w+\/?/;
    const postURLwithoutDomain = postURL.match(regexForFindPostURL)?.[0];

    if (postURLwithoutDomain !== undefined) {
      return postURLwithoutDomain;
    } else {
      throw new PostURLisNotValid(`잘못된 형식의 포스트 URL입니다: ${postURL}`);
    }
  }

  async screenshot(
    page: Page,
    screenshotPath: ScreenshotPath
  ): Promise<string> {
    const header = await page.$(`section > main > header`);
    const popular = await page.$('section > main > article > div');

    if (!header || !popular) {
      throw new Error('스크린샷 영역을 찾을 수 없습니다.');
    }

    const headerBox = await header.boundingBox();
    const popularBox = await popular?.boundingBox();

    if (!headerBox || !popularBox) {
      throw new Error('스크린샷 영역을 찾을 수 없습니다.');
    }

    await page.screenshot({
      path: screenshotPath,
      clip: {
        x: headerBox.x - 100,
        y: headerBox.y,
        width: popularBox.width + 200,
        height: popularBox.y + popularBox.height + 80,
      },
    });

    page.close();

    return screenshotPath;
  }

  async makeRedBorder(post: puppeteer.ElementHandle<HTMLAnchorElement>) {
    await post.evaluate((post) => {
      post.style.display = 'block';
      post.style.outline = 'solid 5px red';
    });
  }

  close() {
    return this.browser.close();
  }
}

export { InsScarpperImpl, InsScarpper };
