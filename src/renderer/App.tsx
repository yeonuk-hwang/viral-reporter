import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Login, Scrap, Home, Naver } from './pages';
import { useEffect } from 'react';

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
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/naver" element={<Naver />} />
          <Route path="/instagram" element={<Login />}>
            <Route path="scrap" element={<Scrap />} />
          </Route>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
