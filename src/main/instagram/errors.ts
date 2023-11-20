import { CustomError } from '../errors';

export class PostNotExistError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = ERROR_NAMES.PostNotExistError;
  }
}

export class PostURLisNotValid extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = ERROR_NAMES.PostURLisNotValid;
  }
}

export class InvalidUserNameOrPasswordError extends CustomError {
  constructor() {
    super('아이디 또는 비밀번호가 잘못되었습니다');
    this.name = ERROR_NAMES.InvalidUserNameOrPasswordError;
  }
}

export class DeactivatedIDError extends CustomError {
  constructor() {
    super('아이디가 비활성화 되었습니다.');
    this.name = ERROR_NAMES.DeactivatedIDError;
  }
}

export class LoginRequiredError extends CustomError {
  constructor() {
    super('로그인이 필요합니다');
    this.name = ERROR_NAMES.LoginRequiredError;
  }
}

export const ERROR_NAMES = {
  PostNotExistError: 'PostNotExistError',
  PostURLisNotValid: 'PostURLisNotValid',
  InvalidUserNameOrPasswordError: 'InvalidUserNameOrPasswordError',
  DeactivatedIDError: 'DeactivatedIDError',
  LoginRequiredError: 'LoginRequiredError',
} as const;
