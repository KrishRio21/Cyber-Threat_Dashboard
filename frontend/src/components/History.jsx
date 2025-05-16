import { useEffect, useState, useContext } from 'react';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { toast } from 'react-toastify';
    import { ThemeContext } from '../ThemeContext';

    function History() {
      const [history, setHistory] = useState([]);
      const navigate = useNavigate();
      const { theme } = useContext(ThemeContext);

      useEffect(() => {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('history_'));
        const histories = keys.map(key => ({
          ip: key.replace('history_', ''),
          data: JSON.parse(localStorage.getItem(key) || '[]')
        }));
        setHistory(histories);
      }, []);

      const clearHistory = (ip) => {
        localStorage.removeItem(`history_${ip}`);
        setHistory(history.filter(h => h.ip !== ip));
        toast.info(`Cleared history for ${ip}`, { className: 'toast-custom' });
      };

      return (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Search History</h2>
          {history.length === 0 ? (
            <p>No search history available.</p>
          ) : (
            <ul className="space-y-4">
              {history.map(({ ip, data }, index) => (
                <motion.li
                  key={ip}
                  className="p-4 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{ip}</h3>
                    <motion.button
                      onClick={() => clearHistory(ip)}
                      className="button button-danger"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClickCapture={() => document.activeElement.classList.add('ripple')}
                      aria-label={`Clear history for ${ip}`}
                    >
                      Clear
                    </motion.button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {data.map((entry, idx) => (
                      <li key={idx} className="text-sm">
                        {new Date(entry.timestamp).toLocaleString()}: Score {entry.threat_score.toFixed(1)}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    onClick={() => navigate(`/ip/${ip}`)}
                    className="button mt-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClickCapture={() => document.activeElement.classList.add('ripple')}
                    aria-label={`View details for ${ip}`}
                  >
                    View Details
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      );
    }

    export default History;