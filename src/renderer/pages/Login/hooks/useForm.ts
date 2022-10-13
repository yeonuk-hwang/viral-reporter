import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invokeWithCustomErrors } from 'renderer/utils';
import { CustomError } from 'main/errors';

type UserInfo = {
  userName: string;
  password: string;
};

interface UseLoginReturn {
  handleForm(name: keyof UserInfo, value: string): void;
  requestLogin(): void;
  isLoading: boolean;
  error: Error | null;
}

export function useLogin(): UseLoginReturn {
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userName: '',
    password: '',
  });

  const isValid: Record<keyof UserInfo, boolean> = {
    userName: userInfo.userName.length >= 1,
    password: userInfo.password.length >= 6,
  };

  const handleForm = (key: keyof UserInfo, value: string): void => {
    setUserInfo((prev) => ({ ...prev, [key]: value }));
  };

  const requestLogin = async () => {
    try {
      validateForm();
      setIsLoading(true);
      await invokeWithCustomErrors(() => window.api.LOGIN(userInfo));
      navigate('/scrap');
    } catch (err) {
      if (err instanceof CustomError) {
        return setError(err);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const message = {
      userName: '아이디는 1글자 이상 입력되어야 합니다.',
      password: '비밀번호는 6글자 이상 입력되어야 합니다.',
    };

    Object.entries(isValid).forEach(([key, isValid]) => {
      if (!isValid) {
        throw new CustomError(message[key as keyof UserInfo]);
      }
    });
  };

  return { handleForm, requestLogin, error, isLoading };
}
