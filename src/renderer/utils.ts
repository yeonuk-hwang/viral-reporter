import { CustomError } from 'main/errors';
import { EncodedError } from 'main/util';

export const decodeError = ({ name, message, extra }: EncodedError): Error => {
  const e = extra.isCustomError ? new CustomError(message) : new Error(message);
  e.name = name;
  Object.assign(e, extra);
  return e;
};

export const invokeWithCustomErrors = async (callback: Function) => {
  const { error, result } = await callback();

  if (error) {
    throw decodeError(error);
  }

  return result;
};
