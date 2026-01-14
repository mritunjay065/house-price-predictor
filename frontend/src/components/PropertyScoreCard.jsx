import { motion } from 'framer-motion'
import CountUp from 'react-countup'

function PropertyScoreCard({ prediction, inputData }) {
    // Calculate overall property score (0-100)
    const calculateScore = () => {
        let score = 50 // Base score

        // Location score (based on safety)
        const safetyScore = prediction?.location?.safety_score || 5
        score += (safetyScore - 5) * 4 // -20 to +20

        // Size score
        const area = inputData?.area || 1500
        if (area >= 3000) score += 10
        else if (area >= 2000) score += 5
        else if (area < 1000) score -= 5

        // Amenities score
        const amenities = ['mainroad', 'airconditioning', 'basement', 'guestroom', 'prefarea']
        const amenityCount = amenities.filter(a => inputData?.[a]).length
        score += amenityCount * 3

        // Furnishing score
        if (inputData?.furnishingstatus === 'furnished') score += 8
        else if (inputData?.furnishingstatus === 'semi-furnished') score += 4

        // Price value score (based on market comparison)
        const confidence = prediction?.prediction?.confidence || 85
        score += (confidence - 85) * 2

        return Math.min(100, Math.max(0, Math.round(score)))
    }

    const score = calculateScore()

    const getScoreGrade = (score) => {
        if (score >= 85) return { grade: 'A+', label: 'Excellent', color: '#10b981' }
        if (score >= 75) return { grade: 'A', label: 'Very Good', color: '#22d3ee' }
        if (score >= 65) return { grade: 'B+', label: 'Good', color: '#6366f1' }
        if (score >= 55) return { grade: 'B', label: 'Average', color: '#f59e0b' }
        if (score >= 45) return { grade: 'C', label: 'Below Avg', color: '#f97316' }
        return { grade: 'D', label: 'Poor', color: '#ef4444' }
    }

    const { grade, label, color } = getScoreGrade(score)
    const circumference = 2 * Math.PI * 70 // radius = 70
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <motion.div
            className="property-score-card glass-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="score-title">🎯 Property Score</h3>

            {/* Circular Score Gauge */}
            <div className="score-gauge">
                <svg viewBox="0 0 160 160" className="score-ring">
                    {/* Background circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                    />
                    {/* Score circle */}
                    <motion.circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        transform="rotate(-90 80 80)"
                    />
                </svg>
                <div className="score-content">
                    <motion.div
                        className="score-number"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                    >
                        <CountUp end={score} duration={1.5} />
                    </motion.div>
                    <div className="score-grade" style={{ color }}>{grade}</div>
                </div>
            </div>

            <div className="score-label" style={{ color }}>{label}</div>

            {/* Score Breakdown */}
            <div className="score-breakdown">
                <ScoreItem label="Location" value={Math.min(100, (prediction?.location?.safety_score || 5) * 10)} />
                <ScoreItem label="Size" value={Math.min(100, ((inputData?.area || 1500) / 50))} />
                <ScoreItem label="Amenities" value={Math.min(100, ['mainroad', 'airconditioning', 'basement', 'guestroom', 'prefarea'].filter(a => inputData?.[a]).length * 20)} />
                <ScoreItem label="Value" value={Math.min(100, prediction?.prediction?.confidence || 85)} />
            </div>
        </motion.div>
    )
}

function ScoreItem({ label, value }) {
    return (
        <div className="score-item">
            <div className="score-item-header">
                <span>{label}</span>
                <span>{Math.round(value)}%</span>
            </div>
            <div className="score-item-bar">
                <motion.div
                    className="score-item-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8 }}
                    style={{
                        background: value >= 70 ? 'var(--success)' : value >= 50 ? 'var(--warning)' : 'var(--danger)'
                    }}
                />
            </div>
        </div>
    )
}

export default PropertyScoreCard
