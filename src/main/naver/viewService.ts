import { Browser, ElementHandle, Page, ScreenshotClip } from 'puppeteer';
import { NaverService, ScreenshotFilePath } from './types';

export class NaverViewService implements NaverService {
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

    return $page;
  }

  async findPosts(
    $searchPage: Page,
    postURL: string
  ): Promise<ElementHandle<HTMLLIElement>>;
  async findPosts(
    $searchPage: Page,
    postURL: string[]
  ): Promise<ElementHandle<HTMLLIElement>[]>;
  async findPosts(
    $searchPage: Page,
    postURL: string | string[]
  ): Promise<ElementHandle<HTMLLIElement> | ElementHandle<HTMLLIElement>[]> {
    const $postList = await this.findPostList($searchPage);

    const postNotFoundError = new Error('포스트가 존재하지 않습니다.');

    if (typeof postURL === 'string') {
      const $post = await this.findPost($postList, postURL);

      if ($post) {
        return $post;
      } else {
        throw postNotFoundError;
      }
    }

    // if(Array.isArray(postURL)) {
    //
    // }

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

  private async findPostList(
    $searchPage: Page
  ): Promise<ElementHandle<HTMLUListElement>> {
    const $postList = await $searchPage.$('ul.lst_view');

    if ($postList === null) {
      throw new Error(
        'View 검색 결과 영역을 찾을 수 없습니다. 네이버 View UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    return $postList;
  }

  private async findPost(
    $postList: ElementHandle<HTMLUListElement>,
    postURL: string
  ) {
    const $post = await $postList.$(
      `li:has(a[href*="${postURL}"]):nth-child(-n+10)`
    );

    return $post ? $post.toElement('li') : null;
  }

  private async makeBorderForCategory($searchPage: Page) {
    const categoryQuery = new URL($searchPage.url()).searchParams.get('where');

    const $categoryBox = await $searchPage.$(
      `a[href*="where=${categoryQuery}"]`
    );

    if (!$categoryBox) {
      throw new Error(
        'View 검색 결과 카테고리 영역을 찾을 수 없습니다. 네이버 View UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
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
        '스크린샷 영역을 찾을 수 없습니다. 네이버 View UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    const BOTTOM_RIGHT_CORNER = 2;

    return {
      x: 0,
      y: 0,
      // plus 10 to width and height for visibility
      width: boxModelOfPostList.margin[BOTTOM_RIGHT_CORNER].x + 10,
      height: boxModelOfTenthPost.margin[BOTTOM_RIGHT_CORNER].y + 10,
    };
  }
}
