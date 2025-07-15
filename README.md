# Volunteer Management System – Backend

This is the back-end API for the Volunteer Management System, built using **Flask**. It supports user Login, profile management, event coordination, volunteer matching, notifications, and volunteer history tracking for a nonprofit organization.

##  Technologies Used

- Python 3.10+
- Flask
- Flask-CORS
- Flask-RESTful
- and more..



---

## 🚀 Setup Instructions

### 1. Install Python and pip (if not already installed)

         sudo apt update && apt install python3 python3-pip -y && git clone https://github.com/group-08-fullstack/volunteer-management-app

### 2. 🛠️ Create and activate a virtual environment         
### On macOS/Linux:
         cd volunteer-management-app && cd Backend
         apt install python3.10-venv -y
         python3 -m venv venv
         source venv/bin/activate
### On Windows:  
         venv\Scripts\activate
         
### 3. 📦 Install required dependencies
         pip install -r requirements.txt


###  4. Inside the api folder, Run the Flask server using
         flask --app app run --debug
         
###  5. Navigate into the Frontend folder and run the server
         cd Frontend && npm run dev
       

###   The app will be available at: http://127.0.0.1:5000/

## 🗂️ Project Structure
![alt text](https://github.com/group-08-fullstack/volunteer-management-app/blob/main/Frontend/tree-structure.png)



