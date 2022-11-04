import * as path from 'path';
import { InsScarpper } from './scrapper';
import { HashTag, URL } from './types';
import { isFulfilled, isRejected } from './util';

type observer = (percent: number) => void;

export type ScrapResult = {
  tag: string;
  screenshot: string;
};

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

  async scrap(hashTags: HashTag[], urls: URL[], screenshotDirectory: string) {
    this.total = hashTags.length;

    const scrapTasks = hashTags.map((tag, index) => {
      return async (): Promise<ScrapResult> => {
        try {
          const page = await this.scrapper.exploreHashTag(tag);
          Promise.allSettled(
            urls.map(async (url) => {
              const post = await this.scrapper.findPost(page, url);
              await this.scrapper.makeRedBorder(post);
            })
          );
          const screenshotPath = await this.scrapper.screenshot(
            page,
            path.join(screenshotDirectory, `/${index + 1}_${tag}.png`)
          );

          return {
            tag,
            screenshot: screenshotPath,
          };
        } finally {
          this.current++;
          this.progress();
        }
      };
    });

    const results = await Promise.allSettled(scrapTasks.map((task) => task()));

    return results.map(this.handleSettledResult);
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
