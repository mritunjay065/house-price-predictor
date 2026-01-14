import { useState } from 'react'
import { motion } from 'framer-motion'

const CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
    'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat',
    'Thane', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Patna',
    'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
    'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Kanpur'
]

const CITY_SAFETY = {
    'Mumbai': 3.5, 'Delhi': 2.2, 'Bangalore': 5.8, 'Chennai': 5.5,
    'Hyderabad': 6.0, 'Pune': 6.5, 'Kolkata': 4.2, 'Ahmedabad': 4.8,
    'Jaipur': 4.5, 'Lucknow': 4.0, 'Surat': 6.2, 'Thane': 5.0,
    'Nagpur': 5.2, 'Indore': 6.0, 'Bhopal': 4.5, 'Visakhapatnam': 6.5,
    'Patna': 3.2, 'Vadodara': 6.0, 'Ghaziabad': 3.8, 'Ludhiana': 5.0,
    'Agra': 4.2, 'Nashik': 5.8, 'Faridabad': 3.5, 'Meerut': 4.0,
    'Rajkot': 6.5, 'Varanasi': 4.5, 'Srinagar': 3.0, 'Kanpur': 3.5
}

const AMENITIES = [
    { key: 'mainroad', icon: '🛣️', label: 'Main Road' },
    { key: 'guestroom', icon: '🛏️', label: 'Guest Room' },
    { key: 'basement', icon: '🏗️', label: 'Basement' },
    { key: 'hotwaterheating', icon: '🔥', label: 'Hot Water' },
    { key: 'airconditioning', icon: '❄️', label: 'AC' },
    { key: 'prefarea', icon: '⭐', label: 'Premium' }
]

function PredictionForm({ onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        area: '',
        bedrooms: '',
        bathrooms: '',
        stories: '',
        parking: '',
        city: '',
        customCity: '',
        furnishingstatus: 'unfurnished',
        mainroad: false,
        guestroom: false,
        basement: false,
        hotwaterheating: false,
        airconditioning: false,
        prefarea: false
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleAmenityToggle = (key) => {
        setFormData(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleFurnishingChange = (value) => {
        setFormData(prev => ({
            ...prev,
            furnishingstatus: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const selectedCity = formData.city === 'Others' ? formData.customCity : formData.city
        onSubmit({
            ...formData,
            city: selectedCity,
            area: parseInt(formData.area) || 1500,
            bedrooms: parseInt(formData.bedrooms) || 3,
            bathrooms: parseInt(formData.bathrooms) || 2,
            stories: parseInt(formData.stories) || 2,
            parking: parseInt(formData.parking) || 1
        })
    }

    const displayCity = formData.city === 'Others' ? formData.customCity : formData.city
    const safetyScore = CITY_SAFETY[displayCity] || (displayCity ? 5.0 : 0)
    const safetyPercent = (safetyScore / 10) * 100

    return (
        <motion.div
            className="form-card glass-card"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <form onSubmit={handleSubmit}>
                {/* Property Details */}
                <div className="form-section">
                    <h3 className="form-section-title">
                        <span>📐</span> Property Details
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Area (sq ft)</label>
                            <motion.input
                                type="number"
                                name="area"
                                placeholder="e.g., 1500"
                                value={formData.area}
                                onChange={handleChange}
                                required
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Bedrooms</label>
                            <motion.input
                                type="number"
                                name="bedrooms"
                                placeholder="e.g., 3"
                                min="1"
                                max="10"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                required
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Bathrooms</label>
                            <motion.input
                                type="number"
                                name="bathrooms"
                                placeholder="e.g., 2"
                                min="1"
                                max="10"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                required
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Stories/Floors</label>
                            <motion.input
                                type="number"
                                name="stories"
                                placeholder="e.g., 2"
                                min="1"
                                max="10"
                                value={formData.stories}
                                onChange={handleChange}
                                required
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Parking Spaces</label>
                            <motion.input
                                type="number"
                                name="parking"
                                placeholder="e.g., 1"
                                min="0"
                                max="5"
                                value={formData.parking}
                                onChange={handleChange}
                                required
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="form-section">
                    <h3 className="form-section-title">
                        <span>📍</span> Location & Safety
                    </h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>City</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select City</option>
                                {CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="Others">Others (Enter manually)</option>
                            </select>
                        </div>

                        {formData.city === 'Others' && (
                            <motion.div
                                className="form-group full-width"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                            >
                                <label>Enter City Name</label>
                                <motion.input
                                    type="text"
                                    name="customCity"
                                    placeholder="e.g., Coimbatore, Mysore, Kochi..."
                                    value={formData.customCity}
                                    onChange={handleChange}
                                    required
                                    whileFocus={{ scale: 1.02 }}
                                    style={{ textTransform: 'capitalize' }}
                                />
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    🌐 Real-time data will be fetched using AI
                                </small>
                            </motion.div>
                        )}

                        {displayCity && (
                            <motion.div
                                className="form-group full-width"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px'
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Area Safety Score
                                </div>
                                <div style={{
                                    height: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    marginBottom: '8px'
                                }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${safetyPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            height: '100%',
                                            background: safetyScore >= 5 ? 'var(--success)' : safetyScore >= 4 ? 'var(--warning)' : 'var(--danger)',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {displayCity}: {safetyScore >= 5 ? 'High Safety' : safetyScore >= 4 ? 'Moderate' : 'Lower Safety'} ({safetyScore}/10)
                                    {formData.city === 'Others' && ' (AI estimated)'}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Amenities */}
                <div className="form-section">
                    <h3 className="form-section-title">
                        <span>✨</span> Amenities
                    </h3>
                    <div className="amenities-grid">
                        {AMENITIES.map((amenity, index) => (
                            <motion.div
                                key={amenity.key}
                                className={`checkbox-card ${formData[amenity.key] ? 'active' : ''}`}
                                onClick={() => handleAmenityToggle(amenity.key)}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="checkbox-icon">{amenity.icon}</span>
                                <span className="checkbox-label">{amenity.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Furnishing */}
                <div className="form-section">
                    <h3 className="form-section-title">
                        <span>🪑</span> Furnishing Status
                    </h3>
                    <div className="radio-group">
                        {[
                            { value: 'unfurnished', icon: '📦', label: 'Unfurnished' },
                            { value: 'semi-furnished', icon: '🛋️', label: 'Semi-Furnished' },
                            { value: 'furnished', icon: '🏡', label: 'Fully Furnished' }
                        ].map((option, index) => (
                            <motion.div
                                key={option.value}
                                className={`radio-card ${formData.furnishingstatus === option.value ? 'active' : ''}`}
                                onClick={() => handleFurnishingChange(option.value)}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="radio-icon">{option.icon}</span>
                                <span className="radio-label">{option.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                    {isLoading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                        />
                    ) : (
                        <>
                            <span>Get Price Prediction</span>
                            <span>→</span>
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    )
}

export default PredictionForm
