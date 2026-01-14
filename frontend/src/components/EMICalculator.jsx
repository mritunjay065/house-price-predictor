import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

function EMICalculator({ propertyPrice }) {
    const [loanAmount, setLoanAmount] = useState(Math.round(propertyPrice * 0.8)) // 80% of property price
    const [interestRate, setInterestRate] = useState(8.5)
    const [tenure, setTenure] = useState(20)

    // Calculate EMI
    const calculateEMI = () => {
        const principal = loanAmount
        const monthlyRate = interestRate / 12 / 100
        const months = tenure * 12

        if (monthlyRate === 0) return principal / months

        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1)
        return emi
    }

    const emi = calculateEMI()
    const totalPayment = emi * tenure * 12
    const totalInterest = totalPayment - loanAmount

    const formatCurrency = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
        return `₹${amount.toLocaleString()}`
    }

    return (
        <motion.div
            className="emi-calculator glass-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="emi-title">💳 EMI Calculator</h3>

            {/* Loan Amount Slider */}
            <div className="slider-group">
                <div className="slider-header">
                    <span>Loan Amount</span>
                    <span className="slider-value">{formatCurrency(loanAmount)}</span>
                </div>
                <input
                    type="range"
                    min={propertyPrice * 0.1}
                    max={propertyPrice * 0.9}
                    step={100000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="slider"
                />
                <div className="slider-range">
                    <span>10%</span>
                    <span>90%</span>
                </div>
            </div>

            {/* Interest Rate Slider */}
            <div className="slider-group">
                <div className="slider-header">
                    <span>Interest Rate</span>
                    <span className="slider-value">{interestRate}% p.a.</span>
                </div>
                <input
                    type="range"
                    min={6}
                    max={15}
                    step={0.1}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="slider"
                />
                <div className="slider-range">
                    <span>6%</span>
                    <span>15%</span>
                </div>
            </div>

            {/* Tenure Slider */}
            <div className="slider-group">
                <div className="slider-header">
                    <span>Loan Tenure</span>
                    <span className="slider-value">{tenure} Years</span>
                </div>
                <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="slider"
                />
                <div className="slider-range">
                    <span>5 yrs</span>
                    <span>30 yrs</span>
                </div>
            </div>

            {/* EMI Display */}
            <motion.div
                className="emi-result"
                key={emi}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="emi-label">Monthly EMI</div>
                <div className="emi-value">
                    ₹<CountUp end={Math.round(emi)} duration={0.5} separator="," />
                </div>
            </motion.div>

            {/* Payment Breakdown */}
            <div className="emi-breakdown">
                <div className="breakdown-item">
                    <span className="breakdown-label">Principal</span>
                    <span className="breakdown-value principal">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="breakdown-item">
                    <span className="breakdown-label">Total Interest</span>
                    <span className="breakdown-value interest">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="breakdown-item total">
                    <span className="breakdown-label">Total Payment</span>
                    <span className="breakdown-value">{formatCurrency(totalPayment)}</span>
                </div>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="breakdown-bar">
                <motion.div
                    className="bar-principal"
                    initial={{ width: 0 }}
                    animate={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
                <motion.div
                    className="bar-interest"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                />
            </div>
            <div className="bar-legend">
                <span><span className="dot principal"></span> Principal</span>
                <span><span className="dot interest"></span> Interest</span>
            </div>
        </motion.div>
    )
}

export default EMICalculator
