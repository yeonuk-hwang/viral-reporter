import { warn } from 'console';
import { Keyword, URL } from 'main/scrapper/types';
import { useState } from 'react';

type X = number;
type Y = number;
type Point = [X, Y];

interface UseScrapTargetsReturn {
  scrapTargets: [Keyword, URL][];
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
  const [scrapTargets, setScrapTragets] = useState<[Keyword, URL][]>(
    makeInitialScrapTargets
  );

  const saveScrapTargets = ([x, y]: Point, value: string) => {
    setScrapTragets((prev) => {
      const result = [...prev];
      result[y][x] = value;

      return result;
    });
  };

  const makeNewTargets = (index: number) => {
    const isLastItem = index === scrapTargets.length - 1;
    const addOneMoreRow = () => setScrapTragets((prev) => [...prev, ['', '']]);

    if (isLastItem) return addOneMoreRow();
  };

  const hashTags = scrapTargets.map(([tag]) => tag).filter(Boolean);
  const urls = scrapTargets.map(([_, url]) => url).filter(Boolean);

  const setScrapTragetsFromPaste = (
    [startX, startY]: Point,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const textData = e.clipboardData.getData('text');
    const rows = textData.split('\n');

    const result = [...scrapTargets];

    rows.forEach((row, yRelativeCoordinateOfRow) => {
      const cells = row.split('\t');
      const yAbsoluteCoordinateOfRow = startY + yRelativeCoordinateOfRow;

      const rowDoesNotExist = !result[yAbsoluteCoordinateOfRow];

      if (rowDoesNotExist) {
        (function makeNewRow() {
          result[yAbsoluteCoordinateOfRow] = ['', ''];
        })();
      }

      cells.forEach((cell, xRelativeCoordinateOfCell) => {
        const xAbsoluteCoordinateOfCell = startX + xRelativeCoordinateOfCell;

        result[yAbsoluteCoordinateOfRow][xAbsoluteCoordinateOfCell] = cell;
      });
    });

    setScrapTragets(result);
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

const makeInitialScrapTargets = (): [Keyword, URL][] => {
  return new Array(40).fill(null).map(() => ['', '']);
};
