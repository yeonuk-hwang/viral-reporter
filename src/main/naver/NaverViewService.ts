import { ElementHandle, Page } from 'puppeteer';
import { NaverServiceBase } from './NaverServiceBase';

export class NaverViewService extends NaverServiceBase {
  protected async findPostList(
    $searchPage: Page
  ): Promise<ElementHandle<HTMLUListElement>> {
    const $postList = await $searchPage.waitForSelector('ul.lst_view', {
      timeout: 0,
    });

    if ($postList === null) {
      throw new Error(
        'View 검색 결과 영역을 찾을 수 없습니다. 네이버 View UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    return $postList;
  }

  protected async findPost(
    $postList: ElementHandle<HTMLUListElement>,
    postURL: string
  ) {
    try {
      const query = `li:has(a[href*="${postURL}"]):nth-child(-n+10)`;

      console.log('query', query);

      const $post = await $postList.$(query);

      return $post ? $post.toElement('li') : null;
    } catch (e) {
      // console.error(e);

      return null;
    }
  }
}
