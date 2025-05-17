import { useEffect, useState, useContext } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ThemeContext } from '../ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function Analytics() {
  const [data, setData] = useState([]);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load recent IPs from localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('history_'));
        const recentIPs = keys.map(key => key.replace('history_', '')).slice(0, 5);
        
        if (recentIPs.length === 0) {
          // Placeholder data if no history
          setData([{
            ip: 'No Data',
            threat_score: 0,
            abuseipdb: { confidence_score: 0 },
            virustotal: { malicious_count: 0 },
            feodo_tracker: { confidence_level: 0 }
          }]);
          return;
        }

        // Fetch data for recent IPs
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const responses = await Promise.all(
          recentIPs.map(ip => axios.get(`${apiUrl}/threats/ip/${ip}`))
        );
        setData(responses.map(res => res.data));
      } catch (err) {
        console.error(err);
        setData([{
          ip: 'Error',
          threat_score: 0,
          abuseipdb: { confidence_score: 0 },
          virustotal: { malicious_count: 0 },
          feodo_tracker: { confidence_level: 0 }
        }]);
      }
    };
    fetchData();
  }, []);

  const barData = {
    labels: data.map(d => d.ip),
    datasets: [
      {
        label: 'Threat Score',
        data: data.map(d => d.threat_score),
        backgroundColor: '#2b6cb0',
      },
      {
        label: 'AbuseIPDB Score',
        data: data.map(d => d.abuseipdb.confidence_score),
        backgroundColor: '#ff6384',
      }
    ]
  };

  const pieData = {
    labels: ['AbuseIPDB', 'VirusTotal', 'Feodo Tracker'],
    datasets: [
      {
        data: data[0] ? [
          data[0].abuseipdb.confidence_score,
          data[0].virustotal.malicious_count * 10,
          data[0].feodo_tracker.confidence_level
        ] : [0, 0, 0],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
      }
    ]
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="card chart-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">Threat Distribution</h2>
        <Pie
          data={pieData}
          options={{
            responsive: true,
            plugins: { title: { display: true, text: 'Threat Sources', color: theme === 'dark' ? '#e6edf3' : '#1f2937' } }
          }}
        />
      </motion.div>
      <motion.div
        className="card chart-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold mb-4">Threat Metrics</h2>
        <Bar
          data={barData}
          options={{
            responsive: true,
            plugins: { title: { display: true, text: 'IP Analytics', color: theme === 'dark' ? '#e6edf3' : '#1f2937' } },
            scales: {
              x: { ticks: { color: theme === 'dark' ? '#e6edf3' : '#1f2937' } },
              y: { ticks: { color: theme === 'dark' ? '#e6edf3' : '#1f2937' } }
            }
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default Analytics;