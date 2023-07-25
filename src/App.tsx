import './App.css';
import IndexPage from "./pages/Index"
import { Routes, Route, HashRouter } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path={"/"} element={<IndexPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
