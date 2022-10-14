import * as path from 'path';
import { InsScarpper } from './scrapper';
import { ScrapTarget } from './types';
import { isFulfilled, isRejected } from './util';
import { CustomError } from '../errors';

type observer = (percent: number) => void;

interface ScrapResultBase {
  status: 'success' | 'fail';
  keyword: string;
  postURL: string;
}

export interface ScrapSuccessResult extends ScrapResultBase {
  screenshot: string;
}

export interface ScrapFailResult extends ScrapResultBase {
  reason: string;
}

export type ScrapResult = ScrapFailResult | ScrapSuccessResult;

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

  async scrap(scrapTargets: ScrapTarget[], screenshotDirectory: string) {
    this.total = scrapTargets.length;

    const scrapTasks = scrapTargets.map(({ keyword, url }, index) => {
      return async (): Promise<ScrapResult> => {
        try {
          const page = await this.scrapper.exploreHashTag(keyword);
          const post = await this.scrapper.findPost(page, url);
          const screenshotPath = await this.scrapper.screenshot(
            page,
            post,
            path.join(screenshotDirectory, `/${index}_${keyword}.png`)
          );

          return {
            keyword,
            postURL: url,
            status: 'success',
            screenshot: screenshotPath,
          };
        } catch (e) {
          if (e instanceof CustomError) {
            return {
              keyword,
              postURL: url,
              status: 'fail',
              reason: e.message,
            };
          }

          throw e;
        } finally {
          this.current++;
          this.progress();
        }
      };
    });

    const results = await Promise.allSettled(scrapTasks.map((task) => task()));

    return results.map(this.handleSettledResult);
  }

  private handleSettledResult(result: PromiseSettledResult<ScrapResultBase>) {
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
