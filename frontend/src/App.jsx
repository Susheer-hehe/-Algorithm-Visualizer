import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BubbleSortVisualizer from './pages/BubbleSortVisualizer';
import InsertionSortVisualizer from './pages/InsertionSortVisualizer';
import SelectionSortVisualizer from './pages/SelectionSortVisualizer';
import BfsVisualizer from './pages/BfsVisualizer';
import DfsVisualizer from './pages/DfsVisualizer';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bubble-sort" element={<BubbleSortVisualizer />} />
        <Route path="/insertion-sort" element={<InsertionSortVisualizer />} />
        <Route path="/selection-sort" element={<SelectionSortVisualizer />} />
        <Route path="/bfs" element={<BfsVisualizer />} />
        <Route path="/dfs" element={<DfsVisualizer />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;