import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SortVisualizer from './components/SortVisualizer';
import PathVisualizer from './components/PathVisualizer';
import DijkstraVisualizer from './pages/DijkstraVisualizer';
import HomePage       from './pages/HomePage';
import AboutPage      from './pages/AboutPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <div className="flex-1">
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
        </div>
      </div>
    </Router>
  );
}