import * as path from 'path';
import * as fs from 'fs';
import moment from 'moment';
import { NaverFactory } from './naverFactory';
import { NaverService } from './types';

jest.setTimeout(100000);

describe.each([
  {
    serviceName: 'cafeService',
    variables: getCafeServiceVariables(),
    setUp: cafeServiceSetUp,
  },
  {
    serviceName: 'blogService',
    variables: getBlogServiceVariables(),
    setUp: blogServiceSetUp,
  },
])('$serviceName', ({ variables, setUp }) => {
  const {
    SEARCH_TERM,
    SEARCH_RESULT_URL,
    TOP_10_POSTS,
    NOT_TOP_10_POST,
    SCREENSHOT_PREFIX,
  } = variables;

  const A_TOP_10_POST = TOP_10_POSTS[0];

  it(`should search for posts on naver with a given search term`, async () => {
    const viewService = setUp();

    const page = await viewService.search(SEARCH_TERM);

    expect(page.url()).toBe(SEARCH_RESULT_URL);
  });

  it(`should return a post if a given post is in the top 10 posts`, async () => {
    const viewService = setUp();

    const searchPage = await viewService.search(SEARCH_TERM);

    const post = await viewService.findPosts(searchPage, A_TOP_10_POST);
    expect(post).toBeTruthy();
  });

  it(`should throw Error if a given post is not in the top 10 posts`, async () => {
    const viewService = setUp();

    const searchPage = await viewService.search(SEARCH_TERM);

    await expect(() =>
      viewService.findPosts(searchPage, NOT_TOP_10_POST)
    ).rejects.toThrow('포스트가 존재하지 않습니다.');
  });

  it(`should return an array of the posts in the top 10 if any of the given postURLs are in the top 10 posts`, async () => {
    const viewService = setUp();

    const searchPage = await viewService.search(SEARCH_TERM);

    const posts = await viewService.findPosts(searchPage, TOP_10_POSTS);

    expect(posts).toBeInstanceOf(Array);
    expect(posts).toHaveLength(TOP_10_POSTS.length);
  });

  it(`should return an array of the posts in the top 10 if any of the given postURLs are in the top 10 posts, when the postURLs are mix of top10 and not top10`, async () => {
    const viewService = setUp();

    const searchPage = await viewService.search(SEARCH_TERM);

    const posts = await viewService.findPosts(searchPage, [
      ...TOP_10_POSTS,
      NOT_TOP_10_POST,
    ]);

    expect(posts).toBeInstanceOf(Array);
    expect(posts).toHaveLength(TOP_10_POSTS.length);
  });

  it(`should throw Error if any of the given postURLs are not in the top 10 posts`, async () => {
    const viewService = setUp();

    const searchPage = await viewService.search(SEARCH_TERM);

    await expect(() =>
      viewService.findPosts(searchPage, [NOT_TOP_10_POST])
    ).rejects.toThrow('포스트가 존재하지 않습니다.');
  });

  it(`should make red border to a given post`, async () => {
    const viewService = setUp();

    const searchPage = await viewService.search(SEARCH_TERM);

    const post = await viewService.findPosts(searchPage, A_TOP_10_POST);

    await viewService.makeRedBorder(post);

    expect(post.evaluate((post) => post.style.outline)).resolves.toBe(
      'red solid 5px'
    );
  });

  it(`should be able to screenshot popular post page`, async () => {
    const viewService = setUp();

    const searchPage = await viewService.search(SEARCH_TERM);

    const posts = await viewService.findPosts(searchPage, TOP_10_POSTS);

    await Promise.all(posts.map((post) => viewService.makeRedBorder(post)));

    const TEST_SCREENSHOT_DIRECTORY = path.join(
      process.cwd(),
      'test_screenshot'
    );

    if (!fs.existsSync(TEST_SCREENSHOT_DIRECTORY)) {
      fs.mkdirSync(TEST_SCREENSHOT_DIRECTORY);
    }

    const TEST_SCREENSHOT_PATH = path.join(
      TEST_SCREENSHOT_DIRECTORY,
      SCREENSHOT_PREFIX + moment().format('YYYY-MM-DDTHH-mm-ss')
    );

    const screenShotFilePath = await viewService.screenshot(
      searchPage,
      TEST_SCREENSHOT_PATH
    );

    expect(fs.existsSync(screenShotFilePath)).toBe(true);
  });
});

type ViewServiceTestVariables = {
  SEARCH_TERM: string;
  SEARCH_RESULT_URL: string;
  TOP_10_POSTS: string[];
  NOT_TOP_10_POST: string;
  SCREENSHOT_PREFIX: string;
};

function cafeServiceSetUp(): NaverService {
  return NaverFactory.createCafeService(browser);
}

function getCafeServiceVariables(): ViewServiceTestVariables {
  return {
    SEARCH_TERM: '롯데 기프트카드',
    SEARCH_RESULT_URL:
      'https://search.naver.com/search.naver?where=article&query=%EB%A1%AF%EB%8D%B0%20%EA%B8%B0%ED%94%84%ED%8A%B8%EC%B9%B4%EB%93%9C',
    TOP_10_POSTS: [
      'https://cafe.naver.com/bookchildlove/1978681',
      'https://cafe.naver.com/joonggonara/1004755761',
    ],
    NOT_TOP_10_POST: 'https://cafe.naver.com/culturebloom/2062559',
    SCREENSHOT_PREFIX: 'cafe search result',
  };
}

function blogServiceSetUp(): NaverService {
  return NaverFactory.createBlogService(browser);
}

function getBlogServiceVariables(): ViewServiceTestVariables {
  return {
    SEARCH_TERM: 'SK매직',
    SEARCH_RESULT_URL:
      'https://search.naver.com/search.naver?where=blog&query=SK%EB%A7%A4%EC%A7%81',
    TOP_10_POSTS: [
      'https://blog.naver.com/gameland7979/223269961381',
      'https://blog.naver.com/mizztop/223241274049',
    ],
    NOT_TOP_10_POST: 'https://blog.naver.com/msj1823/223146227543',
    SCREENSHOT_PREFIX: 'blog search result',
  };
}
