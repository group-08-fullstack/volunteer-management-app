
CREATE DATABASE volunteermgnt;
USE volunteermgnt;

CREATE TABLE UserCredentials (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    add role like for admin and volunteer  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

'CREATE TABLE `userprofile` (
  `volunteer_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(50) NOT NULL,
  `address1` varchar(100) NOT NULL,
  `address2` varchar(100) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state_name` varchar(100) NOT NULL,
  `zipcode` varchar(9) NOT NULL,
  `preferences` text,
  `date_of_birth` date NOT NULL,
  `phone_number` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`volunteer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'



'CREATE TABLE `eventdetails` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(100) NOT NULL,
  `required_skills` text NOT NULL,
  `state` varchar(45) NOT NULL,
  `city` varchar(45) NOT NULL,
  `zipcode` varchar(45) NOT NULL,
  `urgency` enum(''Low'',''Medium'',''High'') NOT NULL,
  `event_location` text NOT NULL,
  `event_duration` int NOT NULL,
  `event_description` text NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `event_status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'


'CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `message` tinytext NOT NULL,
  `event_date` date NOT NULL,
  `receiver` tinytext NOT NULL,
  `read` tinyint NOT NULL,
  PRIMARY KEY (`notification_id`),
  UNIQUE KEY `notification_id_UNIQUE` (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'


'CREATE TABLE `required_skills` (
  `required_skills_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `skills_id` int NOT NULL,
  PRIMARY KEY (`required_skills_id`,`event_id`,`skills_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'

'CREATE TABLE `skills` (
  `skills_id` int NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(45) NOT NULL,
  `skill_description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`skills_id`,`skill_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'


'CREATE TABLE `volunteer_availability` (
  `availability_id` int NOT NULL AUTO_INCREMENT,
  `volunteer_id` int NOT NULL,
  `date_available` date NOT NULL,
  PRIMARY KEY (`availability_id`,`volunteer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'


'CREATE TABLE `volunteer_skills` (
  `volunteer_skills_id` int NOT NULL AUTO_INCREMENT,
  `volunteer_id` int NOT NULL,
  `skill_id` int NOT NULL,
  PRIMARY KEY (`volunteer_skills_id`,`volunteer_id`,`skill_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'



'CREATE TABLE `volunteerhistory` (
  `event_id` int NOT NULL,
  `volunteer_id` int NOT NULL,
  `email` tinytext NOT NULL,
  `event_name` tinytext NOT NULL,
  `participation_status` json NOT NULL,
  PRIMARY KEY (`event_id`,`volunteer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'


===========================================================================================


-- Create the database
CREATE DATABASE volunteermgnt;
USE volunteermgnt;

-- User credentials with role
CREATE TABLE UserCredentials (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'volunteer') NOT NULL DEFAULT 'volunteer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer profile
CREATE TABLE userprofile (
    volunteer_id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(50) NOT NULL,
    address1 VARCHAR(100) NOT NULL,
    address2 VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    zipcode VARCHAR(9) NOT NULL,
    preferences TEXT,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(10),
    PRIMARY KEY (volunteer_id)
);

-- Event details
CREATE TABLE eventdetails (
    event_id INT NOT NULL AUTO_INCREMENT,
    event_name VARCHAR(100) NOT NULL,
    required_skills TEXT NOT NULL,
    state VARCHAR(45) NOT NULL,
    city VARCHAR(45) NOT NULL,
    zipcode VARCHAR(45) NOT NULL,
    urgency ENUM('Low', 'Medium', 'High') NOT NULL,
    event_location TEXT NOT NULL,
    event_duration INT NOT NULL,
    event_description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_status VARCHAR(45),
    PRIMARY KEY (event_id)
);

-- Notifications
CREATE TABLE notifications (
    notification_id INT NOT NULL AUTO_INCREMENT,
    message TINYTEXT NOT NULL,
    event_date DATE NOT NULL,
    receiver TINYTEXT NOT NULL,
    `read` TINYINT NOT NULL,
    PRIMARY KEY (notification_id),
    UNIQUE KEY notification_id_UNIQUE (notification_id)
);

-- Skills
CREATE TABLE skills (
    skills_id INT NOT NULL AUTO_INCREMENT,
    skill_name VARCHAR(45) NOT NULL,
    skill_description VARCHAR(45),
    PRIMARY KEY (skills_id, skill_name)
);

-- Required skills for events
CREATE TABLE required_skills (
    required_skills_id INT NOT NULL AUTO_INCREMENT,
    event_id INT NOT NULL,
    skills_id INT NOT NULL,
    PRIMARY KEY (required_skills_id, event_id, skills_id)
);

-- Volunteer availability
CREATE TABLE volunteer_availability (
    availability_id INT NOT NULL AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    date_available DATE NOT NULL,
    PRIMARY KEY (availability_id, volunteer_id)
);

-- Volunteer skills
CREATE TABLE volunteer_skills (
    volunteer_skills_id INT NOT NULL AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (volunteer_skills_id, volunteer_id, skill_id)
);

-- Volunteer history
CREATE TABLE volunteerhistory (
    event_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    email TINYTEXT NOT NULL,
    event_name TINYTEXT NOT NULL,
    participation_status JSON NOT NULL,
    PRIMARY KEY (event_id, volunteer_id)
);






