import React, {
  useContext,
  useState,
  createContext,
  PropsWithChildren,
} from 'react';

const IsLoginContext = createContext<{
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const useIsLogin = () => {
  const value = useContext(IsLoginContext);

  if (value === null) {
    throw new Error('IsLogin Context Provider is not provided');
  } else {
    return value;
  }
};

export function IsLoginProvider({ children }: PropsWithChildren) {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <IsLoginContext.Provider value={{ isLogin, setIsLogin }}>
      {children}
    </IsLoginContext.Provider>
  );
}
