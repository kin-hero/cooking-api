# Recipify - Backend API

[**View Live Demo**](https://recipify.keanesetiawan.com/) | [**Read Full Case Study**](https://keanesetiawan.com/projects/recipify)

A production-grade, cloud-native RESTful API built with Fastify, TypeScript, and AWS services. This backend powers the Recipify recipe-sharing platform, featuring dual runtime support (Node.js + AWS Lambda), transactional image processing with S3/CloudFront CDN, comprehensive authentication flows with JWT and OAuth, and clean layered architecture for maintainability and scalability.

## Core Features

- **Dual Runtime Architecture:** Seamlessly runs on both standalone Node.js servers and AWS Lambda without code duplication
- **Recipe Management API:** Full CRUD operations with pagination, draft system, and author filtering
- **Multi-Auth System:** Email/password with JWT tokens, Google OAuth 2.0, and email verification via AWS SES
- **Advanced Image Pipeline:** Automatic resizing (thumbnail + large), S3 upload, and CloudFront CDN integration with transactional safety
- **Clean Architecture:** Strict layering (Controllers → Services → Repositories) with centralized error handling
- **Database Security:** PostgreSQL with Prisma ORM, row-level security (RLS), and UUID primary keys
- **Production Ready:** Rate limiting, CORS protection, security headers, structured logging, and comprehensive testing

## Tech Stack

| Area | Technology |
| --- | --- |
| **Framework** | Fastify 4 (high-performance Node.js) |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | JWT + Google OAuth|
| **AWS Services** | S3, CloudFront CDN, SES, Lambda |
| **Image Processing** | Sharp (resize + optimization) |
| **Email** | AWS SES (transactional emails) |
| **Deployment** | AWS Lambda + API Gateway OR Docker |
| **Testing** | Jest (unit + integration tests) |
| **DevOps** | Docker Compose, Serverless Framework |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized development)
- PostgreSQL 14+ (or use Supabase)
- AWS Account (for S3, SES, CloudFront features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kin-hero/cooking-api.git
cd cooking-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the root directory
# See "Environment Configuration" section below for all required variables
```

4. Run database migrations:
```bash
npm run db:migrate
npm run db:generate
```

5. Start the development server:
```bash
# Option 1: Docker (recommended)
make dev-up

# Option 2: Direct Node.js
npm run dev

# Option 3: Lambda simulation
npm run lambda-offline
```

6. Open [http://localhost:3000/health](http://localhost:3000/health) to verify the API is running.

**Note:** The API runs on port **3000** by default. Lambda offline mode uses port **3001**.

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload (tsx watch)
make dev-up              # Start Docker development environment
make dev-logs            # View Docker container logs

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio GUI

# Testing & Quality
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # TypeScript type checking

# Build & Deployment
npm run build            # Build for production (TypeScript + path aliases)
npm start                # Start production server
npm run lambda-offline   # Test AWS Lambda locally (serverless-offline)
```

## Backend Architecture

This project follows a **clean layered architecture** with clear separation of concerns, ensuring maintainability, testability, and scalability.

### Layered Architecture Pattern

```
┌──────────────────────────────────────────────────────────┐
│                  Fastify Application                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │Auth Routes │  │Recipe      │  │User Routes │        │
│  │            │  │Routes      │  │            │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        │                │                │               │
│  ┌─────▼────────────────▼────────────────▼─────────┐   │
│  │            Controllers Layer                     │   │
│  │  (HTTP handling, validation, response format)   │   │
│  └─────┬────────────────────────────────────────────┘   │
│        │                                                  │
│  ┌─────▼────────────────────────────────────────────┐   │
│  │            Services Layer                        │   │
│  │  (Business logic, orchestration, field mapping) │   │
│  └─────┬────────────────────────────────────────────┘   │
│        │                                                  │
│  ┌─────▼────────────────────────────────────────────┐   │
│  │            Repositories Layer                    │   │
│  │  (Database transactions, Prisma queries)        │   │
│  └─────┬────────────────────────────────────────────┘   │
└────────┼──────────────────────────────────────────────────┘
         │
   ┌─────▼─────────────────────────┐
   │  PostgreSQL + Prisma ORM      │
   │  (Row Level Security Enabled) │
   └───────────────────────────────┘
```

### Dual Runtime Support

The application supports two deployment modes without code duplication:

**Standalone Mode** (`src/app.ts`)
- Direct Node.js execution with Fastify
- Best for: Local development, traditional VPS/container deployments
- Command: `npm run dev` or Docker Compose

**Serverless Mode** (`src/lambda.ts`)
- AWS Lambda + API Gateway via `@fastify/aws-lambda`
- Warm-start optimization with cached app instance
- Best for: Auto-scaling production workloads with pay-per-use pricing
- Command: `serverless deploy`

**Code Reuse Strategy:**
- Both modes share the same `setupApp()` function from `src/app.ts`
- Lambda handler caches configured app to avoid re-initialization on warm starts
- Ensures identical behavior between local and serverless environments

## Project Structure

```
cooking-api/
├── src/
│   ├── app.ts                  # Fastify app configuration
│   ├── lambda.ts               # AWS Lambda handler
│   │
│   ├── controllers/            # HTTP request handlers
│   │   ├── auth.ts             # Auth endpoints
│   │   └── recipes.ts          # Recipe endpoints
│   │
│   ├── services/               # Business logic layer
│   │   ├── auth.ts             # Auth service
│   │   ├── recipes.ts          # Recipe service
│   │   ├── email.ts            # Email service (SES)
│   │   ├── jwt.ts              # JWT token service
│   │   ├── googleOAuth.ts      # Google OAuth
│   │   ├── imageService.ts     # Image processing
│   │   └── s3/                 # S3 service hierarchy
│   │       ├── S3Service.ts    # Base S3 operations
│   │       └── S3ImageService.ts # Recipe-specific S3
│   │
│   ├── repositories/           # Database access layer
│   │   ├── auth.ts             # Auth DB operations
│   │   └── recipes.ts          # Recipe DB operations
│   │
│   ├── routes/                 # Route definitions
│   │   ├── auth.ts             # /api/auth routes
│   │   ├── recipes.ts          # /api/recipes routes
│   │   └── users.ts            # /api/users routes
│   │
│   ├── middleware/             # Request middleware
│   │   ├── auth.ts             # JWT authentication
│   │   └── rateLimiter.ts      # Rate limiting
│   │
│   ├── schema/                 # Zod validation schemas
│   │   ├── auth/               # Auth schemas
│   │   └── recipes/            # Recipe schemas
│   │
│   ├── utils/                  # Helper functions
│   │   ├── errorHandler.ts     # Centralized error handler
│   │   └── recipeUtils.ts      # Recipe utilities
│   │
│   ├── types/                  # TypeScript definitions
│   │   ├── index.ts            # Shared types
│   │   └── recipe.ts           # Recipe types
│   │
│   └── lib/                    # External service clients
│       └── prisma.ts           # Prisma client singleton
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── tests/
│   ├── setup.ts                # Test configuration
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
│
├── docker-compose.dev.yaml     # Development Docker config
├── docker-compose.yaml         # Production Docker config
├── serverless.yml              # AWS Lambda deployment config
├── Makefile                    # Development commands
└── package.json
```

### Architecture Principles

**1. Strict Layer Separation**
- **Controllers** - Handle HTTP concerns only (validation, formatting)
- **Services** - Contain all business logic and orchestration
- **Repositories** - Handle database operations and transactions
- **Utilities** - Pure functions with no side effects

**2. Transaction-First for Complex Operations**
- Recipe creation/update with images uses Prisma transactions
- Ensures data consistency (rollback if any step fails)
- 60-second timeout for S3 operations within transactions

**3. Inheritance-Based Service Design**
- `S3Service` (base) - Generic upload/delete operations
- `S3ImageService` (specialized) - Recipe-specific image handling
- Lazy-loaded clients for optimal memory usage

**4. Centralized Error Handling**
- All controllers use `handleError()` utility
- Returns 400 for known errors with messages
- Returns 500 for unknown errors (prevents information leakage)

**5. Type Safety Throughout**
- TypeScript strict mode enabled
- Path aliases (`@/*`) for clean imports
- Type-safe environment variable access

### Key Architectural Decisions

**Image Processing Pipeline:**
```
Upload → Validation → Transaction Start
            │
      Create Recipe
            │
      Resize Images (Sharp)
      • Thumbnail: 300px
      • Large: 800px
            │
      Upload to S3
      • userId/recipeId/thumbnail.jpg
      • userId/recipeId/large.jpg
            │
      Update Recipe URLs
      (CloudFront CDN URLs)
            │
     Transaction Commit ✓
```

**CDN Integration:**
- `S3Service.constructPublicUrl()` checks for `AWS_CDN_BASE_URL`
- Returns CloudFront URLs if configured, otherwise direct S3 URLs
- Backward compatible for local development

**Email Service (AWS SES):**
- Lazy-loaded SES client
- Lambda credential workaround: Temporarily clears AWS env vars to use execution role
- HTML email templates with 24-hour token expiration

**Authentication Flow:**
- JWT tokens stored in HTTP-only cookies (`recipe_token_user`)
- Two middleware types:
  - `authenticateToken`: Requires valid JWT (401 if missing)
  - `allowEmptyToken`: Optional auth (continues without error)

## Environment Configuration

### Required Variables

```bash
# Database (Supabase or self-hosted PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/db"
DIRECT_URL="postgresql://user:password@host:5432/db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# AWS Configuration
AWS_REGION="ap-northeast-3"
AWS_S3_BUCKET_NAME="recipely-recipe-images-dev"
AWS_CDN_BASE_URL="https://d1na6r1phhkgo7.cloudfront.net"
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"
AWS_SES_FROM_NAME="Recipify Team"

# OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# CORS & Frontend
CORS_ORIGIN="http://localhost:4000"
FRONTEND_URL="http://localhost:4000"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"
```

### Important Notes

- **Lambda Deployment:** Do NOT set `AWS_PROFILE`, `AWS_ACCESS_KEY_ID`, or `AWS_SECRET_ACCESS_KEY` in Lambda environment. Lambda automatically uses execution role credentials.
- **CloudFront CDN:** Set `AWS_CDN_BASE_URL` to enable CDN URLs. Leave empty for direct S3 URLs (local dev).
- **JWT Tokens:** Default expiration is 7 days. Adjust `JWT_EXPIRES_IN` as needed.

## API Documentation

### Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://your-api-gateway-url.amazonaws.com/api`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user with email | No |
| `POST` | `/auth/login` | Login with email/password | No |
| `GET` | `/auth/verify-email` | Verify email with token | No |
| `GET` | `/auth/google` | Initiate Google OAuth flow | No |
| `GET` | `/auth/google/callback` | Google OAuth callback | No |

### Recipe Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/recipes` | Get all published recipes (paginated) | No |
| `GET` | `/recipes/:id` | Get recipe by ID | No |
| `GET` | `/recipes/author/me` | Get current user's recipes (including drafts) | Yes |
| `POST` | `/recipes` | Create new recipe with image | Yes |
| `PATCH` | `/recipes/:id` | Update recipe | Yes (Owner) |
| `DELETE` | `/recipes/:id` | Delete recipe and images | Yes (Owner) |

### Example: Create Recipe

```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Cookie: recipe_token_user=YOUR_JWT_TOKEN" \
  -F "title=Spaghetti Carbonara" \
  -F "description=Classic Italian pasta dish" \
  -F 'ingredients=["400g spaghetti","200g pancetta","4 eggs","100g Pecorino Romano"]' \
  -F 'instructions=["Boil pasta","Cook pancetta","Mix eggs and cheese","Combine all"]' \
  -F "prepTimeMinutes=15" \
  -F "cookingTimeMinutes=20" \
  -F "servingSize=4" \
  -F "isPublished=true" \
  -F "image=@./recipe-image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe has been created successfully"
}
```

## Development Best Practices

### Import Patterns

Always use path aliases and destructured imports:

```typescript
// ✅ Correct
import { RecipeService } from '@/services/recipes';
import { useState, useEffect } from 'react';

// ❌ Avoid
import { RecipeService } from '../services/recipes';
import * as React from 'react';
```

### Error Handling Pattern

All controllers use centralized error handling:

```typescript
import handleError from '@/utils/errorHandler';

export const createRecipe = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Controller logic...
    return reply.status(201).send({ success: true });
  } catch (error) {
    return handleError(reply, error);
  }
};
```

### Transaction Pattern

Use callbacks for operations requiring external services within transactions:

```typescript
await recipeService.createRecipeWithTransaction(
  recipeData,
  async (recipeId: string) => {
    // Image processing happens inside transaction
    const { thumbnailUrl, largeUrl } = await processImagePipeline({
      userData: { imageFile, userId, recipeId },
      services: { imageService, s3ImageService }
    });
    return { thumbnailUrl, largeUrl };
  }
);
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/services/recipes.test.ts
```

### Test Structure

```
tests/
├── setup.ts              # Test environment configuration
├── unit/
│   ├── services/         # Service layer tests
│   └── utils/            # Utility function tests
└── integration/
    └── api/              # End-to-end API tests
```

## Deployment

### AWS Lambda + API Gateway

```bash
# Deploy to AWS
serverless deploy --stage production

# View logs
serverless logs -f app --stage production

# Remove deployment
serverless remove --stage production
```

### Docker Deployment

```bash
# Build production image
docker build -t recipify-api:latest .

# Run container
docker run -p 3000:3000 --env-file .env recipify-api:latest
```

### Traditional Server

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Learn More

### Technologies
- [Fastify Documentation](https://www.fastify.io/docs/) - Web framework and plugins
- [Prisma Documentation](https://www.prisma.io/docs/) - ORM and database migrations
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system and best practices
- [Sharp Documentation](https://sharp.pixelplumbing.com/) - Image processing library

### AWS Services
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/) - Object storage
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/) - CDN service
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/) - Email service
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/) - Serverless compute

### Project Resources

- [Full Case Study](https://keanesetiawan.com/projects/recipify) - Architecture, challenges, and solutions
- [Frontend Repository](https://github.com/kin-hero/cooking-ui) - Next.js 15 UI
- [Project Hub](https://github.com/kin-hero/Recipify/) - Recipify Hub
