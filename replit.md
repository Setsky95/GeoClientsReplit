# Customer Management Application

## Overview

This is a full-stack web application for managing customer information with location mapping capabilities. The application provides a comprehensive solution for storing, searching, and visualizing customer data on an interactive map interface. Users can add new customers, view their locations on a map, search through existing customers, and manage customer information through a clean, responsive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Map Integration**: Leaflet for interactive mapping functionality

### Backend Architecture
- **Framework**: Express.js with TypeScript for RESTful API development
- **Development Server**: Hot Module Replacement (HMR) with Vite integration for seamless development
- **API Design**: RESTful endpoints for customer CRUD operations and search functionality
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request/response logging

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Database**: PostgreSQL configured through Drizzle with Neon Database serverless driver
- **Schema**: Strongly typed database schema with Zod validation integration
- **Development Storage**: In-memory storage implementation for development/testing
- **Migration System**: Drizzle Kit for database schema migrations

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: Basic session-based authentication setup (extensible for future auth requirements)

### Code Organization
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories
- **Shared Types**: Common TypeScript types and Zod schemas shared between frontend and backend
- **Component Architecture**: Modular React components with clear separation of concerns
- **API Layer**: Centralized API request handling with error management
- **Path Aliases**: TypeScript path mapping for clean imports (`@/`, `@shared/`)

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect support

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Web fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Map Services
- **Leaflet**: Open-source mapping library for interactive maps
- **Geocoding Services**: Integration ready for address-to-coordinate conversion

### Form and Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Zod integration with React Hook Form

### State Management
- **TanStack Query**: Server state management, caching, and synchronization
- **React Context**: Local state management for UI components