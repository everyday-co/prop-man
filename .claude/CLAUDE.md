# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twenty is an open-source CRM built with modern technologies in a monorepo structure. The codebase is organized as an Nx workspace with multiple packages.

This fork extends Twenty with a **Property Management (PM)** big app that lives alongside the core CRM experience. The PM module adds property, unit, lease, and work order management capabilities.

**Key Details:**
- **License**: AGPL-3.0
- **Node Version**: 24.5.0 (required)
- **Package Manager**: Yarn 4.9.2
- **Workspace Manager**: Nx 21.3.11

## Key Commands

### Development
```bash
# Start development environment (frontend + backend + worker)
yarn start

# Individual package development
npx nx start twenty-front     # Start frontend dev server
npx nx start twenty-server    # Start backend server
npx nx run twenty-server:worker  # Start background worker
```

### Testing
```bash
# Run tests
npx nx test twenty-front      # Frontend unit tests
npx nx test twenty-server     # Backend unit tests
npx nx run twenty-server:test:integration:with-db-reset  # Integration tests with DB reset

# Storybook
npx nx storybook:build twenty-front         # Build Storybook
npx nx storybook:serve-and-test:static twenty-front     # Run Storybook tests


When testing the UI end to end, click on "Continue with Email" and use the prefilled credentials.
```

### Code Quality
```bash
# Linting
npx nx lint twenty-front      # Frontend linting
npx nx lint twenty-server     # Backend linting
npx nx lint twenty-front --fix  # Auto-fix linting issues

# Type checking
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Format code
npx nx fmt twenty-front
npx nx fmt twenty-server
```

### Build
```bash
# Build packages
npx nx build twenty-front
npx nx build twenty-server
```

### Database Operations
```bash
# Database management
npx nx database:reset twenty-server         # Reset database
npx nx run twenty-server:database:init:prod # Initialize database
npx nx run twenty-server:database:migrate:prod # Run migrations

# Generate migration
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata
```

### GraphQL
```bash
# Generate GraphQL types
npx nx run twenty-front:graphql:generate
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Recoil (state management), Emotion (styling), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (with GraphQL Yoga)
- **Monorepo**: Nx workspace managed with Yarn 4

### Package Structure
```
packages/
├── twenty-front/          # React frontend application
├── twenty-server/         # NestJS backend API
├── twenty-ui/             # Shared UI components library
├── twenty-shared/         # Common types and utilities
├── twenty-emails/         # Email templates with React Email
├── twenty-website/        # Next.js documentation website
├── twenty-zapier/         # Zapier integration
├── twenty-e2e-testing/    # Playwright E2E tests
├── twenty-sdk/            # SDK for external integrations
└── twenty-cli/            # CLI tools
```

### Backend Module Organization

**src/engine/** - Core platform engine
- `api/` - GraphQL and REST API layers
- `core-modules/` - Platform modules (auth, billing, user, workspace)
- `metadata-modules/` - Metadata and custom object engine
- `twenty-orm/` - Custom ORM layer on top of TypeORM
- `workspace-datasource/` - Workspace-scoped data sources

**src/modules/** - Business domain modules (CRM features)
- `company/`, `person/`, `opportunity/`, `task/`
- `messaging/`, `calendar/`, `workflow/`, `timeline/`

**src/app/** - Application-specific modules
- `property-management/` - PM big app module (NEW in this fork)

### Frontend Module Organization

**src/modules/** - Feature modules
- `object-record/` - Generic object CRUD, filtering, sorting, views
- `ui/` - UI primitives (input, layout, navigation, feedback, theme)
- `settings/` - Settings pages (workspace, integrations, roles)
- `auth/` - Authentication flows
- `navigation/` - App navigation and app switcher (CRM vs PM)
- `property-management/` - PM big app UI (NEW in this fork)

**src/pages/** - Route-level page components
- `object-record/` - RecordIndexPage, RecordShowPage (generic)
- `auth/`, `onboarding/`, `not-found/`

### Frontend Routing Patterns

**Generic Object Routes** (metadata-driven)
- `/objects/:objectNamePlural` - List view for any custom object
- `/object/:objectNameSingular/:recordId` - Detail view for any record

**CRM Routes** (legacy, redirects to generic routes)
- `/crm/**` routes redirect to corresponding object routes

**PM Routes** (NEW in this fork)
- `/pm/dashboard` - Portfolio dashboard
- `/pm/properties`, `/pm/units`, `/pm/leases`, `/pm/work-orders` - Object lists
- `/pm/accounting`, `/pm/inventory`, `/pm/inspections` - Feature pages

**Route Configuration**
- Routes defined in `useCreateAppRouter.tsx`
- React Router v6
- App switcher state determines active app (CRM vs PM)

### Key Development Principles
- **Functional components only** (no class components)
- **Named exports only** (no default exports)
- **Types over interfaces** (except when extending third-party interfaces)
- **String literals over enums** (except for GraphQL enums)
- **No 'any' type allowed**
- **Event handlers preferred over useEffect** for state updates

### State Management

**Recoil Patterns**
- **Atoms** for primitive state with unique key names
  ```typescript
  export const currentUserState = atom<User | null>({
    key: 'currentUserState',
    default: null,
  });
  ```
- **Selectors** for derived state
  ```typescript
  export const userDisplayNameSelector = selector({
    key: 'userDisplayNameSelector',
    get: ({ get }) => {
      const user = get(currentUserState);
      return user ? `${user.firstName} ${user.lastName}` : 'Guest';
    },
  });
  ```
- **Atom families** for dynamic atoms (e.g., component instances)
  ```typescript
  export const userByIdState = atomFamily<User | null, string>({
    key: 'userByIdState',
    default: null,
  });
  ```
- **Component-scoped atoms** using instance IDs
- **Persistent atoms** synced to localStorage

**Local State Guidelines**
- Use multiple `useState` for unrelated state
- Use `useReducer` for complex state logic
- Functional state updates: `setCount(prev => prev + 1)`
- Props down, events up (unidirectional data flow)

**GraphQL Cache**
- Apollo Client InMemoryCache (normalized by type and ID)
- Cache updates via writeQuery/writeFragment
- Custom cache policies for metadata queries

### Backend Architecture

**Metadata-Driven Design**
- Objects, fields, and relations defined via metadata (not hardcoded entities)
- Custom objects can be created through UI without code changes
- Query via metadata/object APIs, not raw TypeORM

**Key Patterns**
- **NestJS modules** for feature organization
- **Twenty ORM** - Custom ORM abstraction over TypeORM for workspace-scoped queries
- **GraphQL** API with code-first approach (decorators + resolvers)
- **Workspace-scoped** - Multi-tenant with workspace isolation
- **Redis** for caching and session management
- **BullMQ** for background job processing (separate worker process)

**GraphQL API Structure**
- Core GraphQL API: Workspace-scoped queries/mutations for custom objects
- Metadata GraphQL API: Schema introspection and metadata management
- REST API: Alternative endpoints (wraps GraphQL internally)

### Database
- **PostgreSQL** as primary database
- **Redis** for caching and sessions
- **TypeORM migrations** for schema management
- **ClickHouse** for analytics (when enabled)

## Development Workflow

IMPORTANT: Use Context7 for code generation, setup or configuration steps, or library/API documentation. Automatically use the Context7 MCP tools to resolve library IDs and get library docs without waiting for explicit requests.

### Before Making Changes
1. Always run linting and type checking after code changes
2. Test changes with relevant test suites
3. Ensure database migrations are properly structured
4. Check that GraphQL schema changes are backward compatible

### Code Style and Conventions

**Naming Conventions**
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/Classes: `PascalCase` (component props suffix with `Props`)
- Files/directories: `kebab-case`

**Import Order** (enforced by eslint-plugin-simple-import-sort)
1. React imports
2. Third-party imports
3. Workspace packages (@/, twenty-shared, twenty-ui)
4. Relative imports

**Styling**
- Use **Emotion** with styled-components pattern
- Theme system with colors, spacing, typography, borders
- Responsive utilities available

**Internationalization**
- Use **Lingui** for all user-facing text
- Message extraction via GraphQL codegen

**Component Structure**
- Components in their own directories with:
  - `ComponentName.tsx`
  - `__tests__/ComponentName.test.tsx`
  - `__stories__/ComponentName.stories.tsx`

**Comments**
- Use short-form comments (`//`), NOT JSDoc blocks
- Explain business logic and non-obvious intentions
- Multi-line comments use multiple `//` lines

**Security**
- CSV Export: Always sanitize first, then format
  ```typescript
  const safeValue = formatValueForCSV(sanitizeValueForCSVExport(userInput));
  ```
- Input validation before processing
- No sensitive data (API keys, tokens) in code

### Testing Strategy
- **Unit tests** with Jest for both frontend and backend
- **Integration tests** for critical backend workflows
- **Storybook** for component development and testing
- **E2E tests** with Playwright for critical user flows

## Property Management Extension (NEW in this fork)

This fork adds a Property Management "big app" that lives alongside the core CRM.

**PM Data Model** (defined via Twenty's metadata engine)
- **Property** - name, address, type, unit count, owner, status, acquisition details
- **Unit** - unit number, property relation, bed/bath, rent, status
- **Lease** - property, unit, tenants, dates, rent, deposit, status
- **WorkOrder** - property, unit, tenant, category, priority, status, costs
- **LeaseCharge**, **Payment**, **InventoryItem**, **Inspection**, **Document**

**Backend** (`packages/twenty-server/src/app/property-management/`)
- `services/` - Business logic (rent roll, delinquency, object queries)
- `resolvers/` - GraphQL resolvers for portfolio and property dashboards

**Frontend** (`packages/twenty-front/src/modules/property-management/`)
- `components/` - PM-specific components (PMNavigation, etc.)
- `pages/` - PortfolioDashboardPage, PropertyDashboardPage, etc.

**Routing**
- App switcher in main layout (CRM vs PM)
- PM routes: `/pm/dashboard`, `/pm/properties`, `/pm/units`, `/pm/leases`, etc.
- Routes defined in `src/modules/app/hooks/useCreateAppRouter.tsx`

**Integration**
- Shares People and Companies with CRM
- Uses generic object views for custom PM objects
- Custom GraphQL queries for aggregated PM data
- Built on Twenty's metadata engine (no raw ORM entities)

**Documentation**
- `/docs/prd-everyday-crm-pm.md` - Product requirements
- `/docs/architecture-crm-pm.md` - Architecture overview
- `/docs/data-model-pm.md` - PM data model

## Prerequisites and Setup

**Required Software**
- Node.js 24.5.0 (use `nvm use 24.5.0`)
- PostgreSQL 16+ with 'postgres' role
- Redis server running
- Yarn 4.9.2

**Environment Configuration**

Backend (`.env` in `packages/twenty-server/`):
```bash
PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/default
REDIS_URL=redis://localhost:6379
APP_SECRET=replace_me_with_a_random_string
FRONTEND_URL=http://localhost:3001
SIGN_IN_PREFILLED=true  # Pre-fills login for dev
```

Frontend (`.env` in `packages/twenty-front/`):
```bash
REACT_APP_SERVER_BASE_URL=http://localhost:3000
VITE_BUILD_SOURCEMAP=false
```

**First-Time Setup**
```bash
nvm use 24.5.0
yarn install
npx nx database:reset twenty-server
yarn start
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
```

**Login for Development**
- Click "Continue with Email" and use prefilled credentials (when SIGN_IN_PREFILLED=true)

## Important Files
- `nx.json` - Nx workspace configuration with task definitions
- `tsconfig.base.json` - Base TypeScript configuration
- `package.json` - Root package with workspace definitions
- `.cursor/rules/` - Development guidelines and best practices
- `packages/twenty-front/src/modules/app/hooks/useCreateAppRouter.tsx` - Route definitions
- `packages/twenty-server/src/main.ts` - Backend entry point
- `packages/twenty-server/src/queue-worker/queue-worker.ts` - Worker entry point
- `packages/twenty-front/src/generated/graphql.ts` - Generated GraphQL types

## Nx Workspace Commands

```bash
# Run target for specific project
npx nx run twenty-front:build
npx nx run twenty-server:test

# Run target for multiple projects
npx nx run-many --target=build --all
npx nx run-many --target=test --projects=twenty-front,twenty-server

# View dependency graph
npx nx graph

# Check what's affected by changes
npx nx affected --target=test
npx nx affected --target=build --base=main
```

## Important Architectural Constraints (for PM Extension)

When working on the Property Management extension or making changes to the codebase:

**DO NOT:**
- Break or refactor core CRM functionality
- Remove or rename CRM routes, objects, or components
- Bypass the metadata/custom-object engine
- Create raw TypeORM entities for PM objects (use metadata instead)
- Use raw SQL queries (use Twenty ORM or metadata APIs)

**DO:**
- Extend the CRM additively with PM-specific modules
- Query PM objects via metadata/object APIs
- Follow existing patterns from Company, Person, etc.
- Use workspace-scoped queries for multi-tenancy
- Define PM objects via Twenty's Data Model UI (when possible)
