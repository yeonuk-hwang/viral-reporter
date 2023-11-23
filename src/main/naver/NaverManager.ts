import path from 'path';
import { mkdir } from 'fs/promises';
import { NaverService } from 'main/naver/types';
import moment from 'moment';
import { Keyword, URL } from '../instagram/types';
import { isFulfilled, isRejected } from '../instagram/util';
import { ScrapResult } from 'main/@types/scrap';

// TODO: NaverManager, ScrapperManager 하나로 합치기
// 중복되는 로직 대다수, InsScrapper와 NaverService의 Interface만 통합한다면 가능
export class NaverManager {
  private naverService: NaverService;

  constructor(naverService: NaverService) {
    this.naverService = naverService;
  }

  async scrap(keywords: Keyword[], urls: URL[], screenshotDirectory: string) {
    const currentTimeDirectory = path.join(
      screenshotDirectory,
      moment().format('YYYY-MM-DDTHH-mm-ss')
    );

    await mkdir(currentTimeDirectory, { recursive: true });

    const scrapTasks = keywords.map((keyword, index) => {
      return async (): Promise<ScrapResult> => {
        const page = await this.naverService.search(keyword);
        console.group('keyword', keyword);

        try {
          const findResults = await Promise.allSettled(
            urls.map(async (url) => {
              const post = await this.naverService.findPosts(page, url);
              await this.naverService.makeRedBorder(post);
            })
          );

          if (findResults.some(({ status }) => status === 'fulfilled')) {
            const screenshotPath = await this.naverService.screenshot(
              page,
              path.join(currentTimeDirectory, `/${index + 1}_${keyword}`)
            );

            console.groupEnd();

            return {
              tag: keyword,
              isPopularPostIncluded: true,
              screenshot: screenshotPath,
            };
          } else {
            return {
              tag: keyword,
              isPopularPostIncluded: false,
              screenshot: null,
            };
          }
        } finally {
          // TODO: delete
          // page.close();
        }
      };
    });

    const scrapResults = [];

    for (const scrapTask of scrapTasks) {
      try {
        const result = await scrapTask();

        const fulfilledResult: PromiseFulfilledResult<ScrapResult> = {
          status: 'fulfilled',
          value: result,
        };

        scrapResults.push(fulfilledResult);
      } catch (e) {
        const rejectedResult: PromiseRejectedResult = {
          status: 'rejected',
          reason: e,
        };

        scrapResults.push(rejectedResult);
      }
    }

    return {
      directory: currentTimeDirectory,
      result: scrapResults.map(this.handleSettledResult),
    };
  }

  private handleSettledResult<T>(result: PromiseSettledResult<T>) {
    if (isRejected(result)) throw result.reason;

    if (isFulfilled(result)) return result.value;
  }
}
