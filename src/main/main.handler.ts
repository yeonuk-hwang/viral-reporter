import { app, dialog, ipcMain, shell } from 'electron';
import * as fs from 'fs';
import { CHANNEL } from './channel';
import { makeScrapper } from './scrapper';
import { ScrapTarget } from './scrapper/types';
import { handleWithCustomErrors } from './util';

export const bootstrap = async () => {
  const CHROME_PATHS: Partial<Record<typeof process.platform, string>> = {
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  };

  const browserPath = app.isPackaged
    ? CHROME_PATHS[process.platform]
    : undefined;

  if (browserPath && !fs.existsSync(browserPath)) {
    dialog.showErrorBox(
      '크롬이 설치되지 않았습니다',
      `본 프로그램은 크롬이 필수적으로 설치되어 있어야 합니다. 현재 ${browserPath}에 크롬이 설치되어 있지 않은것으로 판단됩니다`
    );
  }

  const scrapper = await makeScrapper(browserPath);

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

  ipcMain.on(CHANNEL.SHOW_ERROR_DIALOG, (_, err: Error) => {
    dialog.showErrorBox(
      '알수없는 에러가 발생했습니다',
      `${err.name}: ${err.message}`
    );
  });

  return scrapper;
};
