import { Button, Input, Td, Tr, Text } from '@chakra-ui/react';
import { ScrapTarget } from 'main/scrapper/types';
import React from 'react';

interface ScrapTableRowProps {
  index: number;
  onFocus: () => void;
  values: ScrapTarget;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteRow: () => void;
}

export const ScrapTableRow = React.forwardRef<
  HTMLTableRowElement,
  ScrapTableRowProps
>(({ index, onFocus, handleInput, deleteRow }, ref) => {
  return (
    <Tr ref={ref}>
      <Td isNumeric>
        <Text fontWeight="semibold">{index}</Text>
      </Td>
      <Td>
        <Input
          type="text"
          name="keyword"
          onFocus={onFocus}
          onChange={handleInput}
        />
      </Td>
      <Td>
        <Input type="url" name="url" onFocus={onFocus} onChange={handleInput} />
      </Td>
      <Td>
        <Button size="sm" colorScheme="red" onClick={deleteRow}>
          삭제
        </Button>
      </Td>
    </Tr>
  );
});
