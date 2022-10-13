import puppeteer, { Browser, Page, TimeoutError } from 'puppeteer';
import * as path from 'path';
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
  screenshot(
    page: Page,
    post: puppeteer.ElementHandle<HTMLAnchorElement>,
    path: string
  ): Promise<ScreenshotPath>;
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
        page.waitForNavigation({
          timeout: 10000,
        }),
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
    }
  }

  async exploreHashTag(tagName: string): Promise<Page> {
    const page = await this.browser.newPage();
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
    post: puppeteer.ElementHandle<HTMLAnchorElement>,
    screenshotPath: ScreenshotPath
  ): Promise<string> {
    await this.makeRedBorder(post);
    await page.screenshot({
      fullPage: true,
      path: screenshotPath,
    });

    return path.join(process.cwd(), screenshotPath);
  }

  private async makeRedBorder(
    post: puppeteer.ElementHandle<HTMLAnchorElement>
  ) {
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
