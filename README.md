# Maintenance Dispatch Portal

A functional mini-portal where Property Managers can manage and assign maintenance
tasks.

## Authentication

This project uses Django Session Authentication. After login, Django creates a secure session cookie that is automatically sent by the browser on future requests. Frontend requests must include **credentials: "include"** to allow browser cookies to be sent.

## CSRF Protection

Django CSRF middleware is enabled. The frontend reads the csrftoken cookie and sends it using the X-CSRFToken header for all unsafe HTTP methods: POST, PUT, PATCH, DELETE. This prevents CSRF attacks while maintaining secure cookie-based authentication.

## Running with CSRF & Cookies in Development

When developing locally with a separate frontend and backend:

1. **Django settings** are configured for cross-origin cookies:
   - `CSRF_COOKIE_SAMESITE = "None"` — allows cookies across origins
   - `CSRF_TRUSTED_ORIGINS` includes `http://localhost:3000` — trusts the frontend origin
   - Both frontend and backend run on `localhost` during dev

2. **Frontend Axios client** (`client/src/lib/api.ts`):
   - Sends `withCredentials: true` to include session & CSRF cookies
   - Sets `xsrfCookieName: "csrftoken"` and `xsrfHeaderName: "X-CSRFToken"`
   - Fetches CSRF token from cookies or Zustand auth store as fallback

3. **After logout and re-login:**
   - Always call `GET /api/login/` to refresh the session and CSRF token
   - Zustand auth store is cleared on logout to prevent stale data
   - New session cookie is issued on successful `POST /api/login/`

## Permission Classes

### IsPropertyManager

Allows access only to Property Managers (`is_staff=True`).

### IsResident

Allows access only to Residents who are not Property Managers or Maintenance Staff.

### IsMaintenanceStaff

Allows access only to users in the `MaintenanceStaff` group.

### CanAccessRequest

Implements object-level permissions.

Rules:

- Property Managers can access all requests
- Maintenance Staff can only access assigned tasks
- Residents can only access requests they created

## Workflow Integrity

Maintenance Staff:

- Cannot assign tasks.
- Cannot access tasks assigned to others.
- Can only update status.

Residents:

- Cannot update or reassign requests.
- Cannot access other residents' requests.
- Can create a maintenance request.

All permissions are enforced server-side.

## Environment Variable Setup

Create the following environment variables for the server-side application:

- **DATABASE_NAME**: Name of the database.
- **DATABASE_USER**: Database username.
- **DATABASE_PASSWORD**: Password to your database.
- **DATABASE_HOST**: Postgres database host, e.g. 5432.
- **DATABASE_PORT**: Postgres database port.
- **SECRET_KEY**: Secret key generate by Django.
- **DEBUG** - This is a boolean value which should be set to **`False`** in production.

Create the following environment variables for the frontend application:

- **NEXT_PUBLIC_API_BASE_URL**: URL of the server-side application.

## API Endpoints

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | `/api/login/`                | Login                    |
| GET    | `/api/login/`                | View login JSON response |
| POST   | `/api/logout/`               | Logout                   |
| GET    | `/api/requests/`             | List accessible requests |
| POST   | `/api/requests/`             | Create request           |
| GET    | `/api/requests/{id}/`        | View single request      |
| PUT    | `/api/requests/{id}/`        | Update request           |
| DELETE | `/api/requests/{id}/`        | Delete request           |
| POST   | `/api/requests/{id}/assign/` | Assign request           |
| GET    | `/api/users/`                | View staff users only    |
| GET    | `/api/manager-users/`        | View all users           |

## Create Roles & Users

**First, you need to create the Super User**:

1. Navigate to the 'server' directory:

```bash
cd server
cd maintenance_dispatch
python manage.py createsuperuser
```

2. Django will prompt you for Username, Email address, Password, and Password (again).

3. After successful creation, you’ll see: "Superuser created successfully".

**To create other users**:

1. Access the shell from the terminal: `python manage.py shell`

2. Then writing the following Python code, line by line after the '**>>>**' symbol:

```Python
# This line must always be written first
from django.contrib.auth.models import User, Group

# Create a group for staff members
staff_group, _ = Group.objects.get_or_create(
    name="MaintenanceStaff"
)

# Create a manager user
manager = User.objects.create_user(
    username="manager",
    password="password",
    first_name="First",
    last_name="Last",
    email="email@example.com"
)

manager.is_staff = True
manager.save()

# Create a staff user
staff = User.objects.create_user(
    username="staff",
    password="password",
    first_name="First",
    last_name="Last",
    email="email@example.com"
)

# Add the staff member into the group
staff.groups.add(staff_group)

# Create a resident
resident = User.objects.create_user(
    username="resident",
    password="password",
    first_name="First",
    last_name="Last",
    email="email@example.com"
)
```

## Running the Application

### Installing the Frontend Next.js Application

```bash
cd client
npm install
```

Run the frontend application using: `npm run dev`. It should run at **http://localhost:3000**.

### Installing and Running the Backend Application

```bash
cd server
pip install
```

Next, activate the virtual environment: `venv\Scripts\activate`.

Then run the app using: `python manage.py runserver`. It runs at **http://localhost:8000**

### Running Server Side Tests

First activate the virtual environment using this command: `venv\Scripts\activate`.

Next, run the `pytest` command from the virtual environment. This runs the Pytest test suite located in the **/server/maintenance/tests.py** file.
