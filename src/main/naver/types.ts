import { ElementHandle, Page } from 'puppeteer';

export type ScreenshotFilePath = string;

export interface NaverService {
  search(keyword: string): Promise<Page>;
  findPosts(
    $searchPage: Page,
    postURL: string
  ): Promise<ElementHandle<HTMLLIElement>>;
  findPosts(
    $searchPage: Page,
    postURL: string[]
  ): Promise<ElementHandle<HTMLLIElement>[]>;
  makeRedBorder($element: ElementHandle<HTMLElement>): Promise<void>;
  screenshot(
    $searchPage: Page,
    screenshotDirectoryPath: string
  ): Promise<ScreenshotFilePath>;
  close(): Promise<void>;
}
