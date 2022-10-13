export class CustomError extends Error {
  isCustomError: boolean;

  constructor(message: string) {
    super(message);
    this.isCustomError = true;
  }
}
