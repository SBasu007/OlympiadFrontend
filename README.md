This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Admin Panel & Auth Integration

The `/admin` section is protected using a simple JWT flow provided by the separate backend (`olympiad-backend`).

### Environment Variable

Create a `.env.local` file in this project root:

```
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

This value is used by the login page and API helper (`src/lib/api.ts`).

### Login Flow
1. Visit `/admin/login`.
2. Submit credentials (must already be registered on backend via `/api/auth/register`).
3. A JWT is stored in `localStorage` as `auth_token`.
4. Navigating to `/admin` (dashboard) or other admin subpages checks for token; if missing or invalid it redirects to `/admin/login`.

### Adding New Protected Pages
Create a new folder under `src/app/admin/<slug>/page.tsx`. Use the token with the helper:

```ts
import { apiFetch } from "@/src/lib/api"; // adjust import path if needed

async function loadSomething(){
	const data = await apiFetch('/admin/category');
}
```

### Token Validation Strategy
Currently validation is optimistic (checks presence, then optional call to `/auth/me`). For stricter security, always call `/auth/me` on mount of each protected page or move validation to an edge/server middleware with cookies instead of `localStorage`.

### Logout
Remove token and redirect:
```ts
localStorage.removeItem('auth_token');
window.location.href = '/admin/login';
```

### Future Improvements
- Switch from `localStorage` to HTTP-only cookies for better XSS mitigation.
- Centralize auth guard as a higher-order component or context provider.
- Add role-based access if user table includes roles.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
