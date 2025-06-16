# Todo Application - NestJS Workshop

A modern, full-stack Todo application built with **NestJS** and **React** in a **monorepo architecture**. This project demonstrates best practices for building scalable, type-safe, and testable web applications with end-to-end type safety.

## 🎯 Project Overview

This project implements a comprehensive Todo management system following the Product Requirements Document (PRD). It showcases:

- **Modern Backend Architecture**: NestJS with TypeScript, TypeORM, and PostgreSQL/SQLite
- **Responsive Frontend**: React 19 with Vite, TailwindCSS, TanStack Query, and Zustand
- **Type Safety**: End-to-end type safety with shared DTOs and Zod validation
- **Testing**: Comprehensive unit and E2E testing strategies
- **Documentation**: Auto-generated API documentation with Swagger/OpenAPI
- **Database Flexibility**: Support for both SQLite (development) and PostgreSQL (production)

## 🏗️ Architecture

### Monorepo Structure

```
v03-workshop-nestjs-monorepo/
├── apps/
│   ├── backend/          # NestJS API server
│   └── frontend/         # React client application
├── packages/
│   └── shared/           # Shared types, DTOs, and utilities
├── package.json          # Root package configuration
├── pnpm-workspace.yaml   # Workspace configuration
└── README.md             # This file
```

### Technology Stack

#### Backend (`apps/backend`)
- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: [TypeORM](https://typeorm.io/) for database operations
- **Validation**: Zod schemas with `nestjs-zod`
- **Documentation**: Swagger/OpenAPI auto-generation
- **Testing**: Jest for unit tests, Supertest for E2E tests

#### Frontend (`apps/frontend`)
- **Framework**: [React 19](https://react.dev/) with TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and building
- **Styling**: [TailwindCSS](https://tailwindcss.com/) for utility-first CSS
- **State Management**: 
  - [TanStack Query](https://tanstack.com/query) for server state
  - [Zustand](https://zustand-demo.pmnd.rs/) for client state
- **HTTP Client**: [Axios](https://axios-http.com/) for API communication
- **Routing**: [React Router](https://reactrouter.com/) for client-side routing

#### Shared (`packages/shared`)
- **Validation**: [Zod](https://zod.dev/) schemas
- **Types**: Shared TypeScript interfaces and DTOs
- **Utilities**: Common utility functions

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0 (recommended package manager)
- **PostgreSQL** (for production database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd v03-workshop-nestjs-monorepo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   
   Create environment files for each application:
   
   **Backend** (`apps/backend/.env`):
   ```env
   # Database Configuration
   DB_TYPE=sqlite  # or 'postgres' for production
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=todo_app
   
   # Application
   PORT=3001
   NODE_ENV=development
   ```

   **Frontend** (`apps/frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Development Workflow

#### Start Development Servers

```bash
# Start backend development server
pnpm dev:backend

# Start frontend development server (in another terminal)
pnpm dev:frontend
```

The applications will be available at:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:3001/api-docs

#### Building for Production

```bash
# Build backend
pnpm build:backend

# Build frontend  
pnpm build:frontend
```

## 📚 API Documentation

### Endpoints

The API follows RESTful conventions:

| Method | Endpoint      | Description           |
|--------|---------------|-----------------------|
| GET    | `/todos`      | Get all todos         |
| GET    | `/todos/:id`  | Get todo by ID        |
| POST   | `/todos`      | Create new todo       |
| PUT    | `/todos/:id`  | Update existing todo  |
| DELETE | `/todos/:id`  | Delete todo           |

### Todo Schema

```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Interactive Documentation

Visit http://localhost:3001/api-docs when the backend is running to explore the full API documentation with Swagger UI.

## 🧪 Testing

### Running Tests

```bash
# Backend unit tests
cd apps/backend
pnpm test

# Backend E2E tests
cd apps/backend
pnpm test:e2e

# Frontend tests
cd apps/frontend
pnpm test
```

### Testing Strategy

- **Unit Tests**: Test individual components, services, and controllers in isolation
- **Integration Tests**: Test database operations and service interactions
- **E2E Tests**: Test complete API workflows using Supertest
- **Frontend Tests**: Component testing with React Testing Library

## 🗄️ Database

### SQLite (Development)

For quick local development, the application uses SQLite:
- Database file: `apps/backend/db.sqlite`
- Auto-synchronization enabled in development
- No additional setup required

### PostgreSQL (Production)

For production deployments:

1. **Install PostgreSQL**
2. **Create database**:
   ```sql
   CREATE DATABASE todo_app;
   ```
3. **Update environment variables** in `apps/backend/.env`
4. **Run migrations**:
   ```bash
   cd apps/backend
   pnpm migration:run
   ```

### Database Migrations

```bash
# Generate new migration
pnpm migration:generate -n MigrationName

# Run pending migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert
```

## 🔧 Development Tools

### Code Quality

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (if configured)
- **TypeScript**: Static type checking
- **Husky**: Git hooks for pre-commit checks (if configured)

### Package Management

This project uses **pnpm workspaces** for efficient monorepo management:

```bash
# Install dependency to specific workspace
pnpm add <package> --filter @v03-workshop/backend
pnpm add <package> --filter @v03-workshop/frontend

# Run scripts in specific workspace
pnpm --filter @v03-workshop/backend <script>
pnpm --filter @v03-workshop/frontend <script>
```

## 📁 Project Structure Details

### Backend Structure
```
apps/backend/
├── src/
│   ├── main.ts           # Application entry point
│   ├── app.module.ts     # Root module
│   ├── todo/             # Todo feature module
│   │   ├── dto/          # Data transfer objects
│   │   ├── entities/     # TypeORM entities
│   │   ├── todo.controller.ts
│   │   ├── todo.service.ts
│   │   └── todo.module.ts
│   └── database/         # Database configuration
├── test/                 # E2E tests
└── migrations/           # Database migrations
```

### Frontend Structure
```
apps/frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
└── dist/                # Build output
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**:
   ```bash
   pnpm test
   ```
5. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages
- Keep PRs focused and reasonably sized

## 🎓 Learning Resources

This project is part of a comprehensive NestJS workshop. Key learning topics include:

- **NestJS Fundamentals**: Modules, Controllers, Services, Dependency Injection
- **Database Integration**: TypeORM, Migrations, Multiple Database Support
- **API Design**: RESTful APIs, DTOs, Validation, Documentation
- **Testing Strategies**: Unit Testing, E2E Testing, Mocking
- **Frontend Integration**: React, State Management, API Integration
- **DevOps Concepts**: Environment Management, Database Migrations

### Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [React Documentation](https://react.dev/)
- [TanStack Query Documentation](https://tanstack.com/query)

## 📄 License

This project is created for educational purposes as part of a NestJS workshop.

---

**Happy Coding! 🚀**

For questions or support, please refer to the workshop materials or create an issue in the repository.