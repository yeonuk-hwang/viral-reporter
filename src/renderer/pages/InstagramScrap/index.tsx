import { Button } from '@chakra-ui/react';
import { Keyword, URL } from 'main/instagram/types';
import { Scrap } from '../Scrap';
import { UseRequestScrapResult } from '../Scrap/hooks/useRequestScrap';

export function InstagramScrap() {
  return (
    <Scrap
      renderButtons={(
        requestScrap: UseRequestScrapResult['requestScrap'],
        keywords: Keyword[],
        urls: URL[],
        isLoading: UseRequestScrapResult['isLoading']
      ) => {
        return (
          <Button
            flex="0.1"
            colorScheme="messenger"
            onClick={() => requestScrap(window.api.SCRAP, keywords, urls)}
            isLoading={isLoading}
          >
            스크랩
          </Button>
        );
      }}
    ></Scrap>
  );
}
