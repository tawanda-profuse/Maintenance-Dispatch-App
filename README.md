# Maintenance Dispatch Portal

A functional mini-portal where Property Managers can manage and assign maintenance
tasks.

## Authentication

This project uses Django Session Authentication. After login, Django creates a secure session cookie that is automatically sent by the browser on future requests. Frontend requests must include **credentials: "include"** to allow browser cookies to be sent.

## CSRF Protection

Django CSRF middleware is enabled. The frontend reads the csrftoken cookie and sends it using the X-CSRFToken header for all unsafe HTTP methods: POST, PUT, PATCH, DELETE. This prevents CSRF attacks while maintaining secure cookie-based authentication.

## Permission Classes

### CanAccessRequest

Implements object-level permissions.

Rules:

- Property Managers can access all requests
- Maintenance Staff can only access assigned tasks
- Residents can only access requests they created

## Workflow Integrity

Maintenance Staff:

- Cannot assign tasks
- Cannot access tasks assigned to others
- Can only update status

Residents:

- Cannot update or reassign requests
- Cannot access other residents' requests

All permissions are enforced server-side.

## Environment Variable Setup

Create the following environment variables:

- **DATABASE_NAME**
- **DATABASE_USER**
- **DATABASE_PASSWORD**
- **DATABASE_HOST**
- **DATABASE_PORT**
- **SECRET_KEY**
- **DEBUG** - This is a boolean value which should be set to **`False`** in production.

## API Endpoints

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | `/api/login/`                | Login                    |
| POST   | `/api/logout/`               | Logout                   |
| GET    | `/api/requests/`             | List accessible requests |
| POST   | `/api/requests/`             | Create request           |
| GET    | `/api/requests/{id}/`        | View single request      |
| PUT    | `/api/requests/{id}/`        | Update request           |
| POST   | `/api/requests/{id}/assign/` | Assign request           |
| GET    | `/api/users/`                | Assign request           |

## Create Roles & Users

**First, you need to create the Super User**:

1. Navigate to the server directory: 

```bash
cd server
cd maintenance_dispatch
python manage.py createsuperuser
```

2. Django will prompt you for Username Email address, Password, and Password (again).

3. After successful creation, you’ll see: "Superuser created successfully".

**To create other users**:

1. From the terminal: `python manage.py shell`

2. Then writing the following Python code after the '**>>>**' symbol:

```Python
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
