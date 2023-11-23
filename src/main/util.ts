/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { ipcMain } from 'electron';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export type EncodedError = {
  name: string;
  message: string;
  extra: Record<string, any>;
};

export const encodeError = (e: Error): EncodedError => {
  return { name: e.name, message: e.message, extra: { ...e } };
};

type IpcMainEventHandlerSuccessReturn = {
  result: any;
};

type IpcMainEventHandlerFailReturn = {
  error: EncodedError;
};

type IpcMainEventHandlerReturn =
  | IpcMainEventHandlerSuccessReturn
  | IpcMainEventHandlerFailReturn;

type IpcMainEventHandler = (
  event: Electron.IpcMainInvokeEvent,
  ...arsg: any[]
) => any;

export const handleWithCustomErrors = (
  channel: string,
  handler: IpcMainEventHandler
) => {
  ipcMain.handle(
    channel,
    async (...args): Promise<IpcMainEventHandlerReturn> => {
      try {
        return { result: await Promise.resolve(handler(...args)) };
      } catch (e) {
        if (e instanceof Error) {
          return { error: encodeError(e) };
        }
        throw e;
      }
    }
  );
};

export function removeCRLFCase(string: string) {
  return string.replace(/[\r\n]+/g, '');
}
