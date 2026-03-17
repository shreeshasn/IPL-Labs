import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeamBuilder from './pages/TeamBuilder';
import Presets from './pages/Presets';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('ipl2026_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ipl2026_theme', newTheme);
  };

  return (
    <Routes>
      <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/presets" element={<Presets theme={theme} />} />
      <Route path="/team/:teamId" element={<TeamBuilder theme={theme} toggleTheme={toggleTheme} />} />
    </Routes>
  );
}
