import { app } from 'electron';
import puppeteer from 'puppeteer';
import { InsScarpperImpl } from './scrapper';
import { ScrapperManager } from './scrapperManager';

export async function makeScrapper() {
  const CHROME_PATHS: Partial<Record<typeof process.platform, string>> = {
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  };

  const browser = await puppeteer.launch({
    args: ['--disk-cache-size=0', '--lang=en-US', '--no-sandbox'],
    executablePath: CHROME_PATHS[process.platform],
  });

  const scrapper = new InsScarpperImpl(browser);
  const manager = new ScrapperManager(scrapper);

  return manager;
}
