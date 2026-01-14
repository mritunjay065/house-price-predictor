import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

function InvestmentROI({ currentPrice, city }) {
    // City-based appreciation rates (annual %)
    const cityAppreciation = {
        'Mumbai': 7.5,
        'Delhi': 6.8,
        'Bangalore': 8.2,
        'Hyderabad': 9.0,
        'Pune': 7.0,
        'Chennai': 6.5,
        'Kolkata': 5.5,
        'Ahmedabad': 6.0,
        'Jaipur': 5.8,
        'Lucknow': 5.0,
        'Surat': 6.2
    }

    const appreciationRate = cityAppreciation[city] || 6.0

    // Generate 5-year projection
    const projectionData = []
    let price = currentPrice

    for (let year = 0; year <= 5; year++) {
        projectionData.push({
            year: year === 0 ? 'Now' : `${year}Y`,
            price: Math.round(price),
            displayPrice: formatPrice(price)
        })
        price *= (1 + appreciationRate / 100)
    }

    const finalPrice = projectionData[5].price
    const totalGain = finalPrice - currentPrice
    const roiPercent = ((finalPrice - currentPrice) / currentPrice) * 100

    function formatPrice(price) {
        if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
        return `₹${(price / 100000).toFixed(2)} L`
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="roi-tooltip">
                    <p className="tooltip-price">{payload[0].payload.displayPrice}</p>
                    <p className="tooltip-year">{payload[0].payload.year}</p>
                </div>
            )
        }
        return null
    }

    return (
        <motion.div
            className="investment-roi glass-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="roi-title">📈 Investment Projection</h3>
            <p className="roi-subtitle">5-Year Price Forecast for {city}</p>

            {/* Chart */}
            <div className="roi-chart">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={projectionData}>
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="year"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="url(#priceGradient)"
                            dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#8b5cf6' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* ROI Stats */}
            <div className="roi-stats">
                <motion.div
                    className="roi-stat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="roi-stat-label">Current Value</div>
                    <div className="roi-stat-value">{formatPrice(currentPrice)}</div>
                </motion.div>

                <motion.div
                    className="roi-stat highlight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="roi-stat-label">5-Year Value</div>
                    <div className="roi-stat-value">{formatPrice(finalPrice)}</div>
                </motion.div>

                <motion.div
                    className="roi-stat gain"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="roi-stat-label">Expected Gain</div>
                    <div className="roi-stat-value positive">
                        +{formatPrice(totalGain)}
                    </div>
                </motion.div>
            </div>

            {/* ROI Percentage */}
            <motion.div
                className="roi-percent-box"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
            >
                <span className="roi-percent-label">Total ROI</span>
                <span className="roi-percent-value">
                    +<CountUp end={roiPercent} decimals={1} duration={1.5} />%
                </span>
                <span className="roi-rate">(~{appreciationRate}% p.a.)</span>
            </motion.div>

            <p className="roi-disclaimer">
                *Based on historical appreciation rates. Actual returns may vary.
            </p>
        </motion.div>
    )
}

export default InvestmentROI
