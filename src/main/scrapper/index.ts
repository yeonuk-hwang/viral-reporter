import { InsScarpperImpl } from './scrapper';
import { ScrapperManager } from './scrapperManager';

export async function makeScrapper() {
  const PCR = require('puppeteer-chromium-resolver');
  const option = {
    revision: '',
    detectionPath: '',
    folderName: '.chromium-browser-snapshots',
    defaultHosts: [
      'https://storage.googleapis.com',
      'https://npm.taobao.org/mirrors',
    ],
    hosts: [],
    cacheRevisions: 2,
    retry: 3,
    silent: false,
  };
  const stats = await PCR(option);
  const browser = await stats.puppeteer.launch({
    args: ['--disk-cache-size=0', '--lang=en-US', '--no-sandbox'],
    executablePath: stats.executablePath,
  });

  const scrapper = new InsScarpperImpl(browser);
  const manager = new ScrapperManager(scrapper);

  return manager;
}
