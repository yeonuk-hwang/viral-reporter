import { useEffect, useState } from 'react';
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
import { useRequestScrap } from './hooks/useRequestScrap';
import { ResultModal } from './ResultModal';

export function Scrap() {
  const {
    scrapTargets,
    saveScrapTargets,
    appendNewRow,
    keywords,
    urls,
    setScrapTragetsFromPaste,
  } = useScrapTargets();

  const { requestScrap, isLoading, result, screenShotDir } = useRequestScrap();

  const [showResult, setShowResult] = useState(false);
  const closeResult = () => setShowResult(false);

  const scrap = () => requestScrap(keywords, urls);

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
        <Heading marginBottom="30px">스크랩</Heading>
        <Flex
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="20px"
        >
          <Progress
            flex="0.85"
            size="lg"
            hasStripe
            isIndeterminate={isLoading}
          />
          <Button
            flex="0.1"
            colorScheme="messenger"
            onClick={scrap}
            isLoading={isLoading}
          >
            스크랩
          </Button>
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
