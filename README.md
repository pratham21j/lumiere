# 🎬 Lumiere

<div align="center">

### AI-Powered Entertainment Discovery Platform

Discover movies through conversational AI, semantic search, and personalized recommendations.

Built with **Next.js 15**, **React 19**, **TypeScript**, **PostgreSQL**, **Prisma**, **Auth.js**, **OpenAI**, and **TMDB**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991?logo=openai)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📖 About

Lumiere is a modern AI-powered entertainment discovery platform designed to redefine how users explore movies.

Unlike traditional movie recommendation websites, Lumiere combines conversational AI, semantic search, personalized recommendations, and intelligent user insights to create an engaging movie discovery experience.

The application follows modern full-stack engineering practices with scalable architecture, responsive design, authentication, AI integration, and production-ready deployment.

---

# ✨ Features

## 🎥 Movie Discovery

- Trending Movies
- Popular Movies
- Top Rated Movies
- Upcoming Releases
- Advanced Movie Search
- Genre Filtering
- Similar Movies
- Movie Details
- Cast & Crew
- Official Trailers

---

## 🤖 AI Features

- AI Movie Assistant
- Natural Language Search
- Semantic Movie Search
- Personalized Recommendations
- AI Recommendation Explanations
- AI Review Summaries
- Mood-Based Recommendations
- Personalized Taste Profile

---

## 👤 User Features

- Secure Authentication
- Google Login
- GitHub Login
- Watchlist
- Favorites
- Movie Ratings
- Smart Collections
- Personalized Dashboard
- Viewing Statistics

---

## 📊 Dashboard

- Movies Watched
- Favorite Genres
- Watchlist Count
- Rating Analytics
- Monthly Activity
- AI Taste Insights

---

## ⚡ Performance

- Server Components
- Infinite Scroll
- Lazy Loading
- Optimized Images
- Responsive Design
- Loading Skeletons
- Error Boundaries
- Accessibility Support

---

## 🔒 Security

- Auth.js Authentication
- Protected Routes
- Environment Variables
- Secure API Routes
- Zod Validation
- Session Management

---

# 🛠 Tech Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Backend

- Next.js Server Actions
- REST APIs
- Prisma ORM

## Database

- PostgreSQL
- Neon Database
- pgvector

## Authentication

- Auth.js
- Google OAuth
- GitHub OAuth

## AI

- OpenAI API
- OpenAI Embeddings
- Semantic Search
- Recommendation Engine

## External APIs

- TMDB API

## Deployment

- Vercel
- Docker
- GitHub Actions

---

# 🏗️ Architecture

```
                        ┌────────────────────┐
                        │     Next.js App    │
                        └─────────┬──────────┘
                                  │
             ┌────────────────────┴──────────────────┐
             │                                       │
             ▼                                       ▼
      Auth.js Authentication                 TMDB API
             │
             ▼
      PostgreSQL (Neon)
             │
         Prisma ORM
             │
        pgvector Database
             │
             ▼
        OpenAI API
             │
             ▼
 AI Chat • Semantic Search • Recommendations
```

---

# 📂 Project Structure

```
lumiere/

├── app/
├── components/
├── hooks/
├── lib/
├── prisma/
├── public/
├── styles/
├── types/
├── utils/
├── middleware.ts
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/lumiere.git

cd lumiere
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env.local` file.

```env
DATABASE_URL=

AUTH_SECRET=

NEXTAUTH_URL=http://localhost:3000

TMDB_API_KEY=

OPENAI_API_KEY=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=

GITHUB_CLIENT_SECRET=
```

---

## Database Setup

Generate Prisma Client

```bash
npx prisma generate
```

Run Migrations

```bash
npx prisma migrate dev
```

---

## Start Development Server

```bash
npm run dev
```

Visit

```
http://localhost:3000
```

---

# 📸 Screenshots

Add screenshots of your application here.

```
Home Page

AI Chat

Movie Details

User Dashboard

Recommendations

Watchlist
```

---

# 🚀 Deployment

Deploy effortlessly using **Vercel**.

```bash
npm run build
```

Configure all environment variables in your deployment platform before publishing.

---

# 🎯 Future Improvements

- Voice Search
- Multi-language Support
- Friend Recommendations
- Streaming Platform Integration
- Mobile Application
- Real-time Notifications
- Offline Support

---

# 📚 What I Learned

During the development of Lumiere, I gained practical experience with:

- Building scalable full-stack applications
- Authentication using Auth.js
- Database design with Prisma & PostgreSQL
- AI integration using OpenAI APIs
- Semantic search with pgvector
- Modern React & Next.js architecture
- REST API development
- Performance optimization
- Responsive UI development
- Production deployment

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Pratham Jain**

- GitHub: https://github.com/pratham21j
- LinkedIn: https://www.linkedin.com/in/pratham-jain-ba3b1a36b/
- Portfolio: https://YOUR_PORTFOLIO

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

Built with ❤️ using Next.js, TypeScript, PostgreSQL & AI.

</div>
