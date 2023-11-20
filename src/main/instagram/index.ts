import { NaverFactory } from 'main/naver/NaverFactory';
import { NaverManager } from 'main/naver/NaverManager';
import puppeteer from 'puppeteer';
import { InsScarpperImpl } from './scrapper';
import { ScrapperManager } from './scrapperManager';

export async function makeScrappers(executablePath?: string) {
  const browser = await puppeteer.launch({
    args: ['--disk-cache-size=0', '--lang=en-US', '--no-sandbox'],
    defaultViewport: null,
    executablePath,
  });

  const instagramScrapper = new InsScarpperImpl(browser);
  const instagramManager = new ScrapperManager(instagramScrapper);

  const cafeService = NaverFactory.createCafeService(browser);
  const naverCafeManager = new NaverManager(cafeService);

  const blogService = NaverFactory.createBlogService(browser);
  const naverBlogManager = new NaverManager(blogService);

  const influencerService = NaverFactory.createInfluencer(browser);
  const naverInfluencerManager = new NaverManager(influencerService);

  return {
    instagramManager,
    naverCafeManager,
    naverBlogManager,
    naverInfluencerManager,
  };
}
