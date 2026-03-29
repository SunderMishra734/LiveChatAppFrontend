# Project Context: LiveChatAppFrontend

This document provides a comprehensive overview of the `LiveChatAppFrontend` project to help AI assistants understand its structure, architecture, and technology stack.

## 1. Project Overview
`LiveChatAppFrontend` is a modern real-time chat application built with Angular 18. It supports user-to-user chat, user-to-agent chat, and an integrated AI chat interface. It also includes an administrative portal for managing customers and users.

## 2. Technology Stack
- **Framework**: Angular 18 (using SSR with @angular/ssr)
- **UI Library**: Angular Material (@angular/material)
- **Styling**: Tailwind CSS
- **Real-time Communication**: SignalR (@microsoft/signalr)
- **Editor**: CKEditor 5 (@ckeditor/ckeditor5-angular)
- **Authentication**: JWT-based (stored in local storage/cookies, handled via interceptors)

## 3. Project Structure
The project follows a standard Angular organization, with some custom directories:

- `src/app/`: Main application logic, routes, and root component.
  - `app.routes.ts`: Defines the application routing.
  - `app.config.ts`: App-wide configuration and providers.
- `src/pages/`: Main page-level components.
  - `admin/`: Admin dashboard and management pages.
  - `ai-chat-page/`: AI-powered chat interface.
  - `auth/`: Login and registration pages.
  - `chat-page/`: Standard user/agent chat interface.
  - `profile-page/`: User profile management.
  - `setting-page/`: Application settings and feedback.
- `src/shared/`: Shared resources across the app.
  - `components/`: Reusable UI components (e.g., `admin-main-page`).
  - `config/`: Application constants and API endpoint configurations (`api.config.ts`).
- `src/services/`: Data services for API communication.
  - `api.service.ts`: Base service for making HTTP requests.
  - `auth.service.ts`: Handles authentication-related logic.
  - `signalr.service.ts`: Manages SignalR connections for real-time updates.
  - `ai-chat.service.ts`: Services specifically for the AI chat module.
- `src/Interceptors/`: HTTP interceptors (e.g., adding Auth tokens).
- `src/models/`: TypeScript interfaces and DTOs representing API data.
- `src/environments/`: Environment-specific configurations (API base URLs).

## 4. Key Configurations
- **API Endpoints**: Defined centrally in `src/shared/config/api.config.ts`. Always use this file when adding new API calls.
- **Routing**: Guard-protected routes (`auth.guard.ts`, `admin.guard.ts`) ensure only authorized users access certain areas.
- **Server-Side Rendering (SSR)**: Enabled for improved performance and SEO.

## 5. UI and UX Patterns
- **Forms**: Extensive use of `ReactiveFormsModule` for complex forms (e.g., in `AdminMainPageComponent`).
- **Feedback**: Custom `ToasterMessageComponent` is used for success/error notifications.
- **Layouts**: Combination of Tailwind CSS for responsive utility-first styling and Angular Material for consistent accessible components.
- **View Modes**: Some components support multiple view modes (e.g., 'card' vs 'table' in Admin pages).

## 6. Development Guidelines
- **UI Components**: Prefer Angular Material components for standard UI elements (buttons, inputs, selects). Use Tailwind CSS for layout and custom styling.
- **State Management**: Uses services with `BehaviorSubject` or SignalR for real-time state synchronization.
- **HTTP Calls**: Should always go through a service that uses the `ApiService` or `HttpClient`.
- **Naming Conventions**: Follow standard Angular naming conventions (`feature.component.ts`, `feature.service.ts`).

## 6. Common Tasks for AI
- **Adding a Page**: Create the component in `src/pages/`, add its route in `app.routes.ts`, and update navigation if necessary.
- **Adding an API**: Define the endpoint in `api.config.ts`, add a method in the relevant service in `src/services/`, and create a model in `src/models/`.
- **UI Updates**: Use Tailwind utility classes for quick styling tweaks, but ensure consistency with existing pages like the Admin Portal or AI Chat.
