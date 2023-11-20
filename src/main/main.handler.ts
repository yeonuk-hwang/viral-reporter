import { app, dialog, ipcMain, shell } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { CHANNEL } from './channel';
import { makeScrappers } from './instagram';
import { Keyword, URL } from './instagram/types';
import { handleWithCustomErrors } from './util';

export const bootstrap = async () => {
  const CHROME_PATHS: Partial<Record<typeof process.platform, string[]>> = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
    win32: [
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    ],
  };

  const browserPaths = app.isPackaged
    ? CHROME_PATHS[process.platform]
    : undefined;

  const browserPath = browserPaths?.find((path) => fs.existsSync(path));

  if (app.isPackaged && browserPath === undefined) {
    dialog.showErrorBox(
      '크롬이 설치되지 않았습니다',
      `본 프로그램은 크롬이 필수적으로 설치되어 있어야 합니다. 현재 ${browserPaths}에 크롬이 설치되어 있지 않은것으로 판단됩니다`
    );
  }

  const {
    naverInfluencerManager,
    naverBlogManager,
    naverCafeManager,
    instagramManager,
  } = await makeScrappers(browserPath);

  handleWithCustomErrors(
    CHANNEL.LOGIN,
    (_, { userName, password }: { userName: string; password: string }) => {
      return instagramManager.login(userName, password);
    }
  );

  const downloadDirectory = app.getPath('downloads');

  const baseScreenshotDirectory = path.join(
    downloadDirectory,
    'viral-reporter'
  );

  handleWithCustomErrors(
    CHANNEL.SCRAP,
    (_, hashTags: Keyword[], urls: URL[]) => {
      return instagramManager.scrap(
        hashTags,
        urls,
        path.join(baseScreenshotDirectory, 'instagram')
      );
    }
  );

  handleWithCustomErrors(
    CHANNEL.NAVER_BLOG_SCRAP,
    (_, keywords: Keyword[], urls: URL[]) => {
      return naverBlogManager.scrap(
        keywords,
        urls,
        path.join(baseScreenshotDirectory, 'naver_blog')
      );
    }
  );
  handleWithCustomErrors(
    CHANNEL.NAVER_CAFE_SCRAP,
    (_, keywords: Keyword[], urls: URL[]) => {
      return naverCafeManager.scrap(
        keywords,
        urls,
        path.join(baseScreenshotDirectory, 'naver_cafe')
      );
    }
  );
  handleWithCustomErrors(
    CHANNEL.NAVER_INFLUENCER_SCRAP,
    (_, keywords: Keyword[], urls: URL[]) => {
      return naverInfluencerManager.scrap(
        keywords,
        urls,
        path.join(baseScreenshotDirectory, 'naver_influencer')
      );
    }
  );

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
};
