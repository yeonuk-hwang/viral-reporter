import { Browser } from 'puppeteer';
import { InfluencerService } from './NaverInfluencerService';
import { NaverViewService } from './NaverViewService';

export class NaverFactory {
  static createCafeService(browser: Browser) {
    const NAVER_CAFE_VIEW_URL =
      'https://search.naver.com/search.naver?ssc=tab.cafe.all';

    return new NaverViewService(browser, NAVER_CAFE_VIEW_URL);
  }

  static createBlogService(browser: Browser) {
    const NAVER_BLOG_VIEW_URL =
      'https://search.naver.com/search.naver?ssc=tab.blog.all';

    return new NaverViewService(browser, NAVER_BLOG_VIEW_URL);
  }

  static createInfluencer(browser: Browser) {
    const NAVER_INFLUENCER_URL =
      'https://search.naver.com/search.naver?ssc=tab.influencer.chl&where=influencer';

    return new InfluencerService(browser, NAVER_INFLUENCER_URL);
  }
}
