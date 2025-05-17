import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, ThemeContext } from './ThemeContext';
import { useContext } from 'react';
import SearchBar from './components/SearchBar';
import ThreatCard from './components/ThreatCard';
import Analytics from './components/Analytics';
import History from './components/History';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gradient-primary text-white"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </motion.button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen">
          <nav className="navbar p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <motion.h1
                className="text-3xl font-bold font-orbitron bg-gradient-primary text-transparent bg-clip-text glitch dark:animation-neon-pulse"
                data-text="Cyber Threat Dashboard"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                whileHover={{ scale: 1.05 }}
                aria-label="Cyber Threat Dashboard"
              >
                Cyber Threat Dashboard
              </motion.h1>
              <div className="flex space-x-4 items-center">
                <NavLink to="/" className={({ isActive }) => `button ${isActive ? 'bg-gradient-primary' : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `button ${isActive ? 'bg-gradient-primary' : ''}`}>
                  Analytics
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => `button ${isActive ? 'bg-gradient-primary' : ''}`}>
                  History
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `button ${isActive ? 'bg-gradient-primary' : ''}`}>
                  Settings
                </NavLink>
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <motion.div
            className="container mx-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SearchBar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ip/:ip" element={<ThreatCard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </motion.div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
            toastClassName="toast-custom"
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;