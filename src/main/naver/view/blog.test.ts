import { NaverViewService, NaverViewServiceImpl } from '.';

test('blog service should search for blogs on naver with a given search term', async () => {
  const blogService = await setUp();

  const page = await blogService.search('SK매직');

  expect(page.url()).toBe(
    'https://search.naver.com/search.naver?where=blog&query=SK%EB%A7%A4%EC%A7%81'
  );
});

async function setUp(): Promise<NaverViewService> {
  const NAVER_BLOG_VIEW_URL =
    'https://search.naver.com/search.naver?where=blog';

  const blogService = new NaverViewServiceImpl(browser, NAVER_BLOG_VIEW_URL);

  return blogService;
}
