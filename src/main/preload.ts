import { contextBridge, ipcRenderer } from 'electron';
import { CHANNEL } from './channel';
import { Keyword, URL } from './scrapper/types';

export const API = {
  [CHANNEL.LOGIN]: (userInfo: { userName: string; password: string }) =>
    ipcRenderer.invoke(CHANNEL.LOGIN, userInfo),

  [CHANNEL.SCRAP]: (hashTags: Keyword[], urls: URL[]) =>
    ipcRenderer.invoke(CHANNEL.SCRAP, hashTags, urls),

  [CHANNEL.OPEN_FILE]: (path: string) =>
    ipcRenderer.invoke(CHANNEL.OPEN_FILE, path),

  [CHANNEL.OPEN_URL]: (path: string) =>
    ipcRenderer.invoke(CHANNEL.OPEN_URL, path),

  [CHANNEL.SHOW_ERROR_DIALOG]: (err: Error) => {
    ipcRenderer.send(CHANNEL.SHOW_ERROR_DIALOG, err);
  },
};

contextBridge.exposeInMainWorld('api', API);
