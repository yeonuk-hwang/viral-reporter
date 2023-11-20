import { contextBridge, ipcRenderer } from 'electron';
import { CHANNEL } from './channel';
import { Keyword, URL } from './instagram//types';

export const API = {
  [CHANNEL.LOGIN]: (userInfo: { userName: string; password: string }) =>
    ipcRenderer.invoke(CHANNEL.LOGIN, userInfo),

  [CHANNEL.SCRAP]: (keywords: Keyword[], urls: URL[]) =>
    ipcRenderer.invoke(CHANNEL.SCRAP, keywords, urls),

  [CHANNEL.NAVER_INFLUENCER_SCRAP]: (keywords: Keyword[], urls: URL[]) =>
    ipcRenderer.invoke(CHANNEL.NAVER_INFLUENCER_SCRAP, keywords, urls),

  [CHANNEL.NAVER_CAFE_SCRAP]: (keywords: Keyword[], urls: URL[]) =>
    ipcRenderer.invoke(CHANNEL.NAVER_CAFE_SCRAP, keywords, urls),

  [CHANNEL.NAVER_BLOG_SCRAP]: (keywords: Keyword[], urls: URL[]) =>
    ipcRenderer.invoke(CHANNEL.NAVER_BLOG_SCRAP, keywords, urls),

  [CHANNEL.OPEN_FILE]: (path: string) =>
    ipcRenderer.invoke(CHANNEL.OPEN_FILE, path),

  [CHANNEL.OPEN_URL]: (path: string) =>
    ipcRenderer.invoke(CHANNEL.OPEN_URL, path),

  [CHANNEL.SHOW_ERROR_DIALOG]: (err: Error) => {
    ipcRenderer.send(CHANNEL.SHOW_ERROR_DIALOG, err);
  },
};

contextBridge.exposeInMainWorld('api', API);
