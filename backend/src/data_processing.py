"""
Data Processing Module
Handles data loading, cleaning, feature engineering, and crime data integration
"""

import pandas as pd
import numpy as np
from pathlib import Path
import os


# City crime index based on NCRB data (normalized 1-10 scale, higher = more crime)
# Extended list of 50+ major Indian cities
CITY_CRIME_INDEX = {
    # Tier 1 Metro Cities
    'Delhi': 7.8,
    'Mumbai': 6.5,
    'Bangalore': 4.2,
    'Chennai': 4.5,
    'Kolkata': 5.8,
    'Hyderabad': 4.0,
    
    # Tier 2 Major Cities
    'Pune': 3.5,
    'Ahmedabad': 5.2,
    'Jaipur': 5.5,
    'Lucknow': 6.0,
    'Surat': 3.8,
    'Kanpur': 6.5,
    'Nagpur': 4.8,
    'Indore': 4.0,
    'Thane': 5.0,
    'Bhopal': 5.5,
    'Visakhapatnam': 3.5,
    'Patna': 6.8,
    'Vadodara': 4.0,
    'Ghaziabad': 6.2,
    'Ludhiana': 5.0,
    'Agra': 5.8,
    'Nashik': 4.2,
    'Faridabad': 6.5,
    'Meerut': 6.0,
    'Rajkot': 3.5,
    'Varanasi': 5.5,
    'Srinagar': 7.0,
    
    # Additional Major Cities
    'Coimbatore': 3.2,
    'Chandigarh': 3.8,
    'Noida': 5.5,
    'Gurgaon': 5.8,
    'Kochi': 3.0,
    'Mangalore': 2.8,
    'Mysore': 3.5,
    'Trivandrum': 3.2,
    'Madurai': 4.0,
    'Jodhpur': 4.5,
    'Udaipur': 3.5,
    'Dehradun': 4.2,
    'Amritsar': 5.0,
    'Ranchi': 5.5,
    'Bhubaneswar': 4.0,
    'Guwahati': 4.8,
    'Raipur': 4.5,
    'Vijayawada': 4.2,
    'Tiruchirappalli': 3.8,
    'Salem': 4.0,
    'Guntur': 4.5,
    'Nellore': 4.0,
    'Tirupati': 3.2,
    'Shimla': 2.5,
    'Pondicherry': 3.0,
    'Goa': 3.5,
    'Jammu': 5.5,
    'Jalandhar': 4.8,
    'Belgaum': 4.0,
    'Hubli': 4.2,
    'Vellore': 3.5,
    'Aurangabad': 4.8,
    'Solapur': 4.5,
    'Aligarh': 5.5,
    'Bareilly': 5.2,
    'Moradabad': 5.8,
    'Gorakhpur': 5.5,
    'Allahabad': 5.5,
    'Jabalpur': 5.0,
    'Gwalior': 5.2,
    'Dhanbad': 5.8,
    'Jamshedpur': 4.5,
    'Bokaro': 5.0,
    'Asansol': 5.5,
    'Durgapur': 4.8,
    'Siliguri': 5.0,
    'Cuttack': 4.5,
    
    # Default for unknown cities
    'Default': 5.0
}


def load_housing_data(filepath: str) -> pd.DataFrame:
    """Load housing dataset from CSV"""
    df = pd.read_csv(filepath)
    return df


def load_crime_data(filepath: str) -> pd.DataFrame:
    """Load and aggregate crime data by city (complete dataset)"""
    df = pd.read_csv(filepath)
    
    # Aggregate crime counts by city
    city_crime = df.groupby('City').agg({
        'Report Number': 'count',
        'Crime Domain': lambda x: (x == 'Violent Crime').sum()
    }).reset_index()
    
    city_crime.columns = ['City', 'total_crimes', 'violent_crimes']
    
    # Calculate crime rate (normalized)
    max_crimes = city_crime['total_crimes'].max()
    city_crime['crime_rate'] = (city_crime['total_crimes'] / max_crimes) * 10
    city_crime['violent_crime_rate'] = (city_crime['violent_crimes'] / city_crime['total_crimes']) * 10
    
    return city_crime


def get_city_crime_score(city: str, crime_data: pd.DataFrame = None) -> dict:
    """Get crime score for a city - uses hardcoded data or real-time AI lookup"""
    city = city.title() if city else 'Default'
    
    # First check hardcoded list (fast)
    if city in CITY_CRIME_INDEX:
        crime_index = CITY_CRIME_INDEX[city]
        safety_score = 10 - crime_index
        return {
            'city': city,
            'crime_index': crime_index,
            'safety_score': safety_score,
            'real_time': False
        }
    
    # If city not found, try real-time lookup via Perplexity AI
    try:
        from src.ai_integration import perplexity_ai, _city_crime_cache
        
        # Check cache first
        if city in _city_crime_cache:
            cached = _city_crime_cache[city]
            return {
                'city': city,
                'crime_index': cached.get('crime_index', 5.0),
                'safety_score': cached.get('safety_score', 5.0),
                'real_time': True,
                'cached': True
            }
        
        # Query Perplexity AI for real-time data
        ai_data = perplexity_ai.get_city_crime_data(city)
        
        if ai_data and 'crime_index' in ai_data:
            # Cache the result
            _city_crime_cache[city] = ai_data
            
            crime_index = float(ai_data.get('crime_index', 5.0))
            safety_score = float(ai_data.get('safety_score', 10 - crime_index))
            
            return {
                'city': city,
                'crime_index': crime_index,
                'safety_score': safety_score,
                'real_time': True,
                'common_crimes': ai_data.get('common_crimes', []),
                'year_trend': ai_data.get('year_trend', 'stable')
            }
    except Exception as e:
        print(f"Real-time crime lookup failed for {city}: {e}")
    
    # Fallback to default
    crime_index = CITY_CRIME_INDEX['Default']
    safety_score = 10 - crime_index
    
    return {
        'city': city,
        'crime_index': crime_index,
        'safety_score': safety_score,
        'real_time': False,
        'note': 'Using default values - city not in database'
    }


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the housing dataset"""
    df = df.copy()
    
    # Handle missing values
    df = df.dropna(subset=['price'])
    
    # Fill numeric columns with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())
    
    # Fill categorical columns with mode
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mode()[0])
    
    # Remove outliers using IQR method for price
    Q1 = df['price'].quantile(0.25)
    Q3 = df['price'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    df = df[(df['price'] >= lower_bound) & (df['price'] <= upper_bound)]
    
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create derived features"""
    df = df.copy()
    
    # Create derived features
    df['price_per_sqft'] = df['price'] / df['area']
    df['bedroom_ratio'] = df['bedrooms'] / df['area'] * 1000
    df['bathroom_ratio'] = df['bathrooms'] / df['bedrooms'].replace(0, 1)
    df['total_rooms'] = df['bedrooms'] + df['bathrooms']
    
    # Binary features
    binary_cols = ['mainroad', 'guestroom', 'basement', 'hotwaterheating', 
                   'airconditioning', 'prefarea']
    for col in binary_cols:
        if col in df.columns:
            df[col] = df[col].map({'yes': 1, 'no': 0}).fillna(0).astype(int)
    
    # Furnishing status encoding
    if 'furnishingstatus' in df.columns:
        furnishing_map = {'unfurnished': 0, 'semi-furnished': 1, 'furnished': 2}
        df['furnishing_score'] = df['furnishingstatus'].map(furnishing_map).fillna(1)
    
    # Amenity score
    amenity_cols = ['mainroad', 'guestroom', 'basement', 'hotwaterheating', 
                    'airconditioning', 'prefarea']
    existing_amenity_cols = [col for col in amenity_cols if col in df.columns]
    df['amenity_score'] = df[existing_amenity_cols].sum(axis=1)
    
    # Area categories
    df['area_category'] = pd.cut(df['area'], bins=[0, 3000, 5000, 7000, 10000, float('inf')],
                                  labels=['Small', 'Medium', 'Large', 'Very Large', 'Luxury'])
    
    return df


def encode_features(df: pd.DataFrame, fit: bool = True, encoders: dict = None) -> tuple:
    """Encode categorical features for ML"""
    df = df.copy()
    
    if encoders is None:
        encoders = {}
    
    # One-hot encode area_category
    if 'area_category' in df.columns:
        area_dummies = pd.get_dummies(df['area_category'], prefix='area_cat')
        df = pd.concat([df, area_dummies], axis=1)
    
    # Drop original categorical columns
    cols_to_drop = ['furnishingstatus', 'area_category']
    df = df.drop([col for col in cols_to_drop if col in df.columns], axis=1)
    
    return df, encoders


def prepare_training_data(housing_path: str, crime_path: str = None) -> tuple:
    """Complete data preparation pipeline"""
    # Load data
    df = load_housing_data(housing_path)
    
    # Clean data
    df = clean_data(df)
    
    # Engineer features
    df = engineer_features(df)
    
    # Encode features
    df, encoders = encode_features(df)
    
    # Separate features and target
    target_col = 'price'
    feature_cols = [col for col in df.columns if col not in 
                    [target_col, 'price_per_sqft']]  # Exclude leaky features
    
    # Keep only numeric columns
    X = df[feature_cols].select_dtypes(include=[np.number])
    y = df[target_col]
    
    # Get feature names
    feature_names = X.columns.tolist()
    
    return X, y, feature_names, encoders


def prepare_prediction_input(input_data: dict) -> pd.DataFrame:
    """Prepare user input for prediction"""
    # Create DataFrame from input
    df = pd.DataFrame([input_data])
    
    # Apply same feature engineering
    df = engineer_features(df)
    
    # Get crime score if city provided
    if 'city' in input_data:
        crime_info = get_city_crime_score(input_data['city'])
        df['crime_index'] = crime_info['crime_index']
        df['safety_score'] = crime_info['safety_score']
    
    return df


if __name__ == "__main__":
    # Test the data processing
    base_path = Path(__file__).parent.parent
    housing_path = base_path / "data" / "raw" / "Housing (1).csv"
    
    if housing_path.exists():
        X, y, feature_names, encoders = prepare_training_data(str(housing_path))
        print(f"Features shape: {X.shape}")
        print(f"Target shape: {y.shape}")
        print(f"Feature names: {feature_names}")
    else:
        print(f"Housing data not found at {housing_path}")
