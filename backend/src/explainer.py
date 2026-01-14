"""
SHAP Explainability Module
Provides explanations for model predictions
"""

import pandas as pd
import numpy as np
import shap
from typing import Dict, List, Tuple


class ModelExplainer:
    """SHAP-based model explainer"""
    
    def __init__(self, model):
        self.model = model
        self.explainer = None
        self.background_data = None
        
    def setup(self, X_train: pd.DataFrame, n_samples: int = 100):
        """Setup SHAP explainer with background data"""
        # Use a sample for background
        if len(X_train) > n_samples:
            self.background_data = X_train.sample(n=n_samples, random_state=42)
        else:
            self.background_data = X_train
        
        # Create TreeExplainer for tree-based models
        # Using XGBoost model from ensemble
        if hasattr(self.model, 'models') and 'xgboost' in self.model.models:
            self.explainer = shap.TreeExplainer(self.model.models['xgboost'])
        
    def explain_prediction(self, X: pd.DataFrame) -> Dict:
        """Explain a single prediction"""
        if self.explainer is None:
            return {'error': 'Explainer not setup'}
        
        # Get SHAP values
        shap_values = self.explainer.shap_values(X)
        
        # If array, take first sample
        if isinstance(shap_values, np.ndarray) and shap_values.ndim > 1:
            shap_values = shap_values[0]
        
        # Create feature importance dict
        feature_names = X.columns.tolist()
        importance = dict(zip(feature_names, shap_values.tolist()))
        
        # Sort by absolute importance
        sorted_importance = dict(sorted(
            importance.items(), 
            key=lambda x: abs(x[1]), 
            reverse=True
        ))
        
        # Get top factors
        top_factors = []
        total_impact = sum(abs(v) for v in importance.values())
        
        for feature, value in list(sorted_importance.items())[:5]:
            impact_pct = abs(value) / total_impact * 100 if total_impact > 0 else 0
            direction = "increases" if value > 0 else "decreases"
            
            top_factors.append({
                'feature': feature,
                'impact': float(value),
                'impact_percentage': float(impact_pct),
                'direction': direction,
                'description': self._get_feature_description(feature, value, X.iloc[0])
            })
        
        return {
            'shap_values': importance,
            'top_factors': top_factors,
            'base_value': float(self.explainer.expected_value) if hasattr(self.explainer, 'expected_value') else 0
        }
    
    def _get_feature_description(self, feature: str, shap_value: float, row: pd.Series) -> str:
        """Generate human-readable description for a feature"""
        feature_value = row.get(feature, 'N/A')
        direction = "increases" if shap_value > 0 else "decreases"
        
        descriptions = {
            'area': f"Property area of {feature_value} sqft {direction} the price",
            'bedrooms': f"Having {feature_value} bedrooms {direction} the price",
            'bathrooms': f"Having {feature_value} bathrooms {direction} the price",
            'stories': f"Being {feature_value} stories tall {direction} the price",
            'parking': f"Having {feature_value} parking spots {direction} the price",
            'mainroad': f"{'Being on' if feature_value else 'Not being on'} main road {direction} the price",
            'airconditioning': f"{'Having' if feature_value else 'Not having'} AC {direction} the price",
            'furnishing_score': f"Furnishing level {direction} the price",
            'amenity_score': f"Total amenities count {direction} the price",
            'crime_index': f"Local crime rate {direction} the price",
            'safety_score': f"Area safety level {direction} the price"
        }
        
        return descriptions.get(feature, f"{feature} = {feature_value} {direction} the price")


def get_similar_properties(X_train: pd.DataFrame, y_train: pd.Series, 
                          input_features: pd.DataFrame, n_similar: int = 5) -> List[Dict]:
    """Find similar properties from training data"""
    from sklearn.preprocessing import StandardScaler
    from sklearn.neighbors import NearestNeighbors
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)
    input_scaled = scaler.transform(input_features)
    
    # Find nearest neighbors
    nn = NearestNeighbors(n_neighbors=min(n_similar, len(X_train)))
    nn.fit(X_scaled)
    
    distances, indices = nn.kneighbors(input_scaled)
    
    similar = []
    for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
        similar.append({
            'rank': i + 1,
            'price': float(y_train.iloc[idx]),
            'similarity_score': float(1 / (1 + dist)),  # Convert distance to similarity
            'features': X_train.iloc[idx].to_dict()
        })
    
    return similar


def compare_to_market(predicted_price: float, similar_prices: List[float]) -> Dict:
    """Compare predicted price to similar properties"""
    if not similar_prices:
        return {'status': 'unknown', 'difference_pct': 0}
    
    avg_similar = np.mean(similar_prices)
    difference = predicted_price - avg_similar
    difference_pct = (difference / avg_similar) * 100
    
    if difference_pct > 10:
        status = 'overpriced'
        suggestion = f"This property is {abs(difference_pct):.1f}% above market average. Consider negotiating."
    elif difference_pct < -10:
        status = 'underpriced'
        suggestion = f"This property is {abs(difference_pct):.1f}% below market average. Good value!"
    else:
        status = 'fair'
        suggestion = "This property is priced fairly compared to similar properties."
    
    return {
        'status': status,
        'difference_pct': float(difference_pct),
        'avg_similar_price': float(avg_similar),
        'suggestion': suggestion
    }
