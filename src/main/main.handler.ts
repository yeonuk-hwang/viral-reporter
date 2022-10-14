import { app, shell } from 'electron';
import { CHANNEL } from './channel';
import { makeScrapper } from './scrapper';
import { ScrapTarget } from './scrapper/types';
import { handleWithCustomErrors } from './util';

export const bootstrap = async () => {
  const scrapper = await makeScrapper();

  handleWithCustomErrors(
    CHANNEL.LOGIN,
    (_, { userName, password }: { userName: string; password: string }) => {
      return scrapper.login(userName, password);
    }
  );

  handleWithCustomErrors(CHANNEL.SCRAP, (_, scrapTargets: ScrapTarget[]) => {
    return scrapper.scrap(scrapTargets, app.getPath('downloads'));
  });

  handleWithCustomErrors(CHANNEL.OPEN_SCREENSHOT_DIRECTORY, () => {
    return shell.openPath(app.getPath('downloads'));
  });

  handleWithCustomErrors(CHANNEL.OPEN_FILE, (_, path: string) => {
    return shell.openPath(path);
  });

  handleWithCustomErrors(CHANNEL.OPEN_URL, (_, path: string) => {
    return shell.openExternal(path);
  });

  return scrapper;
};
