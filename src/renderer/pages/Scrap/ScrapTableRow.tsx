import { Input, Td, Tr, Text } from '@chakra-ui/react';
import React from 'react';

interface ScrapTableRowProps {
  index: number;
  onFocus: () => void;
  values: [keyword: string, url: string];
  handleChange: (columnIndex: number, value: string) => void;
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
      {columns.map(({ type, value }, columnIndex) => {
        return (
          <Td key={columnIndex}>
            <Input
              type={type}
              value={value}
              onFocus={onFocus}
              onChange={(e) => handleChange(columnIndex, e.target.value)}
              onPaste={(e) => handlePaste(columnIndex, e)}
            />
          </Td>
        );
      })}
    </Tr>
  );
};
