import pymysql
from flask import current_app

# In every file that is going to change the database these lines are needed

# Import
# from flask import current_app
# from MySQLdb.cursors import DictCursor "Optional"

# Grab current mysql instance
# mysql = current_app.mysql

# Create cursor
# cursor = mysql.connection.cursor()

# Make changes to db.....

# Save actions to db
# mysql.connection.commit()

# #Close the cursor
# cursor.close()

def get_db():

    try:
        connection = pymysql.connect(
            host = current_app.config['MYSQL_HOST'],
            user = current_app.config['MYSQL_USER'],
            password = current_app.config['MYSQL_PASSWORD'],
            db = current_app.config['MYSQL_DB'],
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except Exception as e:
        print("Error connecting to DB:", e)
        raise
