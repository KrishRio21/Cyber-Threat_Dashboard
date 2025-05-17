from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import os
from tenacity import retry, stop_after_attempt, wait_fixed
from cachetools import TTLCache
import logging

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Cyber Threat Intelligence API")

# CORS setup to allow requests from frontend
origins = [
    "http://localhost:5173",  # Local dev
    "https://cyber-threat-dashboard-3mz9.onrender.com",  # Render frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache results for 1 hour (3600 seconds)
cache = TTLCache(maxsize=100, ttl=3600)

@app.get("/")
def root():
    return {"message": "Cyber Threat Intelligence API is running."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def fetch_abuseipdb(ip: str, api_key: str):
    cache_key = f"abuseipdb_{ip}"
    if cache_key in cache:
        logger.info(f"Returning cached AbuseIPDB data for {ip}")
        return cache[cache_key]

    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {"Key": api_key, "Accept": "application/json"}
    params = {"ipAddress": ip, "maxAgeInDays": 90}

    logger.info(f"Fetching AbuseIPDB data for {ip}")
    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="AbuseIPDB rate limit exceeded")
    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid AbuseIPDB API key")
    resp.raise_for_status()

    data = resp.json()["data"]
    result = {
        "confidence_score": data.get("abuseConfidenceScore", 0),
        "total_reports": data.get("totalReports", 0),
        "country": data.get("countryCode", "N/A"),
        "error": None,
    }
    cache[cache_key] = result
    return result

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def fetch_virustotal(ip: str, api_key: str):
    cache_key = f"virustotal_{ip}"
    if cache_key in cache:
        logger.info(f"Returning cached VirusTotal data for {ip}")
        return cache[cache_key]

    url = f"https://www.virustotal.com/api/v3/ip_addresses/{ip}"
    headers = {"x-apikey": api_key}

    logger.info(f"Fetching VirusTotal data for {ip}")
    resp = requests.get(url, headers=headers)
    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="VirusTotal rate limit exceeded")
    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid VirusTotal API key")
    resp.raise_for_status()

    data = resp.json()["data"]["attributes"]
    result = {
        "malicious_count": data.get("last_analysis_stats", {}).get("malicious", 0),
        "reputation": data.get("reputation", 0),
        "scan_results": {k: v["result"] for k, v in data.get("last_analysis_results", {}).items() if v["result"]},
        "error": None,
    }
    cache[cache_key] = result
    return result

def fetch_feodo_tracker(ip: str):
    cache_key = f"feodo_tracker_{ip}"
    if cache_key in cache:
        logger.info(f"Returning cached Feodo Tracker data for {ip}")
        return cache[cache_key]

    try:
        url = "https://feodotracker.abuse.ch/downloads/ipblocklist.txt"
        logger.info(f"Fetching Feodo Tracker blocklist for {ip}")
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()

        lines = resp.text.splitlines()
        ip_list = [line.strip() for line in lines if line.strip() and not line.startswith("#") and ":" not in line]

        is_malicious = ip in ip_list
        result = {
            "is_malicious": is_malicious,
            "source": "Feodo Tracker",
            "confidence_level": 75 if is_malicious else 0,
            "malware_types": ["Botnet C2"] if is_malicious else [],
            "error": None,
        }
        cache[cache_key] = result
        return result
    except Exception as e:
        logger.error(f"Feodo Tracker error: {e}")
        return {
            "is_malicious": False,
            "source": "Feodo Tracker",
            "confidence_level": 0,
            "malware_types": [],
            "error": str(e),
        }

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def fetch_ipinfo(ip: str, api_key: str):
    cache_key = f"ipinfo_{ip}"
    if cache_key in cache:
        logger.info(f"Returning cached IPInfo data for {ip}")
        return cache[cache_key]

    url = f"https://ipinfo.io/{ip}/json"
    headers = {"Authorization": f"Bearer {api_key}"}

    logger.info(f"Fetching IPInfo data for {ip}")
    resp = requests.get(url, headers=headers)
    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="IPInfo rate limit exceeded")
    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid IPInfo API key")
    resp.raise_for_status()

    data = resp.json()
    loc = data.get("loc", "0,0").split(",")
    result = {
        "latitude": float(loc[0]) if loc[0] else 0,
        "longitude": float(loc[1]) if loc[1] else 0,
        "city": data.get("city", "N/A"),
        "country": data.get("country", "N/A"),
        "error": None,
    }
    cache[cache_key] = result
    return result

@app.get("/threats/ip/{ip}")
def get_threat(ip: str):
    logger.info(f"Processing threat request for IP: {ip}")

    abuseipdb_key = os.getenv("ABUSEIPDB_API_KEY")
    virustotal_key = os.getenv("VIRUSTOTAL_API_KEY")
    ipinfo_key = os.getenv("IPINFO_API_KEY")

    response = {
        "ip": ip,
        "abuseipdb": {"confidence_score": 0, "total_reports": 0, "country": "N/A", "error": None},
        "virustotal": {"malicious_count": 0, "reputation": 0, "scan_results": {}, "error": None},
        "feodo_tracker": {"is_malicious": False, "source": "N/A", "confidence_level": 0, "malware_types": [], "error": None},
        "ipinfo": {"latitude": 0, "longitude": 0, "city": "N/A", "country": "N/A", "error": None},
        "threat_score": 0.0,
        "api_status": {},
    }

    score_components = []

    # AbuseIPDB
    try:
        if abuseipdb_key:
            response["abuseipdb"] = fetch_abuseipdb(ip, abuseipdb_key)
            score_components.append(response["abuseipdb"]["confidence_score"] * 0.5)
            response["api_status"]["abuseipdb"] = "success"
        else:
            response["abuseipdb"]["error"] = "Missing API key"
            response["api_status"]["abuseipdb"] = "failed"
    except Exception as e:
        response["abuseipdb"]["error"] = str(e)
        response["api_status"]["abuseipdb"] = "failed"

    # VirusTotal
    try:
        if virustotal_key:
            response["virustotal"] = fetch_virustotal(ip, virustotal_key)
            score_components.append(response["virustotal"]["malicious_count"] * 0.3)
            response["api_status"]["virustotal"] = "success"
        else:
            response["virustotal"]["error"] = "Missing API key"
            response["api_status"]["virustotal"] = "failed"
    except Exception as e:
        response["virustotal"]["error"] = str(e)
        response["api_status"]["virustotal"] = "failed"

    # Feodo Tracker
    try:
        response["feodo_tracker"] = fetch_feodo_tracker(ip)
        if response["feodo_tracker"]["is_malicious"]:
            score_components.append(response["feodo_tracker"]["confidence_level"] * 0.2)
        response["api_status"]["feodo_tracker"] = "success"
    except Exception as e:
        response["feodo_tracker"]["error"] = str(e)
        response["api_status"]["feodo_tracker"] = "failed"

    # IPInfo
    try:
        if ipinfo_key:
            response["ipinfo"] = fetch_ipinfo(ip, ipinfo_key)
            response["api_status"]["ipinfo"] = "success"
        else:
            response["ipinfo"]["error"] = "Missing API key"
            response["api_status"]["ipinfo"] = "failed"
    except Exception as e:
        response["ipinfo"]["error"] = str(e)
        response["api_status"]["ipinfo"] = "failed"

    # Calculate total threat score capped at 100
    response["threat_score"] = min(sum(score_components), 100)

    logger.info(f"Threat response for {ip}: threat_score={response['threat_score']}")

    return response