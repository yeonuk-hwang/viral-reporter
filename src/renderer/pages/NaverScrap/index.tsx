import { Button } from '@chakra-ui/react';
import { Keyword, URL } from 'main/instagram/types';
import { Scrap } from '../../components/Scrap';
import { UseRequestScrapResult } from '../../components/Scrap/hooks/useRequestScrap';

export function NaverScrap() {
  return (
    <Scrap
      title="네이버 바이럴 리포팅"
      renderButtons={(
        requestScrap: UseRequestScrapResult['requestScrap'],
        keywords: Keyword[],
        urls: URL[],
        isLoading: UseRequestScrapResult['isLoading']
      ) => {
        return (
          <>
            <Button
              colorScheme="messenger"
              onClick={() =>
                requestScrap(window.api.NAVER_BLOG_SCRAP, keywords, urls)
              }
              isLoading={isLoading}
            >
              블로그 검색
            </Button>
            <Button
              colorScheme="messenger"
              onClick={() =>
                requestScrap(window.api.NAVER_INFLUENCER_SCRAP, keywords, urls)
              }
              isLoading={isLoading}
            >
              인플루언서 검색
            </Button>
            <Button
              colorScheme="messenger"
              onClick={() =>
                requestScrap(window.api.NAVER_CAFE_SCRAP, keywords, urls)
              }
              isLoading={isLoading}
            >
              카페 검색
            </Button>
          </>
        );
      }}
    ></Scrap>
  );
}
