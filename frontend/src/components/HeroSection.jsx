import { motion } from 'framer-motion'
import CountUp from 'react-countup'

function HeroSection() {
    return (
        <section className="hero">
            <div className="container">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <span className="gradient-text">AI-Powered</span>
                        <br />House Price Prediction
                    </motion.h1>

                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Get accurate property valuations using advanced Machine Learning models.
                        Powered by XGBoost, LightGBM, and CatBoost ensemble.
                    </motion.p>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <div className="stat">
                            <span className="stat-number">
                                <CountUp end={95} duration={2} delay={0.8} />%+
                            </span>
                            <span className="stat-label">Accuracy</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">
                                <CountUp end={3} duration={1.5} delay={1} />
                            </span>
                            <span className="stat-label">ML Models</span>
                        </div>
                        <div className="stat">
                            <motion.span
                                className="stat-number"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
                            >
                                Instant
                            </motion.span>
                            <span className="stat-label">Results</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default HeroSection
