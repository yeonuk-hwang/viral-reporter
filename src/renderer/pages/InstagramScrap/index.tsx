import { Button } from '@chakra-ui/react';
import { Keyword, URL } from 'main/instagram/types';
import { Scrap } from '../../components/Scrap';
import { UseRequestScrapResult } from '../../components/Scrap/hooks/useRequestScrap';

export function InstagramScrap() {
  return (
    <Scrap
      title="인스타그램 바이럴 리포팅"
      renderButtons={(
        requestScrap: UseRequestScrapResult['requestScrap'],
        keywords: Keyword[],
        urls: URL[],
        isLoading: UseRequestScrapResult['isLoading']
      ) => {
        return (
          <Button
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
