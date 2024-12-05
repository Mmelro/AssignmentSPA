import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/SecurityList';
import SecurityDetails from './components/SecurityDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/securities" element={<HomePage />} />
        <Route path="/securities/:ticker" element={<SecurityDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
