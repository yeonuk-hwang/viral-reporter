import * as path from 'path';
import * as fs from 'fs';
import { NaverViewService } from '.';
import { NaverFactory } from './naverFactory';

jest.setTimeout(100000);

test('cafe service should search for cafes on naver with a given search term', async () => {
  const cafeService = setUp();

  const page = await cafeService.search(SEARCH_TERM);

  expect(page.url()).toBe(
    'https://search.naver.com/search.naver?where=article&query=%EB%A1%AF%EB%8D%B0%20%EA%B8%B0%ED%94%84%ED%8A%B8%EC%B9%B4%EB%93%9C'
  );
});

test('cafe service should return post if a given post is in the top 10 posts', async () => {
  const cafeService = setUp();

  const searchPage = await cafeService.search(SEARCH_TERM);

  const post = await cafeService.findPost(searchPage, TOP_10_POST);

  expect(post).toBeTruthy();
});

test('cafe service should throw Error if a given post is not in the top 10 posts', async () => {
  const cafeService = setUp();

  const searchPage = await cafeService.search(SEARCH_TERM);

  await expect(() =>
    cafeService.findPost(searchPage, NOT_TOP_10_POST)
  ).rejects.toThrow('포스트가 존재하지 않습니다.');
});

test('cafe service should make red border to a given post', async () => {
  const cafeService = setUp();

  const searchPage = await cafeService.search(SEARCH_TERM);

  const post = await cafeService.findPost(searchPage, TOP_10_POST);

  await cafeService.makeRedBorder(post);

  expect(post.evaluate((post) => post.style.outline)).resolves.toBe(
    'red solid 5px'
  );
});

test('cafe service should be able to screenshot popular post page', async () => {
  const cafeService = setUp();

  const searchPage = await cafeService.search(SEARCH_TERM);

  const post = await cafeService.findPost(searchPage, TOP_10_POST);

  await cafeService.makeRedBorder(post);

  const TEST_SCREENSHOT_PATH = path.join(process.cwd(), 'test_screenshot');

  const screenShotFilePath = cafeService.screenshot(page, TEST_SCREENSHOT_PATH);

  expect(fs.existsSync(screenShotFilePath)).toBeTrue();
});

function setUp(): NaverViewService {
  return NaverFactory.createCafeService(browser);
}

const SEARCH_TERM = '롯데 기프트카드';
const TOP_10_POST = 'https://cafe.naver.com/bookchildlove/1978681';
const NOT_TOP_10_POST = 'https://cafe.naver.com/culturebloom/2062559';
