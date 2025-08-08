# Volunteer Management System

## 📌 Complete Project with Additional Functionality and Reporting

This is a full-stack web application designed to manage volunteers and events for a nonprofit organization. It allows user registration, profile management, event creation, volunteer matching, and reporting in both CSV and PDF formats.

---

## 🗂 Project Structure

- **Frontend**: React.js + Vite
- **Backend**: Python (Flask/FastAPI) Web Application Framework 
- **Database**: MySQL 
- **Authentication**: JWT(JSON Web Token) + bcrypt password hashing
- **Notification**: Flask API
- **Report Generation**: reportlab (PDF), csv (python built-in)
-  **Unit testing**: pytest, coverage

---
## ⚙️ Features

### 👤 User Management
- Volunteer & Admin registration
- Login/Logout functionality
- Profile management with skills, availability, and preferences

### 📅 Event Management (Admin only)
- Create, edit, delete events
- Specify required skills, urgency, date, location

### 🔗 Volunteer Matching
- Admin matches volunteers based on skills & availability

### 📩 Notification System
- Volunteers receive alerts when assigned or updated on an event

### 📊 Reporting Module 
- Generate **PDF** and **CSV** reports for:
  - Listing volunteers and their participation history.
  - Event details and volunteer assignments.

  
### 📘 Volunteer History
- Track and display volunteer participation across events
- Viewable by admins and volunteers in tabular form

  




