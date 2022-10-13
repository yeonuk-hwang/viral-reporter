import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Login } from './pages';

export default function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/scrap" element={<h1>hello</h1>} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
