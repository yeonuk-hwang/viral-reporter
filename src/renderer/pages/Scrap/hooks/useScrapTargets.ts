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
    const textData = e.clipboardData.getData('text');
    const rows = textData.split('\n');
    const isTextDataMultipleCell = rows.length > 1;

    if (isTextDataMultipleCell) {
      e.preventDefault();

      const result = [...scrapTargets];

      rows.forEach((row, xRelativeCoordinateOfRow) => {
        const cells = row.split('\t');
        const xAbsoluteCoordinateOfRow = startY + xRelativeCoordinateOfRow;

        const doesRowNotExist = !result[xAbsoluteCoordinateOfRow];
        function makeNewRow() {
          result[xAbsoluteCoordinateOfRow] = ['', ''];
        }

        if (doesRowNotExist) makeNewRow();

        cells.forEach((cell, yRelativeCoordinateOfCell) => {
          const yAbsoluteCoordinateOfCell = startX + yRelativeCoordinateOfCell;

          result[xAbsoluteCoordinateOfRow][yAbsoluteCoordinateOfCell] = cell;
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

const makeInitialScrapTargets = (): [Keyword, URL][] => {
  return new Array(40).fill(null).map(() => ['', '']);
};
