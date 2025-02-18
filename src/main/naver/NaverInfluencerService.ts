import { ElementHandle, Page } from 'puppeteer';
import { NaverServiceBase } from './NaverServiceBase';

export class InfluencerService extends NaverServiceBase {
  protected async findPostList(
    $searchPage: Page
  ): Promise<ElementHandle<HTMLUListElement> | null> {
    const $postList = await $searchPage.$(
      'ul._inf_contents:not([style*="display:none"])'
    );

    if ($postList === null) {
      return null;
    }

    return $postList.toElement('ul');
  }

  protected async findPost(
    $postList: ElementHandle<HTMLUListElement>,
    postURL: string
  ) {
    const postID = this.extractBlogPostIDFromPostURL(postURL);

    /*
    상위 10개의 게시물 내에서 검색을 해야 하는데 인플루언서 탭의 경우
    일부 검색어에서 추천 포스트(.type_join)를 보여주는 경우가 생김
    이 경우 nth-child에 해당 추천 포스트가 포함되기 때문에
    단순히 10개까지의 child만 대상으로 검색하게 되면
    추천 포스트만큼 숫자가 줄어듬
    예를 들어, 추천 포스트가 2개있다면 10개의 자식 포스트를 검색하게 된다면
    실질적으로 추천포스트를 제외하고는 상위 8개의 검색어만 대상으로 진행하게 됨
    이를 해결하기 위해서 추천 포스트의 개수를 파악한 후
    nth-child(-n+10)에서 추천 포스트 개수만큼 더해줌
    */
    const recommendedPostCount = (
      await $postList.$$(':scope > li.type_join:nth-child(-n+10)')
    ).length;

    const $post = await $postList.$(
      `:scope > li:has(div.title_area > a[data-foryou-gdid*="${postID}"]):not(.type_join):nth-child(-n+${
        10 + recommendedPostCount
      })`
    );

    return $post ? $post.toElement('li') : null;
  }

  private extractBlogPostIDFromPostURL(postURL: string): PostID {
    const regexForFindPostID = /(blog.naver.com\/)([\w-]+)\/(\d+)/g;
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
