import { Button, Box, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingTop="200px"
      gap="30px"
    >
      <Heading size="4xl">Home</Heading>
      <Heading size="xl">이용을 원하시는 도메인을 선택해주세요</Heading>
      <Box display="flex" justifyContent="center" gap="100px" marginTop="40px">
        <Link to="/naver">
          <Button size="lg" colorScheme="green">
            Naver
          </Button>
        </Link>
        <Link to="/instagram">
          <Button size="lg" colorScheme="purple">
            Instagram
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
