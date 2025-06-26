import random
from datetime import datetime, timedelta
import mysql.connector

# === Update these with your actual DB credentials ===
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password=" ",
    database="finance_tracker"
)
cursor = conn.cursor()

user_id = 1  # The user ID you're logged in as
categories = ['groceries', 'rent', 'entertainment', 'transport', 'utilities']
start_date = datetime.now() - timedelta(days=60)

for i in range(60):
    date = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
    amount = round(random.uniform(10, 200), 2)
    category = random.choice(categories)
    description = f"{category.capitalize()} expense"

    cursor.execute("""
        INSERT INTO transactions (user_id, amount, category, date, description)
        VALUES (%s, %s, %s, %s, %s)
    """, (user_id, amount, category, date, description))

conn.commit()
cursor.close()
conn.close()
print("✅ Inserted 60 mock transactions.")
