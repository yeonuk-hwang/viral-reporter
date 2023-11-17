import { Browser, Page } from 'puppeteer';

export interface NaverViewService {
  search(keyword: string): Promise<Page>;
  close(): Promise<void>;
}

export class NaverViewServiceImpl implements NaverViewService {
  private browser: Browser;
  private baseURL: string;

  constructor(browser: Browser, baseURL: string) {
    this.browser = browser;
    this.baseURL = baseURL;
  }

  async search(keyword: string): Promise<Page> {
    const page = await this.browser.newPage();

    await page.goto(encodeURI(this.baseURL + `&query=${keyword}`), {
      // 페이지의 모든 컨텐츠가 로드될 때까지 대기하기 위한 옵션, 0.5초동안 네트워크 요청이 없을때까지 기다린다.
      waitUntil: 'networkidle0',
      // disable timeout
      timeout: 0,
    });

    return page;
  }

  async close() {
    return this.browser.close();
  }
}
