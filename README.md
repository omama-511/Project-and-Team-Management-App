# Project and Team Management System

A robust, modern full-stack application built with **Angular 21** and **Laravel 12**. This system provides a comprehensive solution for managing projects, teams, and tasks with role-based access control and real-time-like interactions.

## 🚀 Key Features

- **Authentication & Security**: Secure login and registration powered by Laravel Sanctum.
- **User Management**:
  - Role-based access control (Admin vs. User).
  - Admin capabilities to toggle user roles.
  - Profile management including secure password updates.
- **Project Management**:
  - Full CRUD operations for projects.
  - Team collaboration: add or remove members from specific projects.
- **Task Tracking**:
  - Create, update, and delete tasks within projects.
  - Assign tasks to specific team members.
  - Status tracking and management.
- **Email Notifications**: Integrated SMTP support for welcome emails and important updates.
- **Modern UI/UX**:
  - Responsive design built with Angular Material.
  - Dark mode support for enhanced readability.
  - Clean, intuitive dashboard and navigation.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 21
- **UI Components**: Angular Material / CDK
- **State Management**: RxJS
- **Testing**: Vitest
- **Styling**: Vanilla CSS with modern variables

### Backend
- **Framework**: Laravel 12
- **Authentication**: Laravel Sanctum
- **Database**: MySQL / SQLite (configurable)
- **Testing**: PHPUnit
- **Mailing**: Laravel Mail with SMTP support

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: (v18+ recommended)
- **PHP**: (v8.2+ required)
- **Composer**: For PHP dependency management
- **Database**: MySQL or SQLite

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   composer install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your database and SMTP credentials
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Start the server:
   ```bash
   php artisan serve
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`.

---

## 🧪 Testing

### Backend
Run Laravel tests using PHPUnit:
```bash
cd backend
php artisan test
```

### Frontend
Run Angular tests using Vitest:
```bash
cd frontend
npm test
```

## 📝 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Register a new user | No |
| POST | `/api/login` | Login and get token | No |
| GET | `/api/me` | Get current user info | Yes |
| PUT | `/api/profile` | Update user profile | Yes |
| GET | `/api/projects` | List all projects | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| PUT | `/api/users/{id}/role`| Update user role (Admin only) | Yes |

---

## 📄 License
This project is open-sourced software licensed under the [MIT license](LICENSE).
