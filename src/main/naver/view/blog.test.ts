import { NaverViewService, NaverViewServiceImpl } from '.';

jest.setTimeout(100000);

test('blog service should search for blogs on naver with a given search term', async () => {
  const blogService = await setUp();

  const page = await blogService.search(SEARCH_TERM);

  expect(page.url()).toBe(
    'https://search.naver.com/search.naver?where=blog&query=SK%EB%A7%A4%EC%A7%81'
  );
});

test('blog service should return post if a given post is in the top 10 posts', async () => {
  const blogService = await setUp();

  const searchPage = await blogService.search(SEARCH_TERM);

  const post = await blogService.findPost(searchPage, TOP_10_POST);

  expect(post).toBeTruthy();
});

test('blog service should throw Error if a given post is not in the top 10 posts', async () => {
  const blogService = await setUp();

  const searchPage = await blogService.search(SEARCH_TERM);

  await expect(() =>
    blogService.findPost(searchPage, NOT_TOP_10_POST)
  ).rejects.toThrow('포스트가 존재하지 않습니다.');
});

async function setUp(): Promise<NaverViewService> {
  const NAVER_BLOG_VIEW_URL =
    'https://search.naver.com/search.naver?where=blog';

  const blogService = new NaverViewServiceImpl(browser, NAVER_BLOG_VIEW_URL);

  return blogService;
}

const SEARCH_TERM = 'SK매직';
const TOP_10_POST = 'https://blog.naver.com/gameland7979/223264709469';
const NOT_TOP_10_POST = 'https://blog.naver.com/msj1823/223146227543';
