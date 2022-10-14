import { ScrapResult } from 'main/scrapper/scrapperManager';
import { ScrapTarget } from 'main/scrapper/types';
import { useState } from 'react';

interface ScrapTargetWithID extends ScrapTarget {
  id: number;
}

interface UseScrapTargetsReturn {
  scrapTargets: ScrapTargetWithID[];
  saveScrapTargetFromChangeEvent(
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ): void;
  deleteScrapTarget(deleteIndex: number): void;
  makeNewTargets(index: number): void;
}

export const useScrapTargets = (): UseScrapTargetsReturn => {
  const [scrapTargets, setScrapTragets] = useState<ScrapTargetWithID[]>(
    makeInitialScrapTargets
  );

  const saveScrapTargets = (
    index: number,
    { name, value }: { name: keyof ScrapTarget; value: string }
  ) => {
    setScrapTragets((prev) => {
      const nextScrapTargets = [...prev];
      nextScrapTargets[index][name] = value;
      return nextScrapTargets;
    });
  };

  const saveScrapTargetFromChangeEvent = (
    index: number,
    { target }: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = target;

    saveScrapTargets(index, { name: name as keyof ScrapTarget, value });
  };

  const deleteScrapTarget = (deleteIndex: number) => {
    setScrapTragets((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== deleteIndex)
    );
  };

  const makeNewTargets = (index: number) => {
    if (scrapTargets[index + 1] === undefined) {
      setScrapTragets((prev) => [...prev, { id: id++, keyword: '', url: '' }]);
    }
  };

  return {
    scrapTargets,
    saveScrapTargetFromChangeEvent,
    deleteScrapTarget,
    makeNewTargets,
  };
};

let id = 0;

const makeInitialScrapTargets = () => {
  return new Array(3)
    .fill({ keyword: '', url: '' })
    .map((el) => ({ ...el, id: id++ }));
};
