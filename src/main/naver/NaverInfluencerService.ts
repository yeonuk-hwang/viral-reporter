import { ElementHandle, Page } from 'puppeteer';
import { NaverServiceBase } from './NaverServiceBase';

export class InfluencerService extends NaverServiceBase {
  protected async findPostList(
    $searchPage: Page
  ): Promise<ElementHandle<HTMLUListElement>> {
    const $postList = await $searchPage.$(
      'ul._inf_contents:not([style*="display:none"])'
    );

    if ($postList === null) {
      throw new Error(
        'Influencer 검색 결과 영역을 찾을 수 없습니다. 네이버 Influencer 검색 UI가 변경된 경우 이 에러가 발생할 수 있습니다.'
      );
    }

    return $postList.toElement('ul');
  }

  protected async findPost(
    $postList: ElementHandle<HTMLUListElement>,
    postURL: string
  ) {
    const postID = this.extractBlogPostIDFromPostURL(postURL);

    const $post = await $postList.$(
      `li:has(a[data-foryou-gdid*="${postID}"]):nth-child(-n+10)`
    );

    return $post ? $post.toElement('li') : null;
  }

  private extractBlogPostIDFromPostURL(postURL: string): PostID {
    const regexForFindPostID = /(blog.naver.com\/)([\w-]+\/?)(\d+)/g;
    const PostIDGroupIndex = 3;
    const postID = regexForFindPostID.exec(postURL)?.[PostIDGroupIndex];

    if (postID !== undefined) {
      return postID;
    } else {
      throw new Error(`잘못된 형식의 인플루언서 포스트 URL입니다: ${postURL}`);
    }
  }
}

type PostID = string;
