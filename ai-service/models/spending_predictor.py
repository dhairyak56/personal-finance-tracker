import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from prophet import Prophet
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class SpendingPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        
    def prepare_data(self, transactions_df):
        """Prepare transaction data for prediction"""
        # Group by date and sum amounts
        daily_spending = transactions_df.groupby('date')['amount'].sum().reset_index()
        daily_spending.columns = ['ds', 'y']
        
        # Fill missing dates with 0
        date_range = pd.date_range(start=daily_spending['ds'].min(), 
                                  end=daily_spending['ds'].max(), 
                                  freq='D')
        daily_spending = daily_spending.set_index('ds').reindex(date_range, fill_value=0).reset_index()
        daily_spending.columns = ['ds', 'y']
        
        return daily_spending
    
    def predict_next_month(self, transactions_df):
        """Predict spending for the next 30 days"""
        if len(transactions_df) < 30:
            return None, "Not enough data for prediction (need at least 30 days)"
        
        # Prepare data
        daily_spending = self.prepare_data(transactions_df)
        
        # Initialize and fit Prophet model
        model = Prophet(
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=False,
            changepoint_prior_scale=0.05
        )
        
        model.fit(daily_spending)
        
        # Make predictions for next 30 days
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)
        
        # Get predictions for the next 30 days
        predictions = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30)
        
        return predictions, None
    
    def predict_by_category(self, transactions_df):
        """Predict spending by category"""
        predictions = {}
        
        for category in transactions_df['category'].unique():
            category_df = transactions_df[transactions_df['category'] == category]
            
            if len(category_df) >= 10:
                daily_spending = self.prepare_data(category_df)
                
                # Simple moving average for categories with less data
                if len(daily_spending) < 30:
                    recent_avg = daily_spending['y'].tail(7).mean()
                    predictions[category] = {
                        'next_month': recent_avg * 30,
                        'confidence': 'low'
                    }
                else:
                    # Use Prophet for categories with more data
                    model = Prophet(daily_seasonality=False, weekly_seasonality=True)
                    model.fit(daily_spending)
                    
                    future = model.make_future_dataframe(periods=30)
                    forecast = model.predict(future)
                    
                    next_month_total = forecast['yhat'].tail(30).sum()
                    predictions[category] = {
                        'next_month': float(next_month_total),
                        'confidence': 'high'
                    }
        
        return predictions

    def detect_anomalies(self, transactions_df):
        """Detect unusual spending patterns"""
        anomalies = []
        
        # Group by date
        daily_spending = transactions_df.groupby('date')['amount'].sum().reset_index()
        
        if len(daily_spending) < 7:
            return anomalies
        
        # Calculate rolling statistics
        daily_spending['rolling_mean'] = daily_spending['amount'].rolling(window=7, min_periods=1).mean()
        daily_spending['rolling_std'] = daily_spending['amount'].rolling(window=7, min_periods=1).std()
        
        # Detect anomalies (spending > mean + 2*std)
        threshold = 2
        for idx, row in daily_spending.iterrows():
            if idx < 7:  # Skip first week
                continue
                
            upper_limit = row['rolling_mean'] + threshold * row['rolling_std']
            
            if row['amount'] > upper_limit:
                anomalies.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'amount': float(row['amount']),
                    'expected_max': float(upper_limit),
                    'severity': 'high' if row['amount'] > upper_limit * 1.5 else 'medium'
                })
        
        return anomalies
