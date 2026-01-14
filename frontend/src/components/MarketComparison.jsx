import { motion } from 'framer-motion'
import CountUp from 'react-countup'

function MarketComparison({ comparison, predictedPrice }) {
    if (!comparison) return null

    const formatPrice = (price) => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`
        }
        return `₹${(price / 100000).toFixed(2)} L`
    }

    return (
        <motion.div
            className="market-comparison glass-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            {/* Header */}
            <div className="comparison-header">
                <h3>📊 Market Price Comparison</h3>
                <p>Compare with prices from popular platforms</p>
            </div>

            {/* Platform Prices Grid */}
            <div className="platforms-grid">
                {comparison.platforms.map((platform, index) => (
                    <motion.div
                        key={platform.name}
                        className="platform-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                    >
                        <div className="platform-logo">{platform.logo}</div>
                        <div className="platform-name">{platform.name}</div>
                        <div className="platform-price">{formatPrice(platform.price)}</div>
                        <div className={`price-diff ${platform.price > predictedPrice ? 'higher' : 'lower'}`}>
                            {platform.price > predictedPrice ? '↑' : '↓'}
                            {Math.abs(((platform.price - predictedPrice) / predictedPrice) * 100).toFixed(1)}%
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Our Prediction Highlight */}
            <motion.div
                className="our-prediction"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <div className="prediction-label">🤖 Our AI Prediction</div>
                <div className="prediction-value">{formatPrice(predictedPrice)}</div>
                <div className="market-avg">
                    Market Avg: {formatPrice(comparison.avgMarketPrice)}
                    <span className={comparison.priceDifference > 0 ? 'text-red' : 'text-green'}>
                        ({comparison.priceDifference > 0 ? '+' : ''}{comparison.priceDifference.toFixed(1)}%)
                    </span>
                </div>
            </motion.div>

            {/* Recommendation Box */}
            <motion.div
                className="recommendation-box"
                style={{ borderColor: comparison.recommendationColor }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
            >
                <div
                    className="recommendation-title"
                    style={{ color: comparison.recommendationColor }}
                >
                    {comparison.recommendation}
                </div>
                <p className="recommendation-text">{comparison.reasoning}</p>
                <div className="negotiation-tip">
                    <span className="tip-label">💡 Negotiation Tip:</span>
                    <span className="tip-text">{comparison.negotiationTip}</span>
                </div>
            </motion.div>

            {/* Final Verdict */}
            <motion.div
                className="verdict-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <h4>🏆 Final Verdict</h4>
                <div className="verdict-content">
                    {comparison.priceDifference <= 0 ? (
                        <div className="verdict positive">
                            <span className="verdict-icon">✅</span>
                            <div className="verdict-text">
                                <strong>Recommended to Buy</strong>
                                <p>This property offers good value compared to market rates. Proceed with due diligence.</p>
                            </div>
                        </div>
                    ) : comparison.priceDifference <= 10 ? (
                        <div className="verdict neutral">
                            <span className="verdict-icon">⚖️</span>
                            <div className="verdict-text">
                                <strong>Negotiate Before Buying</strong>
                                <p>Price is slightly above average. Try to negotiate {comparison.priceDifference.toFixed(0)}% discount.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="verdict negative">
                            <span className="verdict-icon">⏳</span>
                            <div className="verdict-text">
                                <strong>Wait or Look Elsewhere</strong>
                                <p>Property is overpriced. Wait for better deals or explore other options.</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default MarketComparison
