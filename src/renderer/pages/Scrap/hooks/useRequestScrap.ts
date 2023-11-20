import { useState } from 'react';
import { ScrapResult } from 'main/instagram/scrapperManager';
import { invokeWithCustomErrors } from 'renderer/utils';
import { Keyword, URL } from 'main/instagram/types';

interface UseRequestScrapResult {
  requestScrap(hashTags: Keyword[], urls: URL[]): void;
  result: ScrapResult[] | null;
  screenShotDir: string | null;
  isLoading: boolean;
}
export const useRequestScrap = (): UseRequestScrapResult => {
  const [result, setResult] = useState<ScrapResult[] | null>(null);
  const [screenShotDir, setScreenShotDir] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestScrap = async (hashTags: Keyword[], urls: URL[]) => {
    try {
      setIsLoading(true);
      const { directory, result } = await invokeWithCustomErrors(() =>
        window.api.SCRAP(hashTags, urls)
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
