# SyncroLearn Frontend

The frontend for SyncroLearn is a React + Vite application that delivers the student, tutor, and admin experience for the learning marketplace.

## What this app includes

- Landing page and marketing experience
- Authentication screens for login and signup
- Student and tutor dashboards
- Course creation, editing, and detail views
- Comparison and leaderboard pages
- Quiz experience and certificate verification
- admin controls and maintenance-mode handling

## Tech stack

- React 19
- Vite
- React Router
- Framer Motion
- Tailwind CSS
- Recharts
- Lucide React

## Run locally

```bash
cd studysync-frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

## Project structure

```text
src/
├── App.jsx
├── components/
├── hooks/
├── pages/
├── services/
├── assets/
├── index.css
└── main.jsx
```

## Notes

- Auth is managed through local storage tokens and protected routes.
- The app is designed to interact with the Spring Boot backend APIs.
- The user experience emphasizes a polished, modern learning platform look and feel.
