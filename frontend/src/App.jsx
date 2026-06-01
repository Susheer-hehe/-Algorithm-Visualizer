import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SortVisualizer from './components/SortVisualizer';
import PathVisualizer from './components/PathVisualizer';
import DijkstraVisualizer from './pages/DijkstraVisualizer';
import HomePage       from './pages/HomePage';
import AboutPage      from './pages/AboutPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/about"          element={<AboutPage />} />
        <Route path="/bubble-sort"    element={<SortVisualizer algorithm="bubble" />} />
        <Route path="/selection-sort" element={<SortVisualizer algorithm="selection" />} />
        <Route path="/insertion-sort" element={<SortVisualizer algorithm="insertion" />} />
        <Route path="/bfs"            element={<PathVisualizer algorithm="bfs" />} />
        <Route path="/dfs"            element={<PathVisualizer algorithm="dfs" />} />
        <Route path="/dijkstra"       element={<DijkstraVisualizer />} />
      </Routes>
    </Router>
  );
}