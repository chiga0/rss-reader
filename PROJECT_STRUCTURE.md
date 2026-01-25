# RSS Reader - Project Structure Guide

## Directory Organization

This project follows a structured layout aligned with the Constitution (Principle I - PWA Architecture, Principle IV - Modern Web Technologies).

### `/src` - Source Code

```
src/
├── components/          # Reusable UI components (React)
│   └── [Component files to be added]
├── pages/              # Page-level components (routes)
│   ├── FeedList.tsx
│   └── ArticleDetail.tsx
├── services/           # Business logic services
│   ├── feedService.ts          # RSS feed parsing/validation
│   └── [Additional services]
├── models/             # TypeScript interfaces and types
│   └── Feed.ts         # Core data models
├── utils/              # Utility functions
│   └── [Utilities to be added]
├── hooks/              # Custom React hooks
│   └── useStore.ts     # Zustand store integration
├── styles/             # CSS and styling
│   └── globals.css     # Global styles with Tailwind
├── lib/                # PWA and low-level utilities
│   ├── logger.ts       # Structured logging (JSON format)
│   ├── pwa.ts          # Service Worker, offline detection
│   └── storage.ts      # IndexedDB utilities
├── workers/            # Web Workers (if needed)
├── main.tsx            # Application entry point
└── App.tsx             # Root component
```

### `/tests` - Testing

```
tests/
├── unit/               # Unit tests (Vitest)
│   ├── logger.test.ts
│   ├── feedService.test.ts
│   └── [Component tests to be added]
├── integration/        # Integration tests
│   └── [Tests to be added]
├── e2e/               # End-to-end tests (Playwright)
│   └── [Tests to be added]
└── setup.ts           # Vitest configuration
```

### `/public` - Static Assets

```
public/
├── manifest.json       # Web App Manifest (PWA metadata)
├── service-worker.js   # Service Worker registration
└── icons/             # App icons
    ├── icon-192x192.png
    └── icon-512x512.png
```

### Root Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode)
- `vite.config.ts` - Vite build tool configuration
- `vitest.config.ts` - Testing framework configuration
- `tailwind.config.ts` - Tailwind CSS v4 configuration
- `.eslintrc.cjs` - Code linting rules
- `.prettierrc.json` - Code formatting rules
- `index.html` - HTML entry point

## Development Commands

```bash
# Start development server (http://localhost:5173)
pnpm dev

# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Check code coverage (must be ≥80%)
pnpm test:coverage

# Lint code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm type-check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Key Features Setup

### 1. TypeScript (Strict Mode)
- All files use `.ts` or `.tsx` extensions
- No `any` types without justification
- Path aliases configured for clean imports

### 2. React 18 + Tailwind CSS v4
- Functional components with hooks
- Responsive design: mobile (375px), tablet (768px), desktop (1024px+)
- CSS variables and utility-first approach

### 3. Zustand (State Management)
- Global app state in `src/hooks/useStore.ts`
- Integrated with logging for observability
- Actions logged with context

### 4. Vitest (Testing)
- TDD required (tests written first)
- Example tests in `tests/unit/`
- ≥80% coverage threshold
- JSdom environment for React testing

### 5. PWA & Offline
- Service Worker in `public/service-worker.js`
- Web App Manifest in `public/manifest.json`
- IndexedDB utilities in `src/lib/storage.ts`
- Offline detection in `src/lib/pwa.ts`

### 6. Observability
- Structured JSON logging in `src/lib/logger.ts`
- Production builds drop console logs
- Error tracking with stack traces

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `FeedList.tsx`, `ArticleCard.tsx` |
| Pages | PascalCase | `FeedList.tsx`, `ArticleDetail.tsx` |
| Services | camelCase | `feedService.ts`, `storageService.ts` |
| Utils | camelCase | `validators.ts`, `formatters.ts` |
| Hooks | camelCase | `useStore.ts`, `useFeeds.ts` |
| Types | PascalCase | `Feed.ts`, `Article.ts` |
| Tests | `[name].test.ts` | `feedService.test.ts` |

## Next Steps

1. **Install Dependencies**: Run `pnpm install` to set up node_modules
2. **Add Icons**: Create `public/icons/` with 192x192 and 512x512 PNG files
3. **Implement Services**: Fill in `src/services/` with RSS parsing logic
4. **Build Components**: Create UI components in `src/components/`
5. **Write Tests**: Follow TDD for each feature (tests first!)
6. **Deploy**: Build with `pnpm build` and deploy `dist/` folder

## Constitution Compliance

This structure ensures compliance with all five principles:

- ✅ **Principle I (PWA)**: Service Worker, manifest, offline storage
- ✅ **Principle II (Test-First)**: Tests directory with example tests
- ✅ **Principle III (Responsive)**: Tailwind breakpoints (375px, 768px, 1024px)
- ✅ **Principle IV (Modern Tech)**: TypeScript, React 18, Vite, Tailwind v4
- ✅ **Principle V (Observability)**: Logger, error tracking, metrics

See `.github/DEVELOPMENT.md` for detailed development workflow.
