import * as path from 'path';
import * as fs from 'fs';
import { mkdir } from 'fs/promises';
import moment from 'moment';
import { InsScarpper } from './scrapper';
import { Keyword, URL } from './types';
import { isFulfilled, isRejected } from './util';
import { ScrapResult } from 'main/@types/scrap';

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

  async scrap(hashTags: Keyword[], urls: URL[], screenshotDirectory: string) {
    this.total = hashTags.length;

    const currentTimeDirectory = path.join(
      screenshotDirectory,
      moment().format('YYYY-MM-DDTHH-mm-ss')
    );

    await mkdir(currentTimeDirectory, { recursive: true });

    const scrapTasks = hashTags.map((tag, index) => {
      return async (): Promise<ScrapResult> => {
        try {
          const page = await this.scrapper.exploreHashTag(tag);
          const findResults = await Promise.allSettled(
            urls.map(async (url) => {
              const post = await this.scrapper.findPost(page, url);
              await this.scrapper.makeRedBorder(post);
            })
          );

          if (findResults.some(({ status }) => status === 'fulfilled')) {
            const screenshotPath = await this.scrapper.screenshot(
              page,
              path.join(currentTimeDirectory, `/${index + 1}_${tag}.png`)
            );

            return {
              tag,
              isPopularPostIncluded: true,
              screenshot: screenshotPath,
            };
          } else {
            return {
              tag,
              isPopularPostIncluded: false,
              screenshot: null,
            };
          }
        } finally {
          this.current++;
          this.progress();
        }
      };
    });

    const results = await Promise.allSettled(scrapTasks.map((task) => task()));

    return {
      directory: currentTimeDirectory,
      result: results.map(this.handleSettledResult),
    };
  }

  private handleSettledResult<T>(result: PromiseSettledResult<T>) {
    if (isRejected(result)) throw result.reason;

    if (isFulfilled(result)) return result.value;
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
