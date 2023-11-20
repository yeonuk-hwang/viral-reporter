import { ElementHandle, Page } from 'puppeteer';
import { NaverServiceBase } from './NaverServiceBase';

export class NaverViewService extends NaverServiceBase {
  protected async findPostList(
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

  protected async findPost(
    $postList: ElementHandle<HTMLUListElement>,
    postURL: string
  ) {
    const $post = await $postList.$(
      `li:has(a[href*="${postURL}"]):nth-child(-n+10)`
    );

    return $post ? $post.toElement('li') : null;
  }
}
