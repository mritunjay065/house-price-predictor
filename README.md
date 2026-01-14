# 🏠 House Price Prediction AI

> **AI-powered property valuation system with ML ensemble models, real-time market data, and investment insights**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)
![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)

---

## ✨ Features

### 🤖 ML-Powered Predictions
- **Ensemble Model**: XGBoost + LightGBM weighted average
- **SHAP Explainability**: Understand what drives the price
- **Confidence Intervals**: Price ranges for better decision-making

### 🌐 Real-Time Intelligence
- **Perplexity AI API Integration**: Live market data for any city
- **Dynamic City Support**: 28+ predefined cities + custom city input
- **Real-Time Crime Data**: Safety scores fetched via AI for unknown cities

### 📊 Market Intelligence
- **Price Comparison**: Compare across 5 platforms (Housing.com, 99acres, MagicBricks, NoBroker, CommonFloor)
- **Buy/Wait Recommendations**: AI-driven purchase suggestions

### 💰 Financial Tools
- **EMI Calculator**: Interactive loan calculator with sliders
- **Investment ROI**: 5-year price appreciation forecast
- **Property Score Card**: 0-100 rating like credit scores

### 🎨 Premium UX
- **Dark/Light Themes**: Toggle between modes
- **Glassmorphism Design**: Modern, premium aesthetics
- **Framer Motion**: Smooth animations

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- Perplexity API Key (optional, for real-time data)

### Installation

**Option 1: Easy Start**
```bash
# Windows - double-click
start_app.bat
```

**Option 2: Manual Start**

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Access:** http://localhost:5173

### Environment Variables

Create `backend/.env`:
```
PERPLEXITY_API_KEY=your_api_key_here
```

---

## 📁 Project Structure

```
House-prediction/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # API keys (create this)
│   ├── src/
│   │   ├── ai_integration.py  # Perplexity AI API integration
│   │   ├── data_processing.py # Data & feature engineering
│   │   ├── model_training.py  # XGBoost + LightGBM ensemble
│   │   └── explainer.py       # SHAP explainability
│   └── models/                # Trained model storage
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React app
│   │   └── components/        # UI components
│   └── dist/                  # Production build
├── start_app.bat              # Quick launcher
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **ML Models** | XGBoost, LightGBM |
| **AI Integration** | Perplexity AI API (real-time data) |
| **Backend** | Python, Flask, Pandas, Scikit-learn, SHAP |
| **Frontend** | React 18, Vite, Framer Motion, Recharts |
| **Styling** | CSS3 Glassmorphism |

---

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/predict` | POST | Get price prediction |
| `/api/explain` | POST | Get SHAP explanations |
| `/api/compare` | POST | Find similar properties |
| `/api/market-data` | POST | Real-time market data (AI) |

---

## 🌐 Supported Cities

**28 predefined cities**: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Lucknow, Surat, Thane, Nagpur, Indore, Bhopal, Visakhapatnam, Patna, Vadodara, Ghaziabad, Ludhiana, Agra, Nashik, Faridabad, Meerut, Rajkot, Varanasi, Srinagar, Kanpur

**+ Any other city**: Select "Others" and type any city name. Real-time data will be fetched using Perplexity AI API.

---

## 🚀 Deployment

The Flask backend serves the built frontend. Deploy only the backend:

```bash
cd frontend && npm run build  # Build frontend first
cd ../backend && python app.py  # Serves everything
```

**Platforms**: Railway, Render, Heroku, AWS

---

## 📄 License

MIT License - see [LICENSE.txt](LICENSE.txt)

---

**© 2026 | Built with Python, Machine Learning**
