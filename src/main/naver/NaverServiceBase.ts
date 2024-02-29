import { Browser, ElementHandle, Page, ScreenshotClip } from 'puppeteer';
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
      .then((securityButton) => securityButton?.click())
      .catch(() => undefined);

    const $postList = await this.findPostList($page);
    await this.waitUntilImageLoaded($postList);

    return $page;
  }

  async waitUntilImageLoaded($postList: ElementHandle<HTMLUListElement>) {
    return $postList.evaluate(async ($postListElement) => {
      const images = $postListElement.querySelectorAll(
        'li:nth-child(-n + 10) .detail_box img'
      );

      const posts = $postListElement.querySelectorAll('li:nth-child(-n + 10)');

      Array.from(posts).forEach((post) => {
        post.scrollIntoView({ behavior: 'smooth' });
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      window.scrollTo({ top: 0, left: 0 });

      return Promise.all(
        Array.from(images, (image) => {
          if (image.complete && image.naturalWidth > 1) return true;

          return new Promise((resolve, reject) => {
            image?.addEventListener('load', resolve);
            image?.addEventListener('error', reject);

            // 썸네일 이미지가 없지만 이미지 준비중으로 뜨는 경우
            // 계속해서 이미지가 로드될 때까지 기다리기에, 5초동안 로드가 안될 경우 resolve 처리
            setTimeout(resolve, 5000);
          });
        })
      );
    });
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
    const categoryQuery = new URL($searchPage.url()).searchParams.get('ssc');

    const $categoryBox = await $searchPage.$(`a[href*="ssc=${categoryQuery}"]`);

    if (!$categoryBox) {
      throw new Error(
        '검색 결과 카테고리 영역을 찾을 수 없습니다. 네이버 UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    return this.makeRedBorder($categoryBox);
  }

  private async getScreenshotClip($searchPage: Page): Promise<ScreenshotClip> {
    const $postWrapper = await this.findPostList($searchPage);
    const $posts = await $postWrapper.$$(':scope > li:not(.type_join)');
    const $tenthPost = $posts[9];
    const $lastPost = $posts[$posts.length - 1];

    // 요구조건은 10번째 포스트까지 스크린샷 검색 후 스크린샷 촬영
    // 다만, 검색 결과의 총 포스트 수가 10개 미만일 경우 tenthPost가 없기에
    // 마지막 포스트로 대체
    const boxModelOfPost =
      (await $tenthPost?.boxModel()) || (await $lastPost?.boxModel());
    const boxModelOfPostList = await $postWrapper?.boxModel();

    if (!boxModelOfPost || !boxModelOfPostList) {
      throw new Error(
        '스크린샷 영역을 찾을 수 없습니다. 네이버 UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

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
      height: boxModelOfPost.margin[BOTTOM_RIGHT_CORNER].y + 10,
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
