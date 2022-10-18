import puppeteer from 'puppeteer';
import { InsScarpperImpl } from './scrapper';
import { ScrapperManager } from './scrapperManager';

export async function makeScrapper() {
  const browser = await puppeteer.launch({
    args: ['--disk-cache-size=0', '--lang=en-US', '--no-sandbox'],
  });

  const scrapper = new InsScarpperImpl(browser);
  const manager = new ScrapperManager(scrapper);

  return manager;
}
