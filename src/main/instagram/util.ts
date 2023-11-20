export class NoErrorThrownError extends Error {}

export const getError = async <TError>(
  call: () => unknown
): Promise<TError> => {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error: unknown) {
    return error as TError;
  }
};

export const isRejected = (
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult => input.status === 'rejected';

export const isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === 'fulfilled';
