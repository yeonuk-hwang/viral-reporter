import {
  Heading,
  Box,
  FormControl,
  Input,
  VStack,
  StackDivider,
  Button,
  FormErrorMessage,
  Center,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from './hooks/useForm';
import { useIsLogin } from './LoginProvider';

export function Login() {
  const { handleForm, requestLogin, isLoading, error } = useLogin();
  const { isLogin } = useIsLogin();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const toggleShowPassword = () => setIsShowPassword(!isShowPassword);

  const requestLoginWhenEnterPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      requestLogin();
    }
  };

  if (isLogin) {
    return <Navigate to="/scrap" />;
  }

  return (
    <Box
      display="flex"
      marginTop="20px"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      backgroundColor="#fafafa"
    >
      <VStack divider={<StackDivider borderColor="gray.200" />} spacing={10}>
        <Heading as="h1">Instagram 인기 게시물 스크랩퍼</Heading>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="350px"
          paddingBottom="20px"
          border="1px solid #dbdbdb"
          borderRadius="1px"
          backgroundColor="#FFFFFF"
        >
          <Heading marginTop="36px" marginBottom="16px" size="lg">
            인스타그램 로그인
          </Heading>
          <Box width="100%">
            <Box
              marginX="40px"
              marginBottom="6px"
              border="1px solid #dbdbdb"
              borderRadius="3px"
            >
              <Input
                name="userName"
                variant="filled"
                type="text"
                placeholder="아이디"
                backgroundColor="#fafafa"
                onChange={({ target }) => {
                  handleForm(target.name as 'userName', target.value);
                }}
              />
            </Box>
            <Box
              marginX="40px"
              marginBottom="6px"
              border="1px solid #dbdbdb"
              borderRadius="3px"
            >
              <InputGroup size="md">
                <Input
                  name="password"
                  variant="filled"
                  type={isShowPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  pr="4.5rem"
                  backgroundColor="#fafafa"
                  onChange={({ target }) => {
                    handleForm(target.name as 'password', target.value);
                  }}
                  onKeyDown={requestLoginWhenEnterPress}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={toggleShowPassword}>
                    {isShowPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
            <Box marginX="40px" marginTop="14px" marginBottom="20px">
              <Button
                isLoading={isLoading}
                width="100%"
                colorScheme="messenger"
                onClick={requestLogin}
              >
                로그인
              </Button>
            </Box>
          </Box>
          <FormControl isInvalid={!!error}>
            <Center>
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            </Center>
          </FormControl>
        </Box>
      </VStack>
    </Box>
  );
}
