import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class SavingsRecommender:
    def __init__(self):
        self.recommendations = []
    
    def analyze_spending_patterns(self, transactions_df, budgets_df):
        """Analyze spending patterns and generate recommendations"""
        recommendations = []
        
        # Get current month
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year
        
        # Calculate average spending by category
        monthly_spending = self._calculate_monthly_average(transactions_df)
        
        # Compare with budgets
        for category, avg_spending in monthly_spending.items():
            budget = budgets_df[
                (budgets_df['category'] == category) & 
                (budgets_df['month'] == current_month) & 
                (budgets_df['year'] == current_year)
            ]
            
            if not budget.empty:
                budget_amount = budget.iloc[0]['budgeted_amount']
                
                if avg_spending > budget_amount * 1.2:
                    recommendations.append({
                        'type': 'overspending',
                        'category': category,
                        'message': f"You're spending {((avg_spending/budget_amount - 1) * 100):.0f}% over budget on {category}",
                        'suggestion': f"Try to reduce {category} spending by ${(avg_spending - budget_amount):.2f} per month",
                        'potential_savings': float(avg_spending - budget_amount),
                        'priority': 'high'
                    })
        
        # Find categories with highest spending
        top_categories = sorted(monthly_spending.items(), key=lambda x: x[1], reverse=True)[:3]
        
        for category, amount in top_categories:
            if amount > 100:  # Only suggest for significant amounts
                recommendations.append({
                    'type': 'high_spending',
                    'category': category,
                    'message': f"{category} is your #{top_categories.index((category, amount)) + 1} spending category",
                    'suggestion': f"Consider ways to reduce {category} expenses by 10-15%",
                    'potential_savings': float(amount * 0.15),
                    'priority': 'medium'
                })
        
        # Suggest automated savings
        total_monthly_spending = sum(monthly_spending.values())
        suggested_savings = total_monthly_spending * 0.20  # 20% savings rule
        
        recommendations.append({
            'type': 'savings_goal',
            'category': 'general',
            'message': "Based on your spending patterns",
            'suggestion': f"You could save ${suggested_savings:.2f} monthly (20% of expenses)",
            'potential_savings': float(suggested_savings),
            'priority': 'high'
        })
        
        return recommendations
    
    def _calculate_monthly_average(self, transactions_df):
        """Calculate average monthly spending by category"""
        transactions_df['month'] = pd.to_datetime(transactions_df['date']).dt.to_period('M')
        
        monthly_category = transactions_df.groupby(['month', 'category'])['amount'].sum().reset_index()
        avg_by_category = monthly_category.groupby('category')['amount'].mean().to_dict()
        
        return avg_by_category
    
    def get_saving_tips(self, category):
        """Get specific saving tips for each category"""
        tips = {
            'Food': [
                "Meal prep on weekends to avoid eating out",
                "Use grocery store apps for digital coupons",
                "Buy generic brands instead of name brands",
                "Plan meals around sales and seasonal produce"
            ],
            'Transportation': [
                "Consider carpooling or public transportation",
                "Combine errands to save on gas",
                "Keep up with vehicle maintenance to improve fuel efficiency",
                "Look for cheaper gas stations using apps like GasBuddy"
            ],
            'Entertainment': [
                "Look for free events in your community",
                "Take advantage of happy hour specials",
                "Use streaming services instead of cable",
                "Set a monthly entertainment budget"
            ],
            'Shopping': [
                "Wait 24 hours before making non-essential purchases",
                "Unsubscribe from promotional emails",
                "Use cashback apps and browser extensions",
                "Shop with a list and stick to it"
            ],
            'Bills': [
                "Negotiate with service providers for better rates",
                "Review and cancel unused subscriptions",
                "Consider bundling services for discounts",
                "Set up autopay to avoid late fees"
            ],
            'Healthcare': [
                "Use generic medications when available",
                "Take advantage of preventive care benefits",
                "Compare prices for procedures",
                "Review medical bills for errors"
            ],
            'Education': [
                "Look for free online courses and resources",
                "Buy used textbooks or rent them",
                "Apply for scholarships and grants",
                "Take advantage of student discounts"
            ],
            'Other': [
                "Track all expenses to identify patterns",
                "Set specific savings goals",
                "Automate transfers to savings account",
                "Review and adjust budget monthly"
            ]
        }
        
        return tips.get(category, tips['Other'])
