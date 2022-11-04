import { useState } from 'react';

type X = number;
type Y = number;
type Point = [X, Y];

interface UseScrapTargetsReturn {
  scrapTargets: string[][];
  hashTags: string[];
  urls: string[];
  saveScrapTargets(point: Point, value: string): void;
  makeNewTargets(index: number): void;
  setScrapTragetsFromPaste(
    [startX, startY]: Point,
    e: React.ClipboardEvent<HTMLInputElement>
  ): void;
}

export const useScrapTargets = (): UseScrapTargetsReturn => {
  const [scrapTargets, setScrapTragets] = useState(makeInitialScrapTargets);

  const saveScrapTargets = ([x, y]: Point, value: string) => {
    setScrapTragets((prev) => {
      const result = [...prev];
      result[y][x] = value;
      return result;
    });
  };

  const makeNewTargets = (index: number) => {
    if (index === scrapTargets.length - 1) {
      setScrapTragets((prev) => [...prev, ['', '']]);
    }
  };

  const hashTags = scrapTargets.map(([tag]) => tag).filter(Boolean);
  const urls = scrapTargets.map(([_, url]) => url).filter(Boolean);

  const setScrapTragetsFromPaste = (
    [startX, startY]: Point,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const textData = e.clipboardData.getData('text');
    const rows = textData.split('\n');
    const isTextDataMultipleCell = rows.length > 1;

    if (isTextDataMultipleCell) {
      e.preventDefault();

      const result = [...scrapTargets];

      rows.forEach((row, copyY) => {
        const cells = row.split('\t');
        cells.forEach((cell, copyX) => {
          if (!result[startY + copyY]) {
            result[startY + copyY] = [];
          }

          result[startY + copyY][startX + copyX] = cell;
        });
      });

      setScrapTragets(result);
    }
  };

  return {
    scrapTargets,
    saveScrapTargets,
    makeNewTargets,
    setScrapTragetsFromPaste,
    hashTags,
    urls,
  };
};

const makeInitialScrapTargets = () => {
  return new Array(40).fill(null).map(() => new Array(2).fill(''));
};
