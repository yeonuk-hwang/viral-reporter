import * as path from 'path';
import { mkdir } from 'fs/promises';
import moment from 'moment';
import { InsScarpper } from './scrapper';
import { Keyword, URL } from './types';
import { isFulfilled, isRejected } from './util';
import { ScrapResult } from 'main/@types/scrap';
import { removeCRLFCase } from '../util';

type observer = (percent: number) => void;

export class ScrapperManager {
  private scrapper: InsScarpper;
  private total: number;
  private current: number;
  private observers: observer[];

  constructor(scrapper: InsScarpper) {
    this.scrapper = scrapper;
    this.total = 0;
    this.current = 0;
    this.observers = [];
  }

  async login(userName: string, password: string) {
    await this.scrapper.login(userName, password);
  }

  async scrap(keywords: Keyword[], urls: URL[], screenshotDirectory: string) {
    const sanitizedKeywords = keywords.map(removeCRLFCase).filter(Boolean);
    const sanitizedUrls = urls.map(removeCRLFCase).filter(Boolean);

    this.total = sanitizedKeywords.length;

    const currentTimeDirectory = path.join(
      screenshotDirectory,
      moment().format('YYYY-MM-DDTHH-mm-ss')
    );

    await mkdir(currentTimeDirectory, { recursive: true });

    const scrapTasks = sanitizedKeywords.map((tag, index) => {
      return async (): Promise<ScrapResult> => {
        try {
          const page = await this.scrapper.exploreHashTag(tag);

          const findResults = await Promise.all(
            sanitizedUrls.map(async (url) => {
              const post = await this.scrapper.findPost(page, url);
              if (post) {
                await this.scrapper.makeRedBorder(post);
                return post;
              } else {
                return null;
              }
            })
          );

          if (findResults.some((post) => post !== null)) {
            const screenshotPath = await this.scrapper.screenshot(
              page,
              path.join(currentTimeDirectory, `/${index + 1}_${tag}.png`)
            );

            return {
              tag,
              isPopularPostIncluded: true,
              screenshot: screenshotPath,
            };
          }

          return {
            tag,
            isPopularPostIncluded: false,
            screenshot: null,
          };
        } finally {
          this.current++;
          this.progress();
        }
      };
    });

    const results = [];

    for (const task of scrapTasks) {
      const result = await task();
      results.push(result);
    }

    return {
      directory: currentTimeDirectory,
      result: results,
    };
  }

  progress() {
    this.observers.forEach((observer) => {
      const percent = (this.current / this.total) * 100;
      observer(percent);
    });
  }

  onProgress(observer: (percent: number) => void): void {
    this.observers.push(observer);
  }

  close() {
    this.scrapper.close();
  }
}
