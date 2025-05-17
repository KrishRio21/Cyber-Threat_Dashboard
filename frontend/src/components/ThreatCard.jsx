import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { ThemeContext } from '../ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ThreatCard({ ip: propIp }) {
  const { ip: paramIp } = useParams();
  const ip = paramIp || propIp;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${apiUrl}/threats/ip/${ip}`);
        setData(response.data);
        // Save to localStorage history
        const historyKey = `history_${ip}`;
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        existingHistory.unshift({
          timestamp: new Date().toISOString(),
          threat_score: response.data.threat_score,
        });
        localStorage.setItem(historyKey, JSON.stringify(existingHistory.slice(0, 10))); // Keep last 10 entries
        if (response.data.feodo_tracker.is_malicious) {
          toast.error(`Botnet C2 Server Detected for ${ip}!`, { className: 'toast-custom', autoClose: 10000 });
        }
      } catch (err) {
        setError(err.message);
        toast.error(`Error fetching data for ${ip}: ${err.message}`, { className: 'toast-custom' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ip]);

  const exportReport = (format) => {
    if (!data) return;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `threat_report_${ip}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvData = [{
        IP: data.ip,
        Threat_Score: data.threat_score,
        AbuseIPDB_Score: data.abuseipdb.confidence_score,
        AbuseIPDB_Reports: data.abuseipdb.total_reports,
        AbuseIPDB_Country: data.abuseipdb.country || 'N/A',
        VirusTotal_Malicious: data.virustotal.malicious_count,
        VirusTotal_Reputation: data.virustotal.reputation,
        Feodo_Malicious: data.feodo_tracker.is_malicious ? 'Yes' : 'No',
        Feodo_Confidence: data.feodo_tracker.confidence_level,
        City: data.ipinfo.city || 'N/A',
        Country: data.ipinfo.country || 'N/A'
      }];
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `threat_report_${ip}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Threat Report for IP: ${ip}`, 10, 10);
      doc.setFontSize(12);
      doc.text(`Threat Score: ${data.threat_score.toFixed(1)}`, 10, 20);
      doc.text(`AbuseIPDB: ${data.abuseipdb.confidence_score}% (${data.abuseipdb.total_reports} reports, Country: ${data.abuseipdb.country || 'N/A'})`, 10, 30);
      doc.text(`VirusTotal: ${data.virustotal.malicious_count} malicious (Reputation: ${data.virustotal.reputation})`, 10, 40);
      doc.text(`Feodo Tracker: ${data.feodo_tracker.is_malicious ? 'Malicious (C2)' : 'Clean'} (Confidence: ${data.feodo_tracker.confidence_level})`, 10, 50);
      doc.text(`Location: ${data.ipinfo.city || 'N/A'}, ${data.ipinfo.country || 'N/A'}`, 10, 60);
      doc.save(`threat_report_${ip}.pdf`);
    }
    toast.success(`Exported report as ${format.toUpperCase()}`, { className: 'toast-custom' });
  };

  const chartData = {
    labels: ['AbuseIPDB', 'VirusTotal', 'Feodo Tracker'],
    datasets: [
      {
        label: 'Threat Indicators',
        data: data ? [
          data.abuseipdb.confidence_score,
          data.virustotal.malicious_count * 10,
          data.feodo_tracker.confidence_level
        ] : [0, 0, 0],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
      }
    ]
  };

  return (
    <motion.div
      className="card"
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <h2 className="text-xl font-semibold mb-4">Threat Report: {ip}</h2>
      {loading ? (
        <div className="spinner-container">
          <ClipLoader color={theme === 'dark' ? '#2b6cb0' : '#1f2937'} size={50} />
        </div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <>
          {data.threat_score > 50 && (
            <motion.div
              className="bg-danger text-white p-2 rounded mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              High Risk IP! Score: {data.threat_score.toFixed(1)}
            </motion.div>
          )}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium">API Status</h3>
            <ul className="list-disc pl-5">
              {Object.entries(data.api_status).map(([key, status], index) => (
                <motion.li
                  key={key}
                  className={status === 'success' ? 'api-status-success' : 'api-status-failed'}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {key}: {status} {data[key].error && <span className="text-danger">({data[key].error})</span>}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-medium">Details</h3>
              <p><strong>Threat Score:</strong> {data.threat_score.toFixed(1)}</p>
              <p><strong>AbuseIPDB:</strong> {data.abuseipdb.confidence_score}% ({data.abuseipdb.total_reports} reports, Country: {data.abuseipdb.country || 'N/A'})</p>
              <p><strong>VirusTotal:</strong> {data.virustotal.malicious_count} malicious (Reputation: {data.virustotal.reputation})</p>
              <p>
                <strong>Feodo Tracker:</strong> {data.feodo_tracker.is_malicious ? 'Malicious (C2)' : 'Clean'}
                {data.feodo_tracker.confidence_level > 0 && ` (Confidence: ${data.feodo_tracker.confidence_level})`}
                {data.feodo_tracker.malware_types.length > 0 && ` (${data.feodo_tracker.malware_types.join(', ')})`}
              </p>
              <p><strong>Location:</strong> {data.ipinfo.city || 'N/A'}, {data.ipinfo.country || 'N/A'}</p>
            </motion.div>
            <motion.div
              className="chart-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { title: { display: true, text: 'Threat Metrics', color: theme === 'dark' ? '#e6edf3' : '#1f2937' } },
                  scales: {
                    x: { ticks: { color: theme === 'dark' ? '#e6edf3' : '#1f2937' } },
                    y: { ticks: { color: theme === 'dark' ? '#e6edf3' : '#1f2937' } }
                  }
                }}
              />
            </motion.div>
          </div>
          <motion.div
            className="mt-4 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => exportReport('json')}
              className="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClickCapture={() => document.activeElement.classList.add('ripple')}
              aria-label="Export as JSON"
            >
              Export JSON
            </motion.button>
            <motion.button
              onClick={() => exportReport('csv')}
              className="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClickCapture={() => document.activeElement.classList.add('ripple')}
              aria-label="Export as CSV"
            >
              Export CSV
            </motion.button>
            <motion.button
              onClick={() => exportReport('pdf')}
              className="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClickCapture={() => document.activeElement.classList.add('ripple')}
              aria-label="Export as PDF"
            >
              Export PDF
            </motion.button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default ThreatCard;