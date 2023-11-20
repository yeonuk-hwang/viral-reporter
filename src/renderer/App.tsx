import {
  MemoryRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Login, Scrap, Home, Naver } from './pages';
import { useEffect } from 'react';
import { NavbarWithOutlet } from './pages/NavBar';
import { IsLoginProvider } from './pages/Login/LoginProvider';

export default function App() {
  useEffect(() => {
    window.addEventListener('unhandledrejection', (ev) => {
      window.api.SHOW_ERROR_DIALOG(ev.reason);
    });

    window.addEventListener('error', (err) => {
      window.api.SHOW_ERROR_DIALOG(err.error);
    });
  }, []);

  return (
    <ChakraProvider>
      <IsLoginProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<NavbarWithOutlet />}>
              <Route path="naver" element={<Naver />} />
              <Route path="instagram" element={<Login />} />
              <Route path="scrap" element={<Scrap />} />
            </Route>
          </Routes>
        </Router>
      </IsLoginProvider>
    </ChakraProvider>
  );
}
