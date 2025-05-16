import { useState, useContext } from 'react';
    import { motion } from 'framer-motion';
    import { toast } from 'react-toastify';
    import { ThemeContext } from '../ThemeContext';

    function Settings() {
      const [notifications, setNotifications] = useState(true);
      const [autoRefresh, setAutoRefresh] = useState(false);
      const { theme } = useContext(ThemeContext);

      const saveSettings = () => {
        localStorage.setItem('settings', JSON.stringify({ notifications, autoRefresh }));
        toast.success('Settings saved', { className: 'toast-custom' });
      };

      return (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="form-checkbox text-primary"
                  aria-label="Enable notifications"
                />
                <span>Enable Notifications</span>
              </label>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="form-checkbox text-primary"
                  aria-label="Enable auto-refresh"
                />
                <span>Auto-refresh Data</span>
              </label>
            </motion.div>
            <motion.button
              onClick={saveSettings}
              className="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClickCapture={() => document.activeElement.classList.add('ripple')}
              aria-label="Save settings"
            >
              Save Settings
            </motion.button>
          </div>
        </motion.div>
      );
    }

    export default Settings;