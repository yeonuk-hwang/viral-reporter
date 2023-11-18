import { NaverViewService, NaverViewServiceImpl } from '.';

jest.setTimeout(100000);

test('cafe service should search for cafes on naver with a given search term', async () => {
  const cafeService = await setUp();

  const page = await cafeService.search(SEARCH_TERM);

  expect(page.url()).toBe(
    'https://search.naver.com/search.naver?where=article&query=%EB%A1%AF%EB%8D%B0%20%EA%B8%B0%ED%94%84%ED%8A%B8%EC%B9%B4%EB%93%9C'
  );
});

test('cafe service should return post if a given post is in the top 10 posts', async () => {
  const cafeService = await setUp();

  const searchPage = await cafeService.search(SEARCH_TERM);

  const post = await cafeService.findPost(searchPage, TOP_10_POST);

  expect(post).toBeTruthy();
});

test('cafe service should throw Error if a given post is not in the top 10 posts', async () => {
  const cafeService = await setUp();

  const searchPage = await cafeService.search(SEARCH_TERM);

  await expect(() =>
    cafeService.findPost(searchPage, NOT_TOP_10_POST)
  ).rejects.toThrow('포스트가 존재하지 않습니다.');
});

async function setUp(): Promise<NaverViewService> {
  const NAVER_CAFE_VIEW_URL =
    'https://search.naver.com/search.naver?where=article';

  const cafeService = new NaverViewServiceImpl(browser, NAVER_CAFE_VIEW_URL);

  return cafeService;
}

const SEARCH_TERM = '롯데 기프트카드';
const TOP_10_POST = 'https://cafe.naver.com/bookchildlove/1978681';
const NOT_TOP_10_POST = 'https://cafe.naver.com/culturebloom/2062559';
