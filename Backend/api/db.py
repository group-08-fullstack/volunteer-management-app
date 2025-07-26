from flask_mysqldb import MySQL

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

def configDb(app,password):
    # Configure and setup DB
    app.config['MYSQL_HOST'] = 'mydemoserver-quickstart.mysql.database.azure.com'
    app.config['MYSQL_USER'] = 'mydemouser'
    app.config['MYSQL_PASSWORD'] = password
    app.config['MYSQL_DB'] = 'volunteermgnt'

    return MySQL(app)



   