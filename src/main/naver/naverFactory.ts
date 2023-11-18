import { Browser } from 'puppeteer';
import { NaverViewService } from './viewService';

export class NaverFactory {
  static createCafeService(browser: Browser) {
    const NAVER_CAFE_VIEW_URL =
      'https://search.naver.com/search.naver?where=article';

    return new NaverViewService(browser, NAVER_CAFE_VIEW_URL);
  }

  static createBlogService(browser: Browser) {
    const NAVER_BLOG_VIEW_URL =
      'https://search.naver.com/search.naver?where=blog';

    return new NaverViewService(browser, NAVER_BLOG_VIEW_URL);
  }
}
