import { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

function Dashboard() {
  const [recentIPs, setRecentIPs] = useState([]);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent IPs from localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('history_'));
    const histories = keys.map(key => key.replace('history_', ''));
    setRecentIPs(histories.slice(0, 5)); // Limit to 5 recent IPs
    if (histories.length > 0) {
      toast.info('Loaded recent searches', { className: 'toast-custom' });
    }
  }, []);

  return (
    <motion.div
      className="grid grid-cols-1 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">Welcome to Cyber Threat Dashboard</h2>
        <p className="mb-4">Use the search bar above to analyze an IP address for potential threats.</p>
        {recentIPs.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Recent Searches</h3>
            <ul className="space-y-2">
              {recentIPs.map((ip, index) => (
                <motion.li
                  key={ip}
                  className="p-2 rounded-lg cursor-pointer hover:bg-gradient-primary hover:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/ip/${ip}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && navigate(`/ip/${ip}`)}
                  aria-label={`View threat report for ${ip}`}
                >
                  {ip}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;