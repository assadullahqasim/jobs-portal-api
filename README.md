# Job Portal API Documentation

## Overview
This project is a Job Portal API that facilitates interactions between Job Seekers, Recruiters, and Admins. It provides features for job postings, applications, user management, and real-time notifications.

---

## Routes

### **Admin Routes**
| Method | Endpoint                      | Description                              |
|--------|-------------------------------|------------------------------------------|
| GET    | `/fetch/all/user`             | Fetch all users.                         |
| GET    | `/fetch/all/jobs`             | Fetch all job posts.                     |
| GET    | `/get-stats`                  | Get admin statistics for users, jobs, and applications. |
| DELETE | `/delete-job/:jobId`          | Delete a specific job post.              |
| DELETE | `/delete-user/:userId`        | Delete a specific user.                  |

---

### **Application Routes**
| Method | Endpoint                                  | Description                                |
|--------|------------------------------------------|--------------------------------------------|
| POST   | `/post-application/:jobId`               | Submit an application for a specific job.  |
| GET    | `/get-applications`                      | Fetch all applications by the logged-in job seeker. |
| GET    | `/get-application/:id`                   | Fetch a specific application by its ID.    |
| GET    | `/get/recruiter/applications`            | Fetch all applications for the recruiter's job postings. |
| GET    | `/update-application-status/:applicationId/:status` | Update the status of an application (e.g., accepted/rejected). |

---

### **Job Routes**
| Method | Endpoint             | Description                              |
|--------|----------------------|------------------------------------------|
| POST   | `/post-job`          | Post a new job.                          |
| PUT    | `/job-update/:id`    | Update an existing job posting.          |
| DELETE | `/delete-job/:id`    | Delete a specific job posting.           |
| GET    | `/find-jobs`         | Fetch all available jobs with optional filters. |
| GET    | `/get-job/:id`       | Fetch details of a specific job by its ID.|

---

### **User Routes**
| Method | Endpoint                      | Description                              |
|--------|-------------------------------|------------------------------------------|
| POST   | `/register`                   | Register a user (job seeker/recruiter).  |
| POST   | `/verify-code`                | Verify a user's email using a code.      |
| POST   | `/resend-verification-code`   | Resend email verification code.          |
| POST   | `/login`                      | Log in a user.                           |
| GET    | `/get-profile`                | Get the logged-in user's profile.        |
| PUT    | `/update-profile`             | Update the logged-in user's profile.     |
| GET    | `/get-user/:id`               | Get another user's profile by their ID.  |
| GET    | `/get-notifications`          | Fetch notifications for the logged-in user. |

---

## Features
- **Admin Controls**:
  - Manage users and job posts.
  - View statistics.
- **Job Seekers**:
  - Browse and apply for jobs.
  - Track application statuses.
- **Recruiters**:
  - Post and manage job listings.
  - Review and update application statuses.
- **Real-Time Notifications**:
  - Notifications for new applications (Recruiters).
  - Notifications for application status updates (Job Seekers).

---

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Uploads**: Multer
- **Real-Time**: Socket.IO
- **Environment Variables**: dotenv

---

## Setup Instructions
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` file.
4. Start the server:
   ```bash
   npm start
   ```

---

## Project Structure
- `controllers/`: Contains logic for each route.
- `models/`: Mongoose schemas for the database.
- `routes/`: Defines all API endpoints.
- `middleware/`: Includes authentication and file handling logic.

---

## Future Enhancements
- Implement search and filter features for job listings.
- Add analytics for recruiters and admin.
- Improve testing coverage with Jest or Mocha.
