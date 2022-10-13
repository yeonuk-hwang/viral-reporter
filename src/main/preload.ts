import { contextBridge, ipcRenderer } from 'electron';
import { CHANNEL } from './channel';

export const API = {
  [CHANNEL.LOGIN]: (userInfo: { userName: string; password: string }) =>
    ipcRenderer.invoke(CHANNEL.LOGIN, userInfo),
};

contextBridge.exposeInMainWorld('api', API);
