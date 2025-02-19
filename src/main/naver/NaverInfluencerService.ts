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

    const $top10_posts = (
      await $postList.$$(':scope > li:has(div.title_area):not(.type_join)')
    ).slice(0, 10);

    try {
      const $post = await Promise.any(
        $top10_posts.map(async (target) => {
          const isPostMatch = await target.$(
            `a[data-foryou-gdid*="${postID}"]`
          );

          return isPostMatch ? target : Promise.reject();
        })
      );

      return $post.toElement('li');
    } catch {
      return null;
    }
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
