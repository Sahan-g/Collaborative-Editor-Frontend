import './App.css';
import Header from './Components/Header';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Documents from './Pages/Documents';
import Shared from './Pages/shared';
import Recent from './Pages/Recent';

function App() {
  return (
    <BrowserRouter>
      <>
        <Header />
        <Routes>
        <Route path="/documents" element={<Documents />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/recent" element={<Recent />} />
      </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;
