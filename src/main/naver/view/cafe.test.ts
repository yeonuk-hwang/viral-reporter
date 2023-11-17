import { NaverViewService, NaverViewServiceImpl } from '.';

test('cafe service should search for cafes on naver with a given search term', async () => {
  const cafeService = await setUp();

  const page = await cafeService.search('페이즈');

  expect(page.url()).toBe(
    'https://search.naver.com/search.naver?where=article&query=%ED%8E%98%EC%9D%B4%EC%A6%88'
  );
});

async function setUp(): Promise<NaverViewService> {
  const NAVER_CAFE_VIEW_URL =
    'https://search.naver.com/search.naver?where=article';

  const cafeService = new NaverViewServiceImpl(browser, NAVER_CAFE_VIEW_URL);

  return cafeService;
}
