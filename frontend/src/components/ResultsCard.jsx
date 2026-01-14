import { motion } from 'framer-motion'
import CountUp from 'react-countup'

function ResultsCard({ prediction, inputData, showPulse }) {
    if (!prediction) {
        return (
            <motion.div
                className="results-card glass-card"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="results-placeholder">
                    <div className="placeholder-icon">🏠</div>
                    <p>Fill in the property details and click<br />"Get Price Prediction" to see results</p>
                </div>
            </motion.div>
        )
    }

    const { prediction: pred, location } = prediction
    const priceValue = pred.price
    const priceInLakhs = priceValue / 100000
    const pricePerSqft = pred.price_per_sqft

    // Generate factors
    const factors = [
        {
            name: 'Property Size',
            impact: `${inputData?.area?.toLocaleString() || '0'} sq ft`,
            percent: inputData?.area > 3000 ? 25 : 15,
            positive: true
        },
        {
            name: 'Location',
            impact: inputData?.city || 'N/A',
            percent: ['Mumbai', 'Delhi', 'Bangalore'].includes(inputData?.city) ? 35 : 15,
            positive: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'].includes(inputData?.city)
        },
        {
            name: 'Bedrooms',
            impact: `${inputData?.bedrooms || 0} BHK`,
            percent: (inputData?.bedrooms || 0) * 5,
            positive: true
        },
        {
            name: 'Safety Score',
            impact: `${location?.safety_score?.toFixed(1) || '5.0'}/10`,
            percent: ((location?.safety_score || 5) - 5) * 3,
            positive: (location?.safety_score || 5) >= 5
        }
    ]

    return (
        <motion.div
            className="results-card glass-card"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
        >
            {/* Live Indicator */}
            <div className="live-indicator">
                <span className="live-dot"></span>
                <span>Live Market Data</span>
            </div>

            {/* Price Display */}
            <motion.div
                className={`price-display ${showPulse ? 'pulse' : ''}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="price-label">Estimated Price</div>
                <motion.div
                    className="price-value"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    ₹<CountUp end={priceInLakhs} decimals={2} duration={1.5} delay={0.3} /> L
                </motion.div>
                <div className="price-range">Range: {pred.price_range?.formatted}</div>
            </motion.div>

            {/* Confidence */}
            <motion.div
                className="confidence-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="confidence-header">
                    <span className="confidence-label">Confidence</span>
                    <span className="confidence-value">
                        <CountUp end={pred.confidence} decimals={0} duration={1} delay={0.5} />%
                    </span>
                </div>
                <div className="confidence-bar">
                    <motion.div
                        className="confidence-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.confidence}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                    />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="stats-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <div className="stat-value">
                            ₹<CountUp end={Math.round(pricePerSqft)} duration={1} delay={0.8} separator="," />
                        </div>
                        <div className="stat-label">Per Sq Ft</div>
                    </div>
                </motion.div>

                <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">🛡️</div>
                    <div className="stat-info">
                        <div className="stat-value">{location?.safety_score?.toFixed(1) || '5.0'}</div>
                        <div className="stat-label">Safety Score</div>
                    </div>
                </motion.div>

                <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: 'var(--success)' }}>Fair</div>
                        <div className="stat-label">Market Status</div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Top Factors */}
            <motion.div
                className="factors-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
            >
                <h4 className="factors-title">Why This Price?</h4>
                <div className="factors-list">
                    {factors.map((factor, index) => (
                        <motion.div
                            key={factor.name}
                            className="factor-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                        >
                            <div className={`factor-icon ${factor.positive ? 'positive' : 'negative'}`}>
                                {factor.positive ? '↑' : '↓'}
                            </div>
                            <div className="factor-info">
                                <div className="factor-name">{factor.name}</div>
                                <div className="factor-impact">{factor.impact}</div>
                            </div>
                            <div className={`factor-percent ${factor.positive ? 'positive' : 'negative'}`}>
                                {factor.positive ? '+' : ''}{factor.percent.toFixed(0)}%
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default ResultsCard
