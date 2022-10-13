import { InsScarpper } from "./scrapper";
import { ScrapTarget } from "./types";
import { CustomError, PostNotExistError, PostURLisNotValid } from "./errors";
import { isFulfilled, isRejected } from "./util";

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

  async scrap(scrapTargets: ScrapTarget[]) {
    this.total = scrapTargets.length;

    const scrapTasks = scrapTargets.map(({ keyword, url }) => {
      return async () => {
        try {
          const page = await this.scrapper.exploreHashTag(keyword);
          const post = await this.scrapper.findPost(page, url);
          const screenshotPath = await this.scrapper.screenshot(
            page,
            post,
            `./${keyword}.png`
          );

          return `인기게시물에 포스트가 존재합니다. 키워드:${keyword}, 스크린샷 경로:${screenshotPath}`;
        } finally {
          this.current++;
          this.progress();
        }
      };
    });

    const results = await Promise.allSettled(scrapTasks.map((task) => task()));

    this.scrapper.close();

    return results.map(this.handleSettledResult.bind(this));
  }

  private handleSettledResult(result: PromiseSettledResult<string>) {
    if (isRejected(result)) return this.handleCustomError(result);

    if (isFulfilled(result)) return result.value;
  }

  private handleCustomError({ reason }: PromiseRejectedResult) {
    if (reason instanceof CustomError) {
      return reason.message;
    }

    throw reason;
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
}
