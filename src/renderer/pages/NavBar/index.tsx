import { Box, Button } from '@chakra-ui/react';
import { Link, Outlet } from 'react-router-dom';

export function NavbarWithOutlet() {
  return (
    <Box width="100vw" minHeight="100vh" backgroundColor="#fafafa">
      <Box
        display="flex"
        justifyContent="flex-start"
        gap="2vw"
        paddingY="40px"
        paddingX="20px"
        paddingBottom="20px"
        borderBottom="1px solid #dbdbdb"
      >
        <Link to="/naver">
          <Button size="md" colorScheme="green">
            Naver
          </Button>
        </Link>
        <Link to="/instagram">
          <Button size="md" colorScheme="purple">
            Instagram
          </Button>
        </Link>
      </Box>
      <Outlet />
    </Box>
  );
}
