import { Input, Td, Tr, Text } from '@chakra-ui/react';
import React from 'react';

interface ScrapTableRowProps {
  index: number;
  onFocus: () => void;
  values: [keyword: string, url: string];
  handleChange: (xCoordinate: number, value: string) => void;
  handlePaste: (
    columnIndex: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => void;
}

export const ScrapTableRow: React.FC<ScrapTableRowProps> = ({
  index,
  onFocus,
  handleChange,
  handlePaste,
  values,
}) => {
  const [keyword, url] = values;

  const columns = [
    { type: 'text', value: keyword },
    { type: 'url', value: url },
  ];

  return (
    <Tr>
      <Td isNumeric>
        <Text fontWeight="semibold">{index + 1}</Text>
      </Td>
      {columns.map(({ type, value }, xCoordinate) => {
        return (
          <Td key={xCoordinate}>
            <Input
              type={type}
              value={value}
              onFocus={onFocus}
              onChange={(e) => handleChange(xCoordinate, e.target.value)}
              onPaste={(e) => handlePaste(xCoordinate, e)}
            />
          </Td>
        );
      })}
    </Tr>
  );
};
