"""
Model Training Module
Trains XGBoost, LightGBM models and creates an ensemble
"""

import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import json
from datetime import datetime

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import StackingRegressor
from sklearn.linear_model import Ridge

from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
# Note: CatBoost removed - requires Visual Studio to build

import warnings
warnings.filterwarnings('ignore')


class HousePriceModel:
    """Ensemble model for house price prediction"""
    
    def __init__(self):
        self.models = {}
        self.weights = {}
        self.feature_names = None
        self.metrics = {}
        self.is_trained = False
        
    def _create_base_models(self):
        """Create base models for ensemble"""
        models = {
            'xgboost': XGBRegressor(
                n_estimators=500,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                verbosity=0
            ),
            'lightgbm': LGBMRegressor(
                n_estimators=500,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                verbose=-1
            )
        }
        return models
    
    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2):
        """Train all models and create weighted average ensemble"""
        self.feature_names = X.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        print("Training models...")
        
        # Create base models
        self.models = self._create_base_models()
        
        # Train individual models and collect metrics
        model_metrics = {}
        model_r2_scores = {}
        
        for name, model in self.models.items():
            print(f"  Training {name}...")
            model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test)
            metrics = self._calculate_metrics(y_test, y_pred)
            model_metrics[name] = metrics
            model_r2_scores[name] = metrics['r2']
            print(f"    R² Score: {metrics['r2']:.4f}")
        
        # Calculate weights based on R² scores (higher R² = higher weight)
        total_r2 = sum(model_r2_scores.values())
        self.weights = {name: r2 / total_r2 for name, r2 in model_r2_scores.items()}
        print(f"  Model weights: {self.weights}")
        
        # Ensemble prediction (weighted average)
        print("  Creating weighted ensemble...")
        y_pred_ensemble = np.zeros(len(y_test))
        for name, model in self.models.items():
            y_pred_ensemble += self.weights[name] * model.predict(X_test)
        
        ensemble_metrics = self._calculate_metrics(y_test, y_pred_ensemble)
        model_metrics['ensemble'] = ensemble_metrics
        print(f"  Ensemble R² Score: {ensemble_metrics['r2']:.4f}")
        
        # Store metrics
        self.metrics = {
            'individual_models': model_metrics,
            'training_date': datetime.now().isoformat(),
            'n_samples': len(X),
            'n_features': len(self.feature_names),
            'weights': self.weights
        }
        
        self.is_trained = True
        return self.metrics
    
    def _calculate_metrics(self, y_true, y_pred):
        """Calculate regression metrics"""
        return {
            'rmse': float(np.sqrt(mean_squared_error(y_true, y_pred))),
            'mae': float(mean_absolute_error(y_true, y_pred)),
            'r2': float(r2_score(y_true, y_pred)),
            'mape': float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)
        }
    
    def predict(self, X: pd.DataFrame) -> dict:
        """Make predictions with confidence intervals"""
        if not self.is_trained:
            raise ValueError("Model not trained yet!")
        
        # Ensure correct feature order
        X = X[self.feature_names]
        
        # Get predictions from all models
        predictions = {}
        for name, model in self.models.items():
            predictions[name] = model.predict(X)[0]
        
        # Weighted average ensemble prediction
        ensemble_pred = sum(self.weights[name] * pred for name, pred in predictions.items())
        
        # Calculate confidence interval (based on model variance)
        pred_values = list(predictions.values())
        mean_pred = np.mean(pred_values)
        std_pred = np.std(pred_values)
        
        # 95% confidence interval
        confidence_margin = 1.96 * std_pred
        lower_bound = max(0, ensemble_pred - confidence_margin)
        upper_bound = ensemble_pred + confidence_margin
        
        return {
            'predicted_price': float(ensemble_pred),
            'price_lower': float(lower_bound),
            'price_upper': float(upper_bound),
            'confidence': float(1 - (std_pred / mean_pred)) if mean_pred > 0 else 0.8,
            'model_predictions': {k: float(v) for k, v in predictions.items()}
        }
    
    def get_feature_importance(self) -> dict:
        """Get feature importance from all models"""
        if not self.is_trained:
            return {}
        
        importance = {}
        
        # XGBoost importance
        xgb_imp = self.models['xgboost'].feature_importances_
        importance['xgboost'] = dict(zip(self.feature_names, xgb_imp.tolist()))
        
        # LightGBM importance
        lgb_imp = self.models['lightgbm'].feature_importances_
        importance['lightgbm'] = dict(zip(self.feature_names, lgb_imp.tolist()))
        
        # CatBoost importance
        cat_imp = self.models['catboost'].feature_importances_
        importance['catboost'] = dict(zip(self.feature_names, cat_imp.tolist()))
        
        # Average importance
        avg_imp = (xgb_imp + lgb_imp + cat_imp) / 3
        importance['average'] = dict(zip(self.feature_names, avg_imp.tolist()))
        
        return importance
    
    def save(self, filepath: str):
        """Save the trained model"""
        save_data = {
            'models': self.models,
            'weights': self.weights,
            'feature_names': self.feature_names,
            'metrics': self.metrics,
            'is_trained': self.is_trained
        }
        joblib.dump(save_data, filepath)
        print(f"Model saved to {filepath}")
    
    def load(self, filepath: str):
        """Load a trained model"""
        save_data = joblib.load(filepath)
        self.models = save_data['models']
        self.weights = save_data['weights']
        self.feature_names = save_data['feature_names']
        self.metrics = save_data['metrics']
        self.is_trained = save_data['is_trained']
        print(f"Model loaded from {filepath}")


def train_and_save_model(housing_path: str, model_save_path: str):
    """Complete training pipeline"""
    from data_processing import prepare_training_data
    
    print("Loading and preparing data...")
    X, y, feature_names, encoders = prepare_training_data(housing_path)
    
    print(f"Training data: {X.shape[0]} samples, {X.shape[1]} features")
    
    # Create and train model
    model = HousePriceModel()
    metrics = model.train(X, y)
    
    # Save model
    model.save(model_save_path)
    
    # Save feature names
    feature_path = Path(model_save_path).parent / 'feature_names.json'
    with open(feature_path, 'w') as f:
        json.dump(feature_names, f)
    
    print("\nTraining Complete!")
    print(f"Best Model R² Score: {metrics['individual_models']['ensemble']['r2']:.4f}")
    
    return model, metrics


if __name__ == "__main__":
    base_path = Path(__file__).parent.parent
    housing_path = base_path.parent / "Housing (1).csv"
    model_save_path = base_path / "models" / "house_price_model.joblib"
    
    # Create models directory
    model_save_path.parent.mkdir(parents=True, exist_ok=True)
    
    if housing_path.exists():
        model, metrics = train_and_save_model(str(housing_path), str(model_save_path))
    else:
        print(f"Data not found at {housing_path}")
