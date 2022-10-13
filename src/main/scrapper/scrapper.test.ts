import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser } from 'puppeteer';
import * as dotenv from 'dotenv';
import { INSTAGRAM_URL } from './constants';
import { InsScarpperImpl } from './scrapper';
import { getError, NoErrorThrownError } from './util';
import {
  DeactivatedIDError,
  ERROR_NAMES,
  InvalidUserNameOrPasswordError,
  PostNotExistError,
  PostURLisNotValid,
} from './errors';

(function config() {
  dotenv.config({
    path: '.env.test',
  });

  jest.setTimeout(100000);
})();

describe('Instagram Scrapper', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--disk-cache-size=0'],
    });
  });

  afterAll(() => {
    browser.close();
  });

  describe('login', () => {
    let browser: Browser;

    beforeEach(async () => {
      browser = await puppeteer.launch({
        args: ['--disk-cache-size=0'],
      });
    });

    afterEach(() => {
      browser.close();
    });

    test('login with valid username and password', async () => {
      const { TEST_ID, TEST_PW } = process.env;

      const scrapper = new InsScarpperImpl(browser);
      await scrapper.login(TEST_ID!, TEST_PW!);

      expect(true).toBe(true);
    });

    test('login with invalid username and password', async () => {
      const scrapper = new InsScarpperImpl(browser);

      const error = await getError<InvalidUserNameOrPasswordError>(() =>
        scrapper.login('asdfasdf', '12341234')
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(InvalidUserNameOrPasswordError);
      expect(error.name).toBe(ERROR_NAMES.InvalidUserNameOrPasswordError);
    });

    test('login with deactive ID', async () => {
      const { TEST_DEACTIVE_ID, TEST_DEACTIVE_PW } = process.env;

      const scrapper = new InsScarpperImpl(browser);
      const error = await getError<DeactivatedIDError>(() =>
        scrapper.login(TEST_DEACTIVE_ID!, TEST_DEACTIVE_PW!)
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(DeactivatedIDError);
      expect(error.name).toBe(ERROR_NAMES.DeactivatedIDError);
    });
  });

  test('explore hashTag', async () => {
    const scrapper = new InsScarpperImpl(browser);

    const hashTag = '판다';
    const page = await scrapper.exploreHashTag(hashTag);

    expect(page.url()).toBe(encodeURI(INSTAGRAM_URL.EXPLORE + hashTag + '/'));
  });

  describe('findPost', () => {
    test(`find post with FULL URL(contain "\")`, async () => {
      const scrapper = new InsScarpperImpl(browser);

      const page = await browser.newPage();

      const POST_URL = '/p/Ci9UV8wPwsu/';
      const FULL_URL = 'https://www.instagram.com' + POST_URL;

      const body = await page.$('body');

      await body?.evaluate((body) => {
        body.innerHTML = `
          <a href="/p/Ci9UV8wPwsu/"></a>
        `;
      });

      const result = await scrapper.findPost(page, FULL_URL);

      expect(result).toBeTruthy();
    });

    test(`find post with URL(without "\")`, async () => {
      const scrapper = new InsScarpperImpl(browser);

      const page = await browser.newPage();

      const POST_URL = '/p/Ci9UV8wPwsu';
      const FULL_URL = 'https://www.instagram.com' + POST_URL;

      const body = await page.$('body');

      await body?.evaluate((body) => {
        body.innerHTML = `
          <a href="/p/Ci9UV8wPwsu/"></a>
        `;
      });

      const result = await scrapper.findPost(page, FULL_URL);

      expect(result).toBeTruthy();
    });

    test(`throw Error if post is not exist`, async () => {
      const scrapper = new InsScarpperImpl(browser);

      const page = await browser.newPage();

      const POST_URL = '/p/Ci9UV8wPwsu/';
      const FULL_URL = 'https://www.instagram.com' + POST_URL;

      const body = await page.$('body');

      await body?.evaluate((body) => {
        body.innerHTML = `
          <a href="not exist"></a>
        `;
      });

      const error = await getError<Error>(() =>
        scrapper.findPost(page, FULL_URL)
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(PostNotExistError);
      expect(error.message).toBe(`포스트가 존재하지 않습니다: ${FULL_URL}`);
      expect(error.name).toBe(ERROR_NAMES.PostNotExistError);
    });

    test(`throw Error if post url is not valid`, async () => {
      const scrapper = new InsScarpperImpl(browser);

      const page = await browser.newPage();

      const POST_URL = '/abc1';
      const FULL_URL = 'https://www.instagram.com' + POST_URL;

      const body = await page.$('body');

      await body?.evaluate((body) => {
        body.innerHTML = `
          <a href="not exist"></a>
        `;
      });

      const error = await getError<Error>(() =>
        scrapper.findPost(page, FULL_URL)
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(PostURLisNotValid);
      expect(error.message).toBe(`잘못된 형식의 포스트 URL입니다: ${FULL_URL}`);
      expect(error.name).toBe(ERROR_NAMES.PostURLisNotValid);
    });
  });

  test('take a screenshot', async () => {
    const scrapper = new InsScarpperImpl(browser);
    const page = await browser.newPage();
    const body = await page.$('body');

    await body?.evaluate((body) => {
      body.innerHTML = `
        <a href="/p/abc123/">
           <div>포스트</div>
        </a>
      `;
    });

    const post = await scrapper.findPost(page, INSTAGRAM_URL.ROOT + 'p/abc123');

    const screenshotPath = './testScreenshot.png';
    await scrapper.screenshot(page, post, screenshotPath);

    const fullScreenshotPath = path.join(process.cwd(), screenshotPath);
    const screenshotExist = fs.existsSync(fullScreenshotPath);
    expect(screenshotExist).toBe(true);

    const closeBtn = await page.$(`[aria-label="Close"]`);
    expect(closeBtn).toBeNull();
  });
});
