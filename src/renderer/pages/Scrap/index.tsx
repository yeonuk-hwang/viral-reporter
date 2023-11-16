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
    makeNewTargets,
    keywords,
    urls,
    setScrapTragetsFromPaste,
  } = useScrapTargets();
  const { requestScrap, isLoading, result, screenShotDir } = useRequestScrap();
  const [showResult, setShowResult] = useState(false);
  const closeResult = () => setShowResult(false);

  const scrap = () => requestScrap(keywords, urls);

  useEffect(() => {
    if (result && !isLoading) {
      setShowResult(true);
    }
  }, [isLoading, result]);

  return (
    <>
      <Box
        width="100vw"
        height="100vh"
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
                  {scrapTargets.map((scrapTarget, index) => (
                    <ScrapTableRow
                      key={index}
                      index={index}
                      values={scrapTarget}
                      onFocus={() => makeNewTargets(index)}
                      handleChange={(x: number, value: string) => {
                        saveScrapTargets([x, index], value);
                      }}
                      handlePaste={(
                        x: number,
                        e: React.ClipboardEvent<HTMLInputElement>
                      ) => {
                        setScrapTragetsFromPaste([x, index], e);
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
