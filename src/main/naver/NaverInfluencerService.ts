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

    const $post = await $postList.$(
      `:scope > li:has(div.title_area > a[data-foryou-gdid*="${postID}"]):not(.type_join)`
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
