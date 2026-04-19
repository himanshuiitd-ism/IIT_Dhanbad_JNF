# Claude AI Coding Guidelines

## 1. Project Overview

This project is a Next.js application for managing Job Notification Forms (JNF) and Internship Notification Forms (INF) for IIT (ISM) Dhanbad's Career Development Centre. It features a multi-step form interface, PDF parsing, AI-powered data extraction, and backend integration.

## 2. Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **State Management**: TanStack Query (react-query), Zustand
- **Forms**: React Hook Form, TanStack Table
- **PDF Handling**: pdfjs-dist, react-pdf
- **Backend**: Laravel (PHP) API
- **AI**: Gemini API for PDF parsing

## 3. Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Dashboard routes
│   ├── (jnf)/              # JNF routes
│   ├── (inf)/              # INF routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   ├── auth/               # Auth components
│   ├── dashboard/          # Dashboard components
│   ├── forms/              # Form components
│   ├── jnf/                # JNF specific components
│   ├── inf/                # INF specific components
│   ├── ui/                 # UI primitives (shadcn/ui)
│   └── layout/             # Layout components
├── lib/                    # Utility functions
│   ├── api.ts              # API client
│   ├── utils.ts            # General utilities
│   ├── use-draft.ts        # Draft persistence
│   └── validation.ts       # Form validation
├── public/                 # Static assets
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## 4. Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 5. Coding Standards

### Component Guidelines

- Use functional components with TypeScript
- Keep components focused and modular
- Use `React.memo` for performance optimization where needed
- Follow the "App Router" pattern: pages in `app/`, components in `components/`

### Form Handling

- Use `react-hook-form` for form management
- Use `zod` for schema validation
- Use `react-hook-form/resolvers` to integrate Zod
- Use `useDraft` hook for draft persistence

### API Integration

- Use `axios` for API calls
- Use `react-query` for data fetching and caching
- Handle loading, error, and success states properly
- Use `try/catch` blocks for API calls

### State Management

- Use Zustand for global state (e.g., user authentication)
- Use React Context for theme and layout settings
- Use React Query for server state

### Styling

- Use Tailwind CSS for utility-first styling
- Use Lucide React for icons
- Keep styles consistent with the existing design system
- Avoid inline styles where possible

## 6. Key Features

### Multi-Step Forms

- **JNF Form**: 10 steps for job notifications
- **INF Form**: 8 steps for internship notifications
- **Draft Persistence**: Auto-save using `useDraft` hook
- **Validation**: Real-time validation with error messages
- **File Upload**: PDF upload with preview

### PDF Parsing

- **AI Extraction**: Gemini API for intelligent field mapping
- **Preview**: PDF viewer with highlighted fields
- **Manual Editing**: Users can edit extracted data before submission

### Dashboard

- **Statistics**: Overview of JNF and INF forms
- **Recent Activity**: List of recent submissions
- **Analytics**: Charts and graphs for form data

## 7. API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### JNF Forms

- `GET /api/jnf` - List all JNF forms
- `POST /api/jnf` - Create new JNF form
- `GET /api/jnf/{id}` - Get JNF form by ID
- `PUT /api/jnf/{id}` - Update JNF form
- `DELETE /api/jnf/{id}` - Delete JNF form
- `POST /api/jnf/{id}/submit` - Submit JNF form
- `POST /api/jnf/parse-pdf` - Parse PDF using AI

### INF Forms

- `GET /api/inf` - List all INF forms
- `POST /api/inf` - Create new INF form
- `GET /api/inf/{id}` - Get INF form by ID
- `PUT /api/inf/{id}` - Update INF form
- `DELETE /api/inf/{id}` - Delete INF form
- `POST /api/inf/{id}/submit` - Submit INF form
- `POST /api/inf/parse-pdf` - Parse PDF using AI

## 8. Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests with watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e
```

## 9. Performance Optimization

- Use code splitting with `next/dynamic`
- Implement lazy loading for heavy components
- Use `React.memo` to prevent unnecessary re-renders
- Optimize API calls with caching and pagination
- Use `useMemo` and `useCallback` where needed

## 10. Security

- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Sanitize all user inputs
- Use HTTPS in production
- Implement rate limiting on API endpoints

## 11. Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 12. Troubleshooting

### Common Issues

- **API connection errors**: Check `NEXT_PUBLIC_API_URL` environment variable
- **Form validation errors**: Check console for detailed error messages
- **PDF parsing issues**: Verify Gemini API key and quota
- **State management issues**: Check Zustand store and React Query cache

### Debugging

- Use `console.log` for debugging
- Use React DevTools for component inspection
- Use Redux DevTools for state inspection
- Check browser console for network errors

## 13. Best Practices

- Keep components small and focused
- Follow the single responsibility principle
- Use descriptive variable and function names
- Add comments for complex logic
- Keep code clean and organized
- Follow the DRY (Don't Repeat Yourself) principle

## 14. Contribution Guidelines

1. Create a feature branch
2. Make your changes
3. Test your changes
4. Submit a pull request
5. Ensure code follows the project's coding standards

## 15. License

This project is proprietary software for IIT (ISM) Dhanbad's Career Development Centre.
