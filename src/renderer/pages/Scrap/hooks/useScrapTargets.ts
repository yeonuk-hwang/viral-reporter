import { Keyword, URL } from 'main/scrapper/types';
import { useState } from 'react';

type X = number;
type Y = number;
type Point = [X, Y];

interface UseScrapTargetsReturn {
  scrapTargets: [Keyword, URL][];
  saveScrapTargets(point: Point, value: string): void;
  setScrapTragetsFromPaste(
    [startX, startY]: Point,
    e: React.ClipboardEvent<HTMLInputElement>
  ): void;
  appendNewRow(): void;
  keywords: Keyword[];
  urls: URL[];
}

export const useScrapTargets = (): UseScrapTargetsReturn => {
  const [scrapTargets, setScrapTragets] = useState<[Keyword, URL][]>(
    makeInitialScrapTargets
  );

  const keywords = scrapTargets.map(([tag]) => tag).filter(Boolean);
  const urls = scrapTargets.map(([_, url]) => url).filter(Boolean);

  const saveScrapTargets = ([x, y]: Point, value: string) => {
    setScrapTragets((prev) => {
      const result = [...prev];
      result[y][x] = value;

      return result;
    });
  };

  const appendNewRow = () => {
    setScrapTragets((prev) => [...prev, ['', '']]);
  };

  function appendNewRowWithoutRender(
    target: UseScrapTargetsReturn['scrapTargets']
  ) {
    target.push(['', '']);
  }

  const setScrapTragetsFromPaste = (
    [startX, startY]: Point,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const textData = e.clipboardData.getData('text');
    const rows = textData.split('\n');

    const pastedTargets = fillRowsInTarget(scrapTargets, rows, [
      startX,
      startY,
    ]);

    setScrapTragets(pastedTargets);
  };

  function fillRowsInTarget(
    originTargets: UseScrapTargetsReturn['scrapTargets'],
    rows: string[],
    [startX, startY]: Point
  ) {
    const result = [...originTargets];

    rows.forEach((row, yRelativeCoordinateOfRow) => {
      const cells = row.split('\t');
      const yAbsoluteCoordinateOfRow = startY + yRelativeCoordinateOfRow;

      const rowDoesNotExist = !result[yAbsoluteCoordinateOfRow];

      if (rowDoesNotExist) {
        appendNewRowWithoutRender(result);
      }

      cells.forEach((cell, xRelativeCoordinateOfCell) => {
        const xAbsoluteCoordinateOfCell = startX + xRelativeCoordinateOfCell;

        result[yAbsoluteCoordinateOfRow][xAbsoluteCoordinateOfCell] = cell;
      });
    });

    return result;
  }

  return {
    scrapTargets,
    saveScrapTargets,
    setScrapTragetsFromPaste,
    appendNewRow,
    keywords,
    urls,
  };
};

const makeInitialScrapTargets = (): [Keyword, URL][] => {
  return new Array(40).fill(null).map(() => ['', '']);
};
