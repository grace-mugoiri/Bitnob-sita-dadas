import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MakeOrder from './pages/MakeOrder';
import Tracker from './pages/Tracker';
import History from './pages/History';
import Settings from './pages/Settings';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="make-order" element={<MakeOrder />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
