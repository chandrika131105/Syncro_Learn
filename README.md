# SyncroLearn

SyncroLearn is a peer-to-peer learning platform that connects students with expert tutors, helps learners complete guided courses, and lets tutors build and monetize their teaching expertise.

Built as a full-stack application, it combines a modern React frontend with a Spring Boot backend to support course discovery, secure authentication, enrollments, quizzes, discussions, gamification, certificate generation, and admin controls.

## Highlights

- Student-friendly course catalog and learning dashboard
- Tutor onboarding and course creation flow
- Role-based authentication and authorization
- Course comparison and leaderboard experiences
- Quiz modules, progress tracking, and certificate verification
- Admin announcements and maintenance mode controls
- Cloudinary-based media uploads and PDF certificate support

## Tech stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Recharts and Lucide icons

### Backend
- Java 21
- Spring Boot 3.5
- Spring Security
- Spring Data JPA
- JWT authentication
- H2 database by default for local development
- MySQL-ready configuration for production use

## Repository structure

```text
Syncro_Learn/
├── README.md
├── studysync-frontend/     # React + Vite application
├── studysync-backend/      # Spring Boot REST API + JPA backend
└── .git/
```

## Project goals

This project is designed to provide a complete learning marketplace experience:

- Students discover and enroll in online courses
- Tutors create and manage lessons, quizzes, and learning tracks
- Admins monitor the platform, manage announcements, and enforce maintenance mode
- Learners can verify certificates and track course outcomes

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Java 21+
- Maven or the included Maven wrapper

### 1) Start the frontend

```bash
cd studysync-frontend
npm install
npm run dev
```

The app will start on the Vite dev server, typically at:

```text
http://localhost:5173
```

### 2) Start the backend

```bash
cd studysync-backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd studysync-backend
./mvnw.cmd spring-boot:run
```

The Spring Boot server starts with the default configuration in `src/main/resources/application.properties` using an H2 in-memory database for local development.

## Environment and configuration

Common configuration values used by the backend include:

- `JWT_SECRET` for JWT signing
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- mail settings for sending email notifications

These can be provided as environment variables or adjusted directly in the backend config.

## Main application flows

- Authentication and user registration
- Dashboard and learning analytics
- Course creation and editing by tutors
- Enrollment and course detail browsing
- Quiz-based assessment and certificate issuance
- Admin dashboard and platform settings
- Course comparison and tutor leaderboards

## Notes

- The frontend uses a protected route flow and checks for auth tokens before allowing dashboard access.
- The backend is built with security, validation, and repository-based persistence in mind.
- The project includes both local H2 and MySQL-ready configuration paths to support easy local development and deployment.

## License

This project is intended for educational and portfolio use unless otherwise specified by the repository owner.
