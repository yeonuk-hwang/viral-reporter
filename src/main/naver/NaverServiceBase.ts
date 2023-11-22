import { Browser, ElementHandle, Page, ScreenshotClip } from 'puppeteer';
import { container } from 'webpack';
import { NaverService, ScreenshotFilePath } from './types';

export abstract class NaverServiceBase implements NaverService {
  private browser: Browser;
  private baseURL: string;

  constructor(browser: Browser, baseURL: string) {
    this.browser = browser;
    this.baseURL = baseURL;
  }

  async search(keyword: string): Promise<Page> {
    const $page = await this.browser.newPage();

    await $page.goto(encodeURI(this.baseURL + `&query=${keyword}`), {
      // 페이지의 모든 컨텐츠가 로드될 때까지 대기하기 위한 옵션, 0.5초동안 네트워크 요청이 없을때까지 기다린다.
      waitUntil: 'networkidle0',
      // disable timeout
      timeout: 0,
    });

    $page
      .waitForSelector('text/제한 해제')
      .then((securityButton) => securityButton?.click());

    const $postList = await this.findPostList($page);

    await $postList.evaluate(async ($postListElement) => {
      const images = $postListElement.querySelectorAll(
        'li:nth-child(-n + 10) img:not([alt="이미지준비중"])'
      );

      const posts = $postListElement.querySelectorAll('li:nth-child(-n + 10)');

      Array.from(posts).forEach((post) => {
        post.scrollIntoView({ behavior: 'smooth' });
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      window.scrollTo({ top: 0, left: 0 });

      return Promise.all(
        Array.from(images, (image, index) => {
          if (image.complete && image.naturalWidth > 1) return true;

          return new Promise((resolve, reject) => {
            image?.addEventListener('load', (e) => {
              console.log('load', image, index);
              resolve(e);
            });
            image?.addEventListener('error', reject);
          });
        })
      );
    });

    return $page;
  }

  async findPosts(
    $searchPage: Page,
    postURL: string
  ): Promise<ElementHandle<HTMLLIElement>>;
  async findPosts(
    $searchPage: Page,
    postURLs: string[]
  ): Promise<ElementHandle<HTMLLIElement>[]>;
  async findPosts(
    $searchPage: Page,
    postURL: string | string[]
  ): Promise<ElementHandle<HTMLLIElement> | ElementHandle<HTMLLIElement>[]> {
    const $postList = await this.findPostList($searchPage);

    const postNotFoundErrorMessage = '포스트가 존재하지 않습니다.';

    if (typeof postURL === 'string') {
      const $post = await this.findPost($postList, postURL);

      if ($post === null) {
        throw new Error(postNotFoundErrorMessage);
      } else {
        return $post;
      }
    }

    if (Array.isArray(postURL)) {
      const $posts = await Promise.all(
        postURL.map((aPostURL) => this.findPost($postList, aPostURL))
      );

      const $top10Posts = $posts.filter(
        (value): value is ElementHandle<HTMLLIElement> => value !== null
      );

      if ($top10Posts.length === 0) {
        throw new Error(postNotFoundErrorMessage);
      } else {
        return $top10Posts;
      }
    }

    throw new Error(`unexpected argument, postURL:${postURL}`);
  }

  makeRedBorder($element: ElementHandle<HTMLElement>): Promise<void> {
    return $element.evaluate(($post) => {
      $post.style.outline = 'red solid 5px';
    });
  }

  async screenshot(
    $searchPage: Page,
    screenshotPath: string
  ): Promise<ScreenshotFilePath> {
    await this.makeBorderForCategory($searchPage);

    const screenshotPathWithFileExtension = screenshotPath + '.png';
    const screenshotClip = await this.getScreenshotClip($searchPage);

    await new Promise((r) => setTimeout(r, 5000));

    await $searchPage.screenshot({
      path: screenshotPathWithFileExtension,
      clip: screenshotClip,
    });

    return screenshotPathWithFileExtension;
  }

  async close() {
    return this.browser.close();
  }

  private async makeBorderForCategory($searchPage: Page) {
    const categoryQuery = new URL($searchPage.url()).searchParams.get('where');

    const $categoryBox = await $searchPage.$(
      `a[href*="where=${categoryQuery}"]`
    );

    if (!$categoryBox) {
      throw new Error(
        '검색 결과 카테고리 영역을 찾을 수 없습니다. 네이버 UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    return this.makeRedBorder($categoryBox);
  }

  private async getScreenshotClip($searchPage: Page): Promise<ScreenshotClip> {
    const $postList = await this.findPostList($searchPage);
    const $tenthPost = await $postList.$('li:nth-child(10)');

    const boxModelOfTenthPost = await $tenthPost?.boxModel();
    const boxModelOfPostList = await $postList?.boxModel();

    if (!boxModelOfTenthPost || !boxModelOfPostList) {
      throw new Error(
        '스크린샷 영역을 찾을 수 없습니다. 네이버 UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    console.log(boxModelOfPostList, boxModelOfTenthPost);
    const BOTTOM_RIGHT_CORNER = 2;

    await $searchPage.evaluate(() => {
      window.scrollBy(0, 0);
      return Promise.resolve();
    });

    return {
      x: 0,
      y: 0,
      // plus 10 to width and height for adding a margin to the screenshot
      width: boxModelOfPostList.margin[BOTTOM_RIGHT_CORNER].x + 10,
      height: boxModelOfTenthPost.margin[BOTTOM_RIGHT_CORNER].y + 10,
    };
  }

  protected abstract findPostList(
    $searchPage: Page
  ): Promise<ElementHandle<HTMLUListElement>>;

  protected abstract findPost(
    $postList: ElementHandle<HTMLUListElement>,
    postURL: string
  ): Promise<ElementHandle<HTMLLIElement> | null>;
}
