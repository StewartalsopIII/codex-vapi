# Codex Vapi Platform

A Next.js 15 (App Router) implementation of the **VAPI Multi-Agent Voice Platform**. This project is wired for Vercel deployment with serverless API routes, Vercel KV storage, Tailwind UI, and the Vapi web SDK for reliable, server-authorised voice calls.

## Features
- App Router pages for public agents, home, and authenticated admin console.
- Secure API routes for authentication and agent CRUD backed by Vercel KV.
- Server-enforced validations to keep agent names unique, safe, and reserved-word free.
- Client-side Vapi widget that subscribes to key events and calls `start/stop` with a string `assistantId`.
- Optional per-agent Vapi public keys so collaborators can use their own billing while sharing the app shell.
- Ready-to-link Vercel project (`vercel link`), Tailwind styling, and TypeScript throughout.

## Prerequisites
- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- A Vercel KV store connected to this project
- Vapi account with a public key & assistant IDs

## Environment Variables
Configure these in the Vercel dashboard (Production, Preview, Development) and pull them locally with `vercel env pull`.

| Name | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | ✅ | Vapi web SDK public key used in the browser. |
| `ADMIN_PASSWORD` | ✅ | Server-side password used for `/api/auth` login. |
| `KV_REST_API_URL` | ✅ | Auto-provided when connecting Vercel KV. |
| `KV_REST_API_TOKEN` | ✅ | Auto-provided when connecting Vercel KV. |

## Running Locally
```bash
vercel env pull         # sync KV + project env vars
npm install
npm run dev
```
The app runs on http://localhost:3000. Use the Admin password to access `/admin`.

## Scripts
- `npm run dev` – Next.js dev server with Turbopack
- `npm run lint` – ESLint
- `npm run build` – Production build using Turbopack

## Deployment Workflow
```bash
vercel link              # one-time linking to your Vercel project
vercel env pull          # keep local env vars in sync
npm run lint
npm run build
vercel --prod
```

## API Surface
All database access flows through API routes that run as Vercel Functions.

| Route | Method | Description |
| --- | --- | --- |
| `/api/auth` | `POST` | `action=login|logout`; sets/clears `admin_session` cookie. |
| `/api/agents` | `GET` | Returns `{ agents }`. |
| `/api/agents` | `POST` | Auth-only. Creates a new agent (optional `publicKey` override). |
| `/api/agents/[name]` | `GET` | Fetch a single agent by name. |
| `/api/agents/[name]` | `PUT` | Auth-only. Updates assistant ID and/or per-agent public key. |
| `/api/agents/[name]` | `DELETE` | Auth-only. Removes an agent. |

Validation rules are enforced server-side: agent names must match `^[a-z0-9-]+$`, be 2-50 chars, avoid reserved words, and only `assistantId` or `publicKey` can change on update.

## Frontend Flow
- Home (`/`) fetches agents via `/api/agents` and displays them in a Tailwind grid.
- Agent detail (`/agent/[name]`) loads data via `/api/agents/[name]` and renders the Vapi widget.
- Admin login (`/admin/login`) submits to `/api/auth` and stores a 24h HTTP-only cookie.
- Admin dashboard (`/admin`) performs create/update/delete actions via fetch calls to the API, and lets you assign or clear per-agent public keys that override the project default.

## Next Steps
- Add your KV store + env vars on Vercel before deploying.
- Whitelist `https://hello-vapi.vercel.app` and `https://*.vercel.app` origins in Vapi if required.
- Optionally customise styling or extend analytics/logging around Vapi events.
