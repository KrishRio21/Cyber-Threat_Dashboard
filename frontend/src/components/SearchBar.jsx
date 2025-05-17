import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ThemeContext } from '../ThemeContext';

function SearchBar() {
  const [ip, setIp] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const handleSearch = () => {
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
      navigate(`/ip/${ip}`);
      toast.success(`Searching for IP: ${ip}`, { className: 'toast-custom' });
    } else {
      toast.error('Please enter a valid IP address', { className: 'toast-custom' });
    }
  };

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-2">
        <motion.input
          type="text"
          id="ip-address"
          name="ip-address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter IP address (e.g., 192.168.1.1)"
          className="input dark:animation-neon-pulse"
          aria-label="IP address input"
          autoComplete="off"
          whileFocus={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)' }}
        />
        <motion.button
          onClick={handleSearch}
          className="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClickCapture={() => document.activeElement.classList.add('ripple')}
          aria-label="Search IP"
        >
          Search
        </motion.button>
      </div>
    </motion.div>
  );
}

export default SearchBar;