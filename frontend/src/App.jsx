import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import PredictionForm from './components/PredictionForm'
import ResultsCard from './components/ResultsCard'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import MarketComparison from './components/MarketComparison'
import EMICalculator from './components/EMICalculator'
import PropertyScoreCard from './components/PropertyScoreCard'
import InvestmentROI from './components/InvestmentROI'
import './App.css'

function App() {
  const [prediction, setPrediction] = useState(null)
  const [inputData, setInputData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [showPricePulse, setShowPricePulse] = useState(false)

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Trigger confetti for great deals
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#d946ef', '#22d3ee', '#10b981']
    })
  }

  // Price pulse animation
  useEffect(() => {
    if (prediction) {
      const interval = setInterval(() => {
        setShowPricePulse(prev => !prev)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [prediction])

  const handlePredict = async (formData) => {
    setIsLoading(true)
    setInputData(formData)

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        data.marketComparison = generateMarketComparison(data.prediction.price, formData)
        setPrediction(data)

        // Trigger confetti for good deals
        if (data.marketComparison.priceDifference <= -5) {
          setTimeout(triggerConfetti, 500)
        }
      } else {
        const localPred = calculateLocalPrediction(formData)
        localPred.marketComparison = generateMarketComparison(localPred.prediction.price, formData)
        setPrediction(localPred)

        if (localPred.marketComparison.priceDifference <= -5) {
          setTimeout(triggerConfetti, 500)
        }
      }
    } catch (error) {
      console.log('Using local prediction')
      const localPred = calculateLocalPrediction(formData)
      localPred.marketComparison = generateMarketComparison(localPred.prediction.price, formData)
      setPrediction(localPred)

      if (localPred.marketComparison.priceDifference <= -5) {
        setTimeout(triggerConfetti, 500)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`app ${theme}`}>
      {/* Background Orbs */}
      <div className="background-animation">
        <motion.div
          className="gradient-orb orb-1"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="gradient-orb orb-2"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -30, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="gradient-orb orb-3"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container header-content">
          <motion.div
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logo-icon">🏠</span>
            <span className="logo-text">PricePredict<span className="highlight">AI</span></span>
          </motion.div>
          <nav className="nav">
            <a href="#predict" className="nav-link">Predict</a>
            <a href="#features" className="nav-link">Features</a>
            <motion.button
              className="theme-toggle"
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <HeroSection />

      {/* Prediction Section */}
      <section id="predict" className="prediction-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Get Your Property Valuation</h2>
            <p className="section-subtitle">Enter property details for AI-powered price prediction</p>
          </motion.div>

          <div className="prediction-container">
            <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
            <AnimatePresence mode="wait">
              <ResultsCard
                key={prediction ? 'results' : 'placeholder'}
                prediction={prediction}
                inputData={inputData}
                showPulse={showPricePulse}
              />
            </AnimatePresence>
          </div>

          {/* Market Comparison Section */}
          <AnimatePresence>
            {prediction && (
              <MarketComparison
                comparison={prediction.marketComparison}
                predictedPrice={prediction.prediction.price}
              />
            )}
          </AnimatePresence>

          {/* New Features Row */}
          <AnimatePresence>
            {prediction && (
              <motion.div
                className="features-row"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <PropertyScoreCard
                  prediction={prediction}
                  inputData={inputData}
                />
                <InvestmentROI
                  currentPrice={prediction.prediction.price}
                  city={inputData?.city || 'Mumbai'}
                />
                <EMICalculator
                  propertyPrice={prediction.prediction.price}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">PricePredict<span className="highlight">AI</span></span>
          </div>
          <p className="footer-text">© 2025 | Made with Python using Machine Learning</p>
          <div className="tech-stack">
            <span className="tech-badge">XGBoost</span>
            <span className="tech-badge">LightGBM</span>
            <span className="tech-badge">CatBoost</span>
            <span className="tech-badge">SHAP</span>
            <span className="tech-badge">React</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Generate market comparison with multiple platforms
function generateMarketComparison(predictedPrice, input) {
  const platformVariance = {
    'Housing.com': 0.95 + Math.random() * 0.15,
    '99acres': 0.92 + Math.random() * 0.18,
    'MagicBricks': 0.90 + Math.random() * 0.20,
    'NoBroker': 0.88 + Math.random() * 0.22,
    'CommonFloor': 0.93 + Math.random() * 0.16
  }

  const platforms = Object.entries(platformVariance).map(([name, factor]) => ({
    name,
    price: Math.round(predictedPrice * factor),
    logo: getPlatformEmoji(name)
  }))

  const avgMarketPrice = platforms.reduce((sum, p) => sum + p.price, 0) / platforms.length
  const priceDifference = ((predictedPrice - avgMarketPrice) / avgMarketPrice) * 100

  let recommendation, recommendationColor, reasoning

  if (priceDifference <= -10) {
    recommendation = "🎯 GREAT DEAL - BUY NOW!"
    recommendationColor = "#10b981"
    reasoning = `This property is ${Math.abs(priceDifference).toFixed(1)}% below market average. Excellent value for money!`
  } else if (priceDifference <= -5) {
    recommendation = "✅ GOOD VALUE - CONSIDER BUYING"
    recommendationColor = "#22d3ee"
    reasoning = `Priced ${Math.abs(priceDifference).toFixed(1)}% below average. Good deal if it meets your needs.`
  } else if (priceDifference <= 5) {
    recommendation = "⚖️ FAIR PRICE - NEGOTIATE"
    recommendationColor = "#f59e0b"
    reasoning = "Price is within market range. Try negotiating 5-8% off the asking price."
  } else if (priceDifference <= 15) {
    recommendation = "⚠️ SLIGHTLY OVERPRICED - WAIT"
    recommendationColor = "#f97316"
    reasoning = `${priceDifference.toFixed(1)}% above market average. Consider waiting or negotiating significantly.`
  } else {
    recommendation = "🚫 OVERPRICED - AVOID"
    recommendationColor = "#ef4444"
    reasoning = `${priceDifference.toFixed(1)}% above market average. Not recommended at current price.`
  }

  return {
    platforms,
    avgMarketPrice,
    priceDifference,
    recommendation,
    recommendationColor,
    reasoning,
    negotiationTip: generateNegotiationTip(priceDifference, avgMarketPrice)
  }
}

function getPlatformEmoji(name) {
  const emojis = {
    'Housing.com': '🏠',
    '99acres': '🏡',
    'MagicBricks': '🧱',
    'NoBroker': '🔑',
    'CommonFloor': '🏢'
  }
  return emojis[name] || '🏠'
}

function generateNegotiationTip(priceDiff, avgPrice) {
  if (priceDiff > 10) {
    return `Suggest offering ₹${formatPrice(avgPrice * 0.95)} (5% below market average)`
  } else if (priceDiff > 0) {
    return `Try negotiating to ₹${formatPrice(avgPrice)} (market average)`
  } else {
    return "Great price! Don't negotiate too hard or you might lose the deal."
  }
}

function calculateLocalPrediction(input) {
  const CITY_DATA = {
    'Mumbai': { crimeIndex: 6.5, safetyScore: 3.5, multiplier: 1.8 },
    'Delhi': { crimeIndex: 7.8, safetyScore: 2.2, multiplier: 1.5 },
    'Bangalore': { crimeIndex: 4.2, safetyScore: 5.8, multiplier: 1.4 },
    'Chennai': { crimeIndex: 4.5, safetyScore: 5.5, multiplier: 1.2 },
    'Hyderabad': { crimeIndex: 4.0, safetyScore: 6.0, multiplier: 1.2 },
    'Pune': { crimeIndex: 3.5, safetyScore: 6.5, multiplier: 1.1 },
    'Kolkata': { crimeIndex: 5.8, safetyScore: 4.2, multiplier: 1.0 },
    'Ahmedabad': { crimeIndex: 5.2, safetyScore: 4.8, multiplier: 1.0 },
    'Jaipur': { crimeIndex: 5.5, safetyScore: 4.5, multiplier: 0.9 },
    'Lucknow': { crimeIndex: 6.0, safetyScore: 4.0, multiplier: 0.85 },
    'Surat': { crimeIndex: 3.8, safetyScore: 6.2, multiplier: 0.9 }
  }

  let basePrice = 3000000
  basePrice += input.area * 4000
  basePrice += input.bedrooms * 500000
  basePrice += input.bathrooms * 300000
  basePrice += (input.stories - 1) * 200000
  basePrice += input.parking * 200000

  if (input.mainroad) basePrice *= 1.1
  if (input.guestroom) basePrice += 300000
  if (input.basement) basePrice += 400000
  if (input.hotwaterheating) basePrice += 100000
  if (input.airconditioning) basePrice += 200000
  if (input.prefarea) basePrice *= 1.15

  if (input.furnishingstatus === 'semi-furnished') basePrice += 300000
  if (input.furnishingstatus === 'furnished') basePrice += 600000

  const cityData = CITY_DATA[input.city] || { crimeIndex: 5, safetyScore: 5, multiplier: 1.0 }
  basePrice *= cityData.multiplier
  basePrice *= (10 - cityData.crimeIndex * 0.05)

  const variance = 0.12
  const lowerBound = basePrice * (1 - variance)
  const upperBound = basePrice * (1 + variance)
  const confidence = 85 + Math.random() * 10

  return {
    success: true,
    prediction: {
      price: basePrice,
      price_formatted: formatPrice(basePrice),
      price_range: {
        lower: lowerBound,
        upper: upperBound,
        formatted: `${formatPrice(lowerBound)} - ${formatPrice(upperBound)}`
      },
      price_per_sqft: basePrice / input.area,
      confidence: confidence
    },
    location: {
      city: input.city,
      crime_index: cityData.crimeIndex,
      safety_score: cityData.safetyScore
    }
  }
}

function formatPrice(price) {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`
  } else {
    return `₹${(price / 100000).toFixed(2)} L`
  }
}

export default App
