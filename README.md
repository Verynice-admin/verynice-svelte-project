# VeryNice

A modern travel and tourism website built with SvelteKit, featuring content about Kazakhstan's cities, attractions, national parks, and more.

## Tech Stack

- **Framework:** SvelteKit 2.5
- **Language:** TypeScript
- **Styling:** CSS
- **Database:** Firebase (Firestore)
- **Image Hosting:** Cloudinary
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Cloudinary account (for image hosting)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd verynice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your Firebase credentials:
   - Get client-side config from Firebase Console > Project Settings > General
   - For server-side, place your `serviceAccountKey.json` in `.secrets/` directory
   - Or set `GOOGLE_APPLICATION_CREDENTIALS` to point to your service account file

4. **Set up Firebase Service Account**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key
   - Save it as `.secrets/serviceAccountKey.json` (this directory is gitignored)

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
verynice/
├── .secrets/              # Service account keys (gitignored)
├── src/
│   ├── lib/
│   │   ├── components/   # Reusable Svelte components
│   │   ├── server/        # Server-only code (Firebase Admin)
│   │   ├── services/      # Firebase services
│   │   └── utils/         # Utility functions
│   ├── routes/            # SvelteKit routes
│   └── styles/            # Global styles
├── static/                # Static assets
└── _scripts/              # Seeding/migration scripts
```

## Environment Variables

See `.env.example` for all required environment variables.

**Important:** Never commit `.env` or `.secrets/` directory to version control.

## Development

The project uses:
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **SvelteKit** file-based routing

## Deployment

The project is configured for Vercel deployment. Simply connect your repository to Vercel and set the environment variables in the Vercel dashboard.

## Security Notes

- Service account keys are stored in `.secrets/` directory (gitignored)
- Never commit sensitive credentials
- Use environment variables for production deployments
- The `.secrets/` directory is excluded from version control

## License

[Add your license here]
