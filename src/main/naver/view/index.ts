import { Browser, ElementHandle, Page, ScreenshotClip } from 'puppeteer';

type ScreenshotFilePath = string;

export interface NaverViewService {
  search(keyword: string): Promise<Page>;
  findPost(
    $searchPage: Page,
    postURL: string
  ): Promise<ElementHandle<HTMLLIElement>>;
  makeRedBorder($element: ElementHandle<HTMLElement>): Promise<void>;
  screenshot(
    $searchPage: Page,
    screenshotDirectoryPath: string
  ): Promise<ScreenshotFilePath>;
  close(): Promise<void>;
}

export class NaverViewServiceImpl implements NaverViewService {
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

  async findPost(
    $searchPage: Page,
    postURL: string | string[]
  ): Promise<ElementHandle<HTMLLIElement>> {
    const $postList = await this.findPostList($searchPage);
    const $top10Posts = await this.findTop10Posts($postList);

    const $postFindResults = await Promise.all(
      $top10Posts.map((post) => post.$(`a[href*="${postURL}"]`))
    );

    const postIndex = $postFindResults.findIndex(findAnchorFromResultArray);

    const postIsNotExist = postIndex === -1;

    if (postIsNotExist) {
      throw new Error('포스트가 존재하지 않습니다.');
    }

    const $post = $top10Posts[postIndex];

    return $post;

    function findAnchorFromResultArray(
      value: ElementHandle<HTMLAnchorElement> | null
    ) {
      return value !== null;
    }
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

  private async findTop10Posts($postList: ElementHandle<HTMLUListElement>) {
    const posts = await $postList.$$('li');

    if (posts.length === 0) {
      throw new Error(
        'View 검색 결과 포스트 영역을 찾을 수 없습니다. 네이버 View UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    return posts.slice(0, 10);
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
