"""
Flask API for House Price Prediction
With Perplexity AI Integration for Real-time Market Data
"""
import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.data_processing import (
    prepare_prediction_input, 
    get_city_crime_score, 
    CITY_CRIME_INDEX,
    prepare_training_data
)
from src.model_training import HousePriceModel
from src.explainer import ModelExplainer, get_similar_properties, compare_to_market
from src.ai_integration import perplexity_ai

# Paths
BASE_PATH = Path(__file__).parent
FRONTEND_DIST = BASE_PATH.parent / 'frontend' / 'dist'

# Flask app with static folder configured
app = Flask(__name__, 
            static_folder=str(FRONTEND_DIST / 'assets'),
            static_url_path='/assets')
CORS(app)

# Global variables for model and data
model = None
explainer = None
X_train = None
y_train = None
feature_names = None

# Paths
BASE_PATH = Path(__file__).parent
MODEL_PATH = BASE_PATH / 'models' / 'house_price_model.joblib'
DATA_PATH = BASE_PATH.parent / 'Housing (1).csv'


def load_model():
    """Load trained model or train if not exists"""
    global model, explainer, X_train, y_train, feature_names
    
    # Prepare training data
    print("Loading training data...")
    X_train, y_train, feature_names, _ = prepare_training_data(str(DATA_PATH))
    
    # Load or train model
    if MODEL_PATH.exists():
        print("Loading existing model...")
        model = HousePriceModel()
        model.load(str(MODEL_PATH))
    else:
        print("Training new model...")
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        model = HousePriceModel()
        model.train(X_train, y_train)
        model.save(str(MODEL_PATH))
    
    # Setup explainer
    print("Setting up explainer...")
    explainer = ModelExplainer(model)
    explainer.setup(X_train)
    
    print("Model ready!")




@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React frontend"""
    from flask import send_from_directory
    
    # Skip API routes - they're handled by other handlers
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # If it's a file request in dist folder, serve it
    file_path = FRONTEND_DIST / path
    if path and file_path.exists() and file_path.is_file():
        return send_from_directory(FRONTEND_DIST, path)
    
    # For assets subfolder
    if path.startswith('assets/'):
        asset_path = FRONTEND_DIST / path
        if asset_path.exists():
            return send_from_directory(FRONTEND_DIST, path)
    
    # Otherwise serve index.html (for React Router)
    index_path = FRONTEND_DIST / 'index.html'
    if index_path.exists():
        return send_from_directory(FRONTEND_DIST, 'index.html')
    else:
        # Fallback if dist not built
        return jsonify({
            'message': '🏠 House Price Prediction API',
            'error': 'Frontend not built. Run: cd frontend && npm run build',
            'api_docs': '/api/health',
            'endpoints': {
                '/api/health': 'Health check',
                '/api/predict': 'POST - Get price prediction'
            }
        }), 404



@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None and model.is_trained
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict house price"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Prepare input features
        input_df = pd.DataFrame([data])
        
        # Add crime data if city provided
        city = data.get('city', 'Default')
        crime_info = get_city_crime_score(city)
        
        # Feature engineering on input
        if 'area' in input_df.columns:
            if 'bedrooms' in input_df.columns:
                input_df['bedroom_ratio'] = input_df['bedrooms'] / input_df['area'] * 1000
            if 'bathrooms' in input_df.columns and 'bedrooms' in input_df.columns:
                input_df['bathroom_ratio'] = input_df['bathrooms'] / input_df['bedrooms'].replace(0, 1)
            if 'bedrooms' in input_df.columns and 'bathrooms' in input_df.columns:
                input_df['total_rooms'] = input_df['bedrooms'] + input_df['bathrooms']
        
        # Binary encodings
        binary_cols = ['mainroad', 'guestroom', 'basement', 'hotwaterheating', 
                       'airconditioning', 'prefarea']
        for col in binary_cols:
            if col in input_df.columns:
                if input_df[col].dtype == object:
                    input_df[col] = input_df[col].map({'yes': 1, 'no': 0}).fillna(0).astype(int)
        
        # Furnishing
        if 'furnishingstatus' in input_df.columns:
            furnishing_map = {'unfurnished': 0, 'semi-furnished': 1, 'furnished': 2}
            input_df['furnishing_score'] = input_df['furnishingstatus'].map(furnishing_map).fillna(1)
        
        # Amenity score
        amenity_cols = [c for c in binary_cols if c in input_df.columns]
        if amenity_cols:
            input_df['amenity_score'] = input_df[amenity_cols].sum(axis=1)
        
        # Ensure all required features exist
        for feat in model.feature_names:
            if feat not in input_df.columns:
                input_df[feat] = 0
        
        # Select only model features
        input_features = input_df[model.feature_names]
        
        # Make prediction
        prediction = model.predict(input_features)
        
        # Format price (Indian format: Lakhs/Crores)
        price = prediction['predicted_price']
        if price >= 10000000:  # 1 Crore
            price_formatted = f"₹{price/10000000:.2f} Cr"
        else:
            price_formatted = f"₹{price/100000:.2f} L"
        
        # Price range formatting
        lower = prediction['price_lower']
        upper = prediction['price_upper']
        if upper >= 10000000:
            range_formatted = f"₹{lower/10000000:.2f} Cr - ₹{upper/10000000:.2f} Cr"
        else:
            range_formatted = f"₹{lower/100000:.2f} L - ₹{upper/100000:.2f} L"
        
        # Calculate price per sqft
        price_per_sqft = price / data.get('area', 1)
        
        response = {
            'success': True,
            'prediction': {
                'price': float(price),
                'price_formatted': price_formatted,
                'price_range': {
                    'lower': float(lower),
                    'upper': float(upper),
                    'formatted': range_formatted
                },
                'price_per_sqft': float(price_per_sqft),
                'confidence': float(prediction['confidence']) * 100
            },
            'location': {
                'city': city,
                'crime_index': crime_info['crime_index'],
                'safety_score': crime_info['safety_score']
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain', methods=['POST'])
def explain():
    """Get explanation for prediction"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Prepare input (same as predict)
        input_df = pd.DataFrame([data])
        
        # Feature engineering
        if 'area' in input_df.columns and 'bedrooms' in input_df.columns:
            input_df['bedroom_ratio'] = input_df['bedrooms'] / input_df['area'] * 1000
        if 'bathrooms' in input_df.columns and 'bedrooms' in input_df.columns:
            input_df['bathroom_ratio'] = input_df['bathrooms'] / input_df['bedrooms'].replace(0, 1)
        if 'bedrooms' in input_df.columns and 'bathrooms' in input_df.columns:
            input_df['total_rooms'] = input_df['bedrooms'] + input_df['bathrooms']
        
        # Binary columns
        binary_cols = ['mainroad', 'guestroom', 'basement', 'hotwaterheating', 
                       'airconditioning', 'prefarea']
        for col in binary_cols:
            if col in input_df.columns:
                if input_df[col].dtype == object:
                    input_df[col] = input_df[col].map({'yes': 1, 'no': 0}).fillna(0).astype(int)
        
        if 'furnishingstatus' in input_df.columns:
            furnishing_map = {'unfurnished': 0, 'semi-furnished': 1, 'furnished': 2}
            input_df['furnishing_score'] = input_df['furnishingstatus'].map(furnishing_map).fillna(1)
        
        amenity_cols = [c for c in binary_cols if c in input_df.columns]
        if amenity_cols:
            input_df['amenity_score'] = input_df[amenity_cols].sum(axis=1)
        
        for feat in model.feature_names:
            if feat not in input_df.columns:
                input_df[feat] = 0
        
        input_features = input_df[model.feature_names]
        
        # Get explanation
        explanation = explainer.explain_prediction(input_features)
        
        return jsonify({
            'success': True,
            'explanation': explanation
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare', methods=['POST'])
def compare():
    """Get similar properties and market comparison"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Prepare input
        input_df = pd.DataFrame([data])
        
        # Feature engineering (simplified)
        for feat in model.feature_names:
            if feat not in input_df.columns:
                input_df[feat] = X_train[feat].median() if feat in X_train.columns else 0
        
        input_features = input_df[model.feature_names]
        
        # Get prediction first
        prediction = model.predict(input_features)
        
        # Get similar properties
        similar = get_similar_properties(X_train, y_train, input_features, n_similar=5)
        
        # Market comparison
        similar_prices = [s['price'] for s in similar]
        market_comparison = compare_to_market(prediction['predicted_price'], similar_prices)
        
        return jsonify({
            'success': True,
            'similar_properties': similar,
            'market_comparison': market_comparison
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/cities', methods=['GET'])
def get_cities():
    """Get list of available cities with crime data"""
    cities = [
        {'name': city, 'crime_index': score, 'safety_score': 10 - score}
        for city, score in CITY_CRIME_INDEX.items()
        if city != 'Default'
    ]
    cities.sort(key=lambda x: x['name'])
    return jsonify({'cities': cities})


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dataset statistics"""
    if X_train is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    stats = {
        'total_properties': len(y_train),
        'price_range': {
            'min': float(y_train.min()),
            'max': float(y_train.max()),
            'mean': float(y_train.mean()),
            'median': float(y_train.median())
        },
        'features': {
            feat: {
                'min': float(X_train[feat].min()),
                'max': float(X_train[feat].max()),
                'mean': float(X_train[feat].mean())
            }
            for feat in ['area', 'bedrooms', 'bathrooms'] 
            if feat in X_train.columns
        },
        'model_metrics': model.metrics.get('individual_models', {}).get('ensemble', {})
    }
    
    return jsonify(stats)


@app.route('/api/feature-importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance from model"""
    importance = model.get_feature_importance()
    
    # Get average importance sorted
    avg_importance = importance.get('average', {})
    sorted_importance = dict(sorted(
        avg_importance.items(),
        key=lambda x: x[1],
        reverse=True
    ))
    
    return jsonify({
        'feature_importance': sorted_importance,
        'model_specific': importance
    })


# ==================== AI-POWERED ENDPOINTS ====================

@app.route('/api/ai/market-data', methods=['GET'])
def get_ai_market_data():
    """Get real-time market data using Perplexity AI"""
    city = request.args.get('city', 'Mumbai')
    
    try:
        market_data = perplexity_ai.get_real_time_market_data(city)
        return jsonify({
            'success': True,
            'data': market_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/listings', methods=['POST'])
def get_ai_listings():
    """Get live property listings using AI"""
    data = request.get_json()
    city = data.get('city', 'Mumbai')
    bedrooms = data.get('bedrooms', 2)
    budget = data.get('budget_lakhs', 50)
    
    try:
        listings = perplexity_ai.get_live_property_listings(city, bedrooms, budget)
        return jsonify({
            'success': True,
            'listings': listings
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/enhance-prediction', methods=['POST'])
def enhance_prediction_ai():
    """Enhance ML prediction with AI insights"""
    data = request.get_json()
    base_price = data.get('base_price', 0)
    city = data.get('city', 'Mumbai')
    area = data.get('area', 1000)
    bedrooms = data.get('bedrooms', 2)
    
    # Collect amenities
    amenities = []
    for key in ['mainroad', 'airconditioning', 'basement', 'guestroom', 'prefarea']:
        if data.get(key):
            amenities.append(key)
    
    try:
        enhanced = perplexity_ai.enhance_prediction(
            base_price, city, area, bedrooms, amenities
        )
        return jsonify({
            'success': True,
            'enhanced_prediction': enhanced
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/market-comparison', methods=['POST'])
def get_ai_market_comparison():
    """Get AI-powered real-time market comparison"""
    data = request.get_json()
    city = data.get('city', 'Mumbai')
    predicted_price = data.get('predicted_price', 5000000)
    
    try:
        comparison = perplexity_ai.get_market_comparison(city, predicted_price)
        return jsonify({
            'success': True,
            'comparison': comparison
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("="*50)
    print("House Price Prediction API")
    print("With Perplexity AI Integration")
    print("="*50)
    # Load model on startup
    load_model()
    # Run server (debug=False for stability)
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)

