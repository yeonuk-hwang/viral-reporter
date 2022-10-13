import { ipcMain } from 'electron';
import { CHANNEL } from './channel';
import { makeScrapper } from './scrapper';
import { handleWithCustomErrors } from './util';

export const bootstrap = async () => {
  const scrapper = await makeScrapper();

  handleWithCustomErrors(
    CHANNEL.LOGIN,
    (_, { userName, password }: { userName: string; password: string }) => {
      return scrapper.login(userName, password);
    }
  );

  return true;
};
