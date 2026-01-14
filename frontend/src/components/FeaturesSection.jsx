import { motion } from 'framer-motion'

const FEATURES = [
    {
        icon: '🗺️',
        title: 'Crime Rate Analysis',
        description: 'City-level safety scores integrated into predictions'
    },
    {
        icon: '📊',
        title: 'Explainable AI',
        description: 'SHAP-powered insights into price factors'
    },
    {
        icon: '📈',
        title: 'Confidence Intervals',
        description: 'Price ranges for better decision making'
    },
    {
        icon: '🧠',
        title: 'Ensemble Models',
        description: 'XGBoost, LightGBM & CatBoost combined'
    }
]

function FeaturesSection() {
    return (
        <section id="features" className="features-section">
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title">What Makes Us Unique</h2>
                    <p className="section-subtitle">Advanced features for accurate predictions</p>
                </motion.div>

                <div className="features-grid">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="feature-card glass-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                scale: 1.05,
                                y: -5,
                                boxShadow: "0 20px 40px rgba(99, 102, 241, 0.2)"
                            }}
                        >
                            <motion.div
                                className="feature-icon"
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {feature.icon}
                            </motion.div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
