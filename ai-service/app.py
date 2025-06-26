from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
from database import get_db_connection
from models.spending_predictor import SpendingPredictor
from models.savings_recommender import SavingsRecommender
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return jsonify({'message': 'AI Service is running'})


def get_user_transactions(user_id):
    """Fetch user transactions from database"""
    conn = get_db_connection()
    query = """
        SELECT id, user_id, amount, category, date, description 
        FROM transactions 
        WHERE user_id = %s
        ORDER BY date DESC
    """
    
    df = pd.read_sql(query, conn, params=(user_id,))
    conn.close()
    
    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    return df

def get_user_budgets(user_id):
    """Fetch user budgets from database"""
    conn = get_db_connection()
    query = """
        SELECT id, user_id, category, budgeted_amount, actual_amount, month, year
        FROM budgets 
        WHERE user_id = %s
        ORDER BY year DESC, month DESC
    """
    
    df = pd.read_sql(query, conn, params=(user_id,))
    conn.close()
    
    return df

@app.route('/api/ai/spending-prediction/<int:user_id>', methods=['GET'])
def get_spending_prediction(user_id):
    try:
        transactions_df = get_user_transactions(user_id)

        if transactions_df.empty:
            print(f"[spending-prediction] No transactions found for user_id={user_id}")
            return jsonify({
                'error': 'No transaction data available',
                'predictions': None
            }), 404

        predictor = SpendingPredictor()

        predictions, error = predictor.predict_next_month(transactions_df)

        if error:
            print(f"[spending-prediction] Prediction error: {error}")
            return jsonify({
                'error': error,
                'predictions': None
            }), 400
        
        # Get category predictions
        category_predictions = predictor.predict_by_category(transactions_df)
        
        # Detect anomalies
        anomalies = predictor.detect_anomalies(transactions_df)
        
        # Format response
        response = {
            'next_30_days': {
                'total': float(predictions['yhat'].sum()),
                'daily_average': float(predictions['yhat'].mean()),
                'confidence_lower': float(predictions['yhat_lower'].sum()),
                'confidence_upper': float(predictions['yhat_upper'].sum()),
                'daily_predictions': predictions[['ds', 'yhat']].to_dict('records')
            },
            'by_category': category_predictions,
            'anomalies': anomalies,
            'generated_at': datetime.now().isoformat()
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error in spending prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/savings-recommendations/<int:user_id>', methods=['GET'])
def get_savings_recommendations(user_id):
    """Get personalized savings recommendations"""
    try:
        # Get user data
        transactions_df = get_user_transactions(user_id)
        budgets_df = get_user_budgets(user_id)
        
        if transactions_df.empty:
            return jsonify({
                'error': 'No transaction data available',
                'recommendations': []
            }), 404
        
        recommender = SavingsRecommender()
        
        # Get recommendations
        recommendations = recommender.analyze_spending_patterns(transactions_df, budgets_df)
        
        # Sort by priority and potential savings
        recommendations.sort(key=lambda x: (
            0 if x['priority'] == 'high' else 1,
            -x['potential_savings']
        ))
        
        # Add specific tips for top recommendations
        for rec in recommendations[:5]:
            if rec['category'] != 'general':
                rec['tips'] = recommender.get_saving_tips(rec['category'])
        
        return jsonify({
            'recommendations': recommendations,
            'total_potential_savings': sum(r['potential_savings'] for r in recommendations),
            'generated_at': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in savings recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/spending-insights/<int:user_id>', methods=['GET'])
def get_spending_insights(user_id):
    """Get AI-powered spending insights"""
    try:
        transactions_df = get_user_transactions(user_id)
        
        if transactions_df.empty:
            return jsonify({
                'error': 'No transaction data available',
                'insights': []
            }), 404
        
        insights = []
        
        # Spending trend analysis
        transactions_df['month'] = pd.to_datetime(transactions_df['date']).dt.to_period('M')
        monthly_spending = transactions_df.groupby('month')['amount'].sum()
        
        if len(monthly_spending) >= 3:
            recent_months = monthly_spending.tail(3)
            trend = np.polyfit(range(3), recent_months.values, 1)[0]
            
            if trend > 50:
                insights.append({
                    'type': 'trend',
                    'severity': 'warning',
                    'message': f"Your spending is increasing by ${trend:.2f} per month",
                    'suggestion': "Consider reviewing your expenses to control spending growth"
                })
            elif trend < -50:
                insights.append({
                    'type': 'trend',
                    'severity': 'success',
                    'message': f"Great job! Your spending is decreasing by ${abs(trend):.2f} per month",
                    'suggestion': "Keep up the good work on reducing expenses"
                })
        
        # Weekend vs weekday spending
        transactions_df['weekday'] = pd.to_datetime(transactions_df['date']).dt.dayofweek
        weekend_spending = transactions_df[transactions_df['weekday'].isin([5, 6])]['amount'].mean()
        weekday_spending = transactions_df[~transactions_df['weekday'].isin([5, 6])]['amount'].mean()
        
        if weekend_spending > weekday_spending * 1.5:
            insights.append({
                'type': 'pattern',
                'severity': 'info',
                'message': f"You spend {((weekend_spending/weekday_spending - 1) * 100):.0f}% more on weekends",
                'suggestion': "Plan weekend activities in advance to control spending"
            })
        
        # Large transaction alerts
        avg_transaction = transactions_df['amount'].mean()
        large_transactions = transactions_df[transactions_df['amount'] > avg_transaction * 3]
        
        if len(large_transactions) > 0:
            insights.append({
                'type': 'alert',
                'severity': 'info',
                'message': f"You had {len(large_transactions)} large transactions recently",
                'suggestion': "Review large purchases to ensure they align with your budget"
            })
        
        return jsonify({
            'insights': insights,
            'generated_at': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in spending insights: {str(e)}")
        return jsonify({'error': str(e)}), 500
prin
@app.route('/api/ai/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'AI Service'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))  # ← changed from 6000 to 8000
    app.run(host='127.0.0.1', port=port, debug=True)

