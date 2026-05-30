# Resume Screening & Candidate Ranking

Production-ready internal tool that ingests resumes and a job description, scores candidates with Groq, and returns a ranked dashboard with CSV export.

## Features

- Upload up to 20 resumes (PDF, DOC, DOCX)
- Type or upload a job description
- LLM scoring with structured output
- Ranked results dashboard with search + sorting
- CSV export of results
- Safe error handling (batch continues on per-candidate failures)

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Prisma + PostgreSQL
- Groq API (llama-3.1-8b-instant)
- pdf-parse + mammoth for parsing
- papaparse for CSV export

## Setup

1. Copy the environment file and set values.

```
cp .env.example .env
```

2. Install dependencies.

```
npm install
```

3. Initialize Prisma and the database.

```
npx prisma migrate dev --name init
npx prisma generate
```

4. Start the dev server.

```
npm run dev
```

Open http://localhost:3000

## Environment Variables

Required variables in .env:

- DATABASE_URL
- GROQ_API_KEY
- NEXT_PUBLIC_APP_URL

## Usage

1. Upload resumes (PDF, DOC, DOCX) on Step 1.
2. Provide a job description (type or upload).
3. Click “Analyze Candidates”.
4. Review the ranked results and export CSV if needed.

## API Endpoints

### POST /api/upload

Accepts multipart/form-data with fields:

- files (multiple resume files)
- jdText (string)
- jdFile (optional, PDF/DOC/DOCX)

Creates a new session and candidates in the database.

### POST /api/analyze

Body:

```
{ "sessionId": "..." }
```

Scores all candidates for the session, updates rank, and returns sorted results.

### GET /api/export?sessionId=...

Returns a CSV export of ranked results.

## Limits & Constraints

- Max file size: 5MB per resume/JD
- Max resumes: 20
- Unsupported formats are rejected

## Troubleshooting

- If parsing fails for a resume or JD, the system stores an empty string and continues.
- If Groq scoring fails, the candidate is returned with score 0 and a failure summary.
- Ensure your PostgreSQL database is reachable from the DATABASE_URL.

## Scripts

- npm run dev — start development server
- npm run lint — run linting
