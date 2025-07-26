# Volunteer Management System – Database Implementation
Implements secure, validated storage for user credentials, user profiles, events, volunteer history, and states using RDBMS. Includes encrypted passwords and full backend integration for data persistence and retrieval.

# MySQL Server and Workbench Installation Guide

Instructions for installing **MySQL Server** and **MySQL Workbench** on **Linux**, **Windows**, and **macOS**.

---

- **MySQL Server** – The core database engine.
- **MySQL Workbench** – A graphical interface for managing MySQL databases.

---

## 🐧 Linux

##  Ubuntu / Debian-based distributions

### 1. Install MySQL Server
       sudo apt update && apt install mysql-server && pip install "Flask<2.3" && pip install flask-mysqldb
### 2. Secure MySQL Installation (optional but recommended)
       sudo mysql_secure_installation
### 3. Check MySQL Status
       sudo systemctl status mysql
### 4. Install MySQL Workbench
       sudo snap install mysql-workbench-community
###  🪟 Windows
  ### 1. Download the MySQL Installer

[Go to the MySQL Installer Download Page](https://dev.mysql.com/downloads/installer/)

Choose:

- **MySQL Installer for Windows** (Full or Web version)

  ### 2. Run the Installer
         Select MySQL Server and MySQL Workbench

         Proceed with the installation wizard

         Set up a root password and configure as needed

  ### 3. Verify Installation
         Open MySQL Workbench
         Connect to the Local MySQL Server using the credentials you set

### 🍎 macOS
### 1. Install Homebrew (if not installed)

       /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
### 2. Install MySQL Server

       brew install mysql
### 3. Start MySQL Server

       brew services start mysql
### 4. Secure Installation

       mysql_secure_installation
### 5. Install MySQL Workbench      

  - [Download the .dmg from MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
  - Drag and drop the app into your `/Applications` folder


### 🧪 Testing the Setup

       mysql -u root -p
###  You should now be in the MySQL shell and can run SQL commands like:

       SHOW DATABASES;



