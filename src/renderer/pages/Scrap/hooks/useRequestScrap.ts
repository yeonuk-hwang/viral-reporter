import { useState } from 'react';
import { ScrapResult } from 'main/scrapper/scrapperManager';
import { ScrapTarget } from 'main/scrapper/types';
import { invokeWithCustomErrors } from 'renderer/utils';

interface UseRequestScrapResult {
  requestScrap(scrapTargets: ScrapTarget[]): void;
  result: ScrapResult[] | null;
  isLoading: boolean;
}
export const useRequestScrap = (): UseRequestScrapResult => {
  const [result, setResult] = useState<ScrapResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestScrap = async (scrapTargets: ScrapTarget[]) => {
    try {
      const targetsWithoutEmpty = scrapTargets.filter(
        ({ keyword, url }) => keyword && url
      );

      setIsLoading(true);
      const result = await invokeWithCustomErrors(() =>
        window.api.SCRAP(targetsWithoutEmpty)
      );
      setResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestScrap,
    result,
    isLoading,
  };
};
