CREATE DATABASE IF NOT EXISTS volunteermgnt;
USE volunteermgnt;

CREATE TABLE eventdetails (
  event_id INT NOT NULL AUTO_INCREMENT,
  event_name VARCHAR(100) NOT NULL,
  required_skills TEXT NOT NULL,
  address VARCHAR(45) NOT NULL,
  state VARCHAR(45) NOT NULL,
  city VARCHAR(45) NOT NULL,
  zipcode VARCHAR(45) NOT NULL,
  urgency ENUM('Low', 'Medium', 'High') NOT NULL,
  location_name TEXT NOT NULL,
  event_duration INT NOT NULL,
  event_description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  event_status ENUM('Pending', 'Finalized', 'Completed') DEFAULT 'Pending',
  volunteers_needed INT NOT NULL,
  PRIMARY KEY (event_id)
);

CREATE TABLE notifications (
  notification_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TINYTEXT NOT NULL,
  event_date DATE NOT NULL,
  read TINYINT NOT NULL,
  PRIMARY KEY (notification_id, user_id),
  UNIQUE KEY notification_id_UNIQUE (notification_id),
  KEY user_id_idx (user_id),
  CONSTRAINT noti_user_id FOREIGN KEY (user_id) REFERENCES usercredentials (user_id) ON DELETE CASCADE
);

CREATE TABLE required_skills (
  required_skills_id INT NOT NULL AUTO_INCREMENT,
  event_id INT NOT NULL,
  skills_id INT NOT NULL,
  PRIMARY KEY (required_skills_id, event_id, skills_id),
  KEY req_skills_event_id_idx (event_id),
  CONSTRAINT req_skills_event_id FOREIGN KEY (event_id) REFERENCES eventdetails (event_id) ON DELETE CASCADE
);

CREATE TABLE skills (
  skills_id INT NOT NULL AUTO_INCREMENT,
  skill_name VARCHAR(45) NOT NULL,
  skill_description VARCHAR(45) DEFAULT NULL,
  PRIMARY KEY (skills_id, skill_name)
);

CREATE TABLE states (
  state_id INT NOT NULL AUTO_INCREMENT,
  state_name VARCHAR(100) NOT NULL,
  abbreviation CHAR(2) NOT NULL,
  PRIMARY KEY (state_id),
  UNIQUE KEY abbreviation (abbreviation)
);

CREATE TABLE usercredentials (
  user_id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY email (email)
);

CREATE TABLE userprofile (
  volunteer_id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(50) NOT NULL,
  address1 VARCHAR(100) DEFAULT NULL,
  address2 VARCHAR(100) DEFAULT NULL,
  city VARCHAR(100) NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  zipcode VARCHAR(9) NOT NULL,
  preferences TEXT,
  date_of_birth DATE NOT NULL,
  phone_number VARCHAR(10) DEFAULT NULL,
  PRIMARY KEY (volunteer_id),
  CONSTRAINT profile_user_id FOREIGN KEY (volunteer_id) REFERENCES usercredentials (user_id) ON DELETE CASCADE
);

CREATE TABLE volunteer_availability (
  availability_id INT NOT NULL AUTO_INCREMENT,
  volunteer_id INT NOT NULL,
  date_available DATE NOT NULL,
  PRIMARY KEY (availability_id, volunteer_id),
  KEY availability_volunteer_id_idx (volunteer_id),
  CONSTRAINT availability_volunteer_id FOREIGN KEY (volunteer_id) REFERENCES userprofile (volunteer_id) ON DELETE CASCADE
);

CREATE TABLE volunteer_skills (
  volunteer_skills_id INT NOT NULL AUTO_INCREMENT,
  volunteer_id INT NOT NULL,
  skill_id INT NOT NULL,
  PRIMARY KEY (volunteer_skills_id, volunteer_id, skill_id),
  KEY fk_volunteer_skills_idx (volunteer_id),
  CONSTRAINT fk_vol_skills FOREIGN KEY (volunteer_id) REFERENCES userprofile (volunteer_id) ON DELETE CASCADE
);

CREATE TABLE volunteerhistory (
  event_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  participation_status ENUM('Registered', 'Volunteered', 'Did Not Show') NOT NULL DEFAULT 'Registered',
  performance INT DEFAULT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (event_id, volunteer_id),
  KEY history_volunteer_id_idx (volunteer_id),
  CONSTRAINT history_volunteer_id FOREIGN KEY (volunteer_id) REFERENCES usercredentials (user_id) ON DELETE CASCADE
);

CREATE TABLE volunteermgnt.verification_codes (
  email VARCHAR(100) NOT NULL,
  code INT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (email),
  UNIQUE INDEX email_UNIQUE (email ASC),
  CONSTRAINT fk_codes
    FOREIGN KEY (email)
    REFERENCES volunteermgnt.usercredentials (email)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

