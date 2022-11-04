import { Input, Td, Tr, Text } from '@chakra-ui/react';
import React from 'react';

interface ScrapTableRowProps {
  index: number;
  onFocus: () => void;
  values: string[];
  handleInput: (x: number, value: string) => void;
  handlePaste: (x: number, e: React.ClipboardEvent<HTMLInputElement>) => void;
}

export const ScrapTableRow: React.FC<ScrapTableRowProps> = ({
  index,
  onFocus,
  handleInput,
  handlePaste,
  values,
}) => {
  const [hastTag, url] = values;

  const inputAttr = [
    { type: 'text', value: hastTag },
    { type: 'url', value: url },
  ];

  return (
    <Tr>
      <Td isNumeric>
        <Text fontWeight="semibold">{index + 1}</Text>
      </Td>
      {inputAttr.map((attr, index) => {
        return (
          <Td key={index}>
            <Input
              {...attr}
              onFocus={onFocus}
              onChange={(e) => handleInput(index, e.target.value)}
              onPaste={(e) => handlePaste(index, e)}
            />
          </Td>
        );
      })}
    </Tr>
  );
};
