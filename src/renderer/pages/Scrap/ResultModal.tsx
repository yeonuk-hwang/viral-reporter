import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
} from '@chakra-ui/react';
import { ScrapResult } from 'main/instagram/scrapperManager';
import { invokeWithCustomErrors } from 'renderer/utils';

interface Props {
  scrapResult: ScrapResult[] | null;
  screenShotDir: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResultModal({
  scrapResult,
  isOpen,
  onClose,
  screenShotDir,
}: Props) {
  const openScreenshotDirectory = () => {
    if (screenShotDir) {
      invokeWithCustomErrors(() => window.api.OPEN_FILE(screenShotDir));
    }
  };

  const openScreenshot = (path: string) => {
    invokeWithCustomErrors(() => window.api.OPEN_FILE(path));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent width="80vw">
          <ModalHeader>스크랩 결과</ModalHeader>
          <ModalCloseButton />
          <ModalBody width="80vw">
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>키워드</Th>
                    <Th>인기게시물 포함 여부</Th>
                    <Th>스크린샷 경로</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {scrapResult?.map((result, index) => {
                    const { tag, isPopularPostIncluded, screenshot } = result;
                    return (
                      <Tr key={index}>
                        <Td>{tag}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              isPopularPostIncluded ? 'green' : 'red'
                            }
                            fontSize="14px"
                          >
                            {isPopularPostIncluded ? '포함' : '미포함'}
                          </Badge>
                        </Td>
                        <Td>
                          {screenshot && (
                            <Button
                              variant="link"
                              onClick={() => openScreenshot(screenshot)}
                            >
                              {screenshot}
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={openScreenshotDirectory}>
              스크린샷 폴더 열기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
