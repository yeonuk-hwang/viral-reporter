import { useState } from 'react';
import { invokeWithCustomErrors } from 'renderer/utils';
import { Keyword, URL } from 'main/instagram/types';
import { ScrapResult } from 'main/@types/scrap';

export interface UseRequestScrapResult {
  requestScrap(
    scrapAPI: Window['api']['SCRAP'],
    keywords: Keyword[],
    urls: URL[]
  ): void;
  result: ScrapResult[] | null;
  screenShotDir: string | null;
  isLoading: boolean;
}

export const useRequestScrap = (): UseRequestScrapResult => {
  const [result, setResult] = useState<ScrapResult[] | null>(null);

  const [screenShotDir, setScreenShotDir] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestScrap = async (
    scrapAPI: Window['api']['SCRAP'],
    hashTags: Keyword[],
    urls: URL[]
  ) => {
    try {
      setIsLoading(true);

      const { directory, result } = await invokeWithCustomErrors(() =>
        scrapAPI(hashTags, urls)
      );
      setResult(result);
      setScreenShotDir(directory);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestScrap,
    screenShotDir,
    result,
    isLoading,
  };
};
