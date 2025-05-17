Cyber Threat Intelligence Dashboard:

A full-stack, cyberpunk-style dashboard for real-time IP threat analysis. Built with React and FastAPI, it leverages AbuseIPDB, VirusTotal, Feodo Tracker, and IPInfo. Features a neon-glitch search bar, animated charts, and JSON/CSV/PDF exports, all in a sleek dark theme. Stay ahead of cyber threats with cutting-edge flair.
 
Key Features

Cyberpunk Full-Stack Design: Built with React and FastAPI, hosted on Render, with a neon-glitch UI and dark theme.
Real-Time IP Threat Analysis: Analyzes IPs via /threats/ip/{ip} using AbuseIPDB, VirusTotal, Feodo Tracker, IPInfo.
Dynamic Data Visualization: Responsive Bar/Pie charts on /analytics for threat metrics.
Seamless Report Exports: JSON, CSV, PDF reports with ripple buttons and toasts.
Robust API Integrations: AbuseIPDB, VirusTotal, Feodo Tracker, IPInfo with caching.

Tech Stack

Frontend: React, Vite, Tailwind CSS, Framer Motion, Chart.js
Backend: FastAPI, Python, Cachetools, Tenacity
APIs: AbuseIPDB, VirusTotal, Feodo Tracker, IPInfo
Deployment: Render

Prerequisites

Node.js (>=18.x)
Python (>=3.8)
Git
API Keys: ABUSEIPDB_API_KEY, VIRUSTOTAL_API_KEY, IPINFO_API_KEY
