import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Progress,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useScrapTargets } from './hooks/useScrapTargets';
import { ScrapTableRow } from './ScrapTableRow';
import {
  useRequestScrap,
  UseRequestScrapResult,
} from './hooks/useRequestScrap';
import { ResultModal } from './ResultModal';
import { Keyword } from 'main/instagram/types';

type ScrapProps = {
  title: string;
  renderButtons(
    requestScrap: UseRequestScrapResult['requestScrap'],
    keywords: Keyword[],
    urls: string[],
    isLoading: UseRequestScrapResult['isLoading']
  ): React.ReactElement;
};

export function Scrap({ title, renderButtons }: ScrapProps) {
  const {
    scrapTargets,
    resetScrapTargets,
    saveScrapTargets,
    appendNewRow,
    keywords,
    urls,
    setScrapTargetsFromPaste: setScrapTragetsFromPaste,
  } = useScrapTargets();

  const { requestScrap, isLoading, result, screenShotDir } = useRequestScrap();

  const [showResult, setShowResult] = useState(false);
  const closeResult = () => setShowResult(false);

  const appendNewRowIfItIsLastRow = (yCoordinateOfRow: number) => {
    const isLastRow = yCoordinateOfRow === scrapTargets.length - 1;

    if (isLastRow) {
      appendNewRow();
    }
  };

  useEffect(() => {
    if (result && !isLoading) {
      setShowResult(true);
    }
  }, [isLoading, result]);

  return (
    <>
      <Box
        display="flex"
        flexDir="column"
        alignItems="center"
        paddingTop="20px"
        paddingX="5vw"
      >
        <Box width="100%" display="flex" justifyContent="space-between">
          <Heading marginBottom="30px">{title}</Heading>
          <Button colorScheme="red" onClick={resetScrapTargets}>
            입력값 초기화
          </Button>
        </Box>
        <Flex
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="20px"
          gap="10px"
        >
          <Progress flex="1" size="lg" hasStripe isIndeterminate={isLoading} />
          {renderButtons(requestScrap, keywords, urls, isLoading)}
        </Flex>
        <Box width="100%" border="1px solid #dbdbdb">
          <Box height="70vh" overflow="scroll">
            <TableContainer>
              <Table variant="simple" size="lg">
                <Thead>
                  <Tr>
                    <Th width="10%" isNumeric>
                      순번
                    </Th>
                    <Th width="30%">태그</Th>
                    <Th width="50%">포스트 URL</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {scrapTargets.map((scrapTarget, yCoordinate) => (
                    <ScrapTableRow
                      key={yCoordinate}
                      index={yCoordinate}
                      values={scrapTarget}
                      onFocus={() => appendNewRowIfItIsLastRow(yCoordinate)}
                      handleChange={(xCoordinate: number, value: string) => {
                        saveScrapTargets([xCoordinate, yCoordinate], value);
                      }}
                      handlePaste={(
                        xCoordinate: number,
                        e: React.ClipboardEvent<HTMLInputElement>
                      ) => {
                        setScrapTragetsFromPaste([xCoordinate, yCoordinate], e);
                      }}
                    />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
      <ResultModal
        screenShotDir={screenShotDir}
        scrapResult={result}
        isOpen={showResult}
        onClose={closeResult}
      />
    </>
  );
}
