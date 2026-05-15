import pytest

from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient

from maintenance.models import MaintenanceRequest


pytestmark = pytest.mark.django_db


# =========================
# Fixtures
# =========================

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def maintenance_group():
    group, _ = Group.objects.get_or_create(name="MaintenanceStaff")
    return group


@pytest.fixture
def resident_user():
    return User.objects.create_user(
        username="resident",
        password="password123"
    )


@pytest.fixture
def manager_user():
    return User.objects.create_user(
        username="manager",
        password="password123",
        is_staff=True
    )


@pytest.fixture
def staff_user(maintenance_group):
    user = User.objects.create_user(
        username="staff",
        password="password123"
    )
    user.groups.add(maintenance_group)
    return user


@pytest.fixture
def another_staff_user(maintenance_group):
    user = User.objects.create_user(
        username="staff2",
        password="password123"
    )
    user.groups.add(maintenance_group)
    return user


@pytest.fixture
def maintenance_request(resident_user):
    return MaintenanceRequest.objects.create(
        title="Broken Pipe",
        description="Kitchen sink leaking",
        resident=resident_user,
        status="Pending"
    )


# =========================
# Authentication Tests
# =========================

def test_login_success(api_client, resident_user):
    response = api_client.post(
        "/api/login/",
        {
            "username": "resident",
            "password": "password123"
        },
        format="json"
    )

    assert response.status_code == 200
    assert response.data["message"] == "Logged in successfully"
    assert response.data["user"]["username"] == "resident"


def test_login_invalid_credentials(api_client):
    response = api_client.post(
        "/api/login/",
        {
            "username": "wrong",
            "password": "wrong"
        },
        format="json"
    )

    assert response.status_code == 401
    assert response.data["error"] == "Invalid credentials"


def test_logout(api_client, resident_user):
    api_client.force_authenticate(user=resident_user)

    response = api_client.post("/api/logout/")

    assert response.status_code == 200
    assert response.data["message"] == "Logged out successfully"


# =========================
# Request CRUD Tests
# =========================

def test_resident_can_create_request(api_client, resident_user):
    api_client.force_authenticate(user=resident_user)

    response = api_client.post(
        "/api/requests/",
        {
            "title": "Broken Door",
            "description": "Front door damaged"
        },
        format="json"
    )

    assert response.status_code == 201
    assert response.data["title"] == "Broken Door"


def test_resident_sees_only_own_requests(
    api_client,
    resident_user
):
    MaintenanceRequest.objects.create(
        title="Request 1",
        description="Test",
        resident=resident_user
    )

    another_user = User.objects.create_user(
        username="another",
        password="password123"
    )

    MaintenanceRequest.objects.create(
        title="Request 2",
        description="Test",
        resident=another_user
    )

    api_client.force_authenticate(user=resident_user)

    response = api_client.get("/api/requests/")

    assert response.status_code == 200
    assert len(response.data) == 1


def test_manager_sees_all_requests(
    api_client,
    manager_user,
    resident_user
):
    MaintenanceRequest.objects.create(
        title="Request 1",
        description="Test",
        resident=resident_user
    )

    another_user = User.objects.create_user(
        username="another",
        password="password123"
    )

    MaintenanceRequest.objects.create(
        title="Request 2",
        description="Test",
        resident=another_user
    )

    api_client.force_authenticate(user=manager_user)

    response = api_client.get("/api/requests/")

    assert response.status_code == 200
    assert len(response.data) == 2


def test_staff_sees_only_assigned_requests(
    api_client,
    staff_user,
    resident_user
):
    assigned_request = MaintenanceRequest.objects.create(
        title="Assigned",
        description="Assigned task",
        resident=resident_user,
        assigned_to=staff_user
    )

    MaintenanceRequest.objects.create(
        title="Unassigned",
        description="Not assigned",
        resident=resident_user
    )

    api_client.force_authenticate(user=staff_user)

    response = api_client.get("/api/requests/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["id"] == assigned_request.id


# =========================
# Assignment Tests
# =========================

def test_manager_can_assign_task(
    api_client,
    manager_user,
    staff_user,
    maintenance_request
):
    api_client.force_authenticate(user=manager_user)

    response = api_client.post(
        f"/api/requests/{maintenance_request.id}/assign/",
        {
            "assigned_to_id": staff_user.id
        },
        format="json"
    )

    maintenance_request.refresh_from_db()

    assert response.status_code == 200
    assert maintenance_request.assigned_to == staff_user
    assert maintenance_request.status == "In Progress"


def test_resident_cannot_assign_task(
    api_client,
    resident_user,
    staff_user,
    maintenance_request
):
    api_client.force_authenticate(user=resident_user)

    response = api_client.post(
        f"/api/requests/{maintenance_request.id}/assign/",
        {
            "assigned_to_id": staff_user.id
        },
        format="json"
    )

    assert response.status_code == 403


def test_cannot_assign_non_staff_user(
    api_client,
    manager_user,
    resident_user,
    maintenance_request
):
    api_client.force_authenticate(user=manager_user)

    response = api_client.post(
        f"/api/requests/{maintenance_request.id}/assign/",
        {
            "assigned_to_id": resident_user.id
        },
        format="json"
    )

    assert response.status_code == 400
    assert response.data["error"] == "User is not maintenance staff"


# =========================
# Update Permission Tests
# =========================

def test_assigned_staff_can_update_status(
    api_client,
    staff_user,
    maintenance_request
):
    maintenance_request.assigned_to = staff_user
    maintenance_request.save()

    api_client.force_authenticate(user=staff_user)

    response = api_client.patch(
        f"/api/requests/{maintenance_request.id}/",
        {
            "status": "Completed"
        },
        format="json"
    )

    assert response.status_code == 200

    maintenance_request.refresh_from_db()

    assert maintenance_request.status == "Completed"


def test_staff_cannot_update_other_fields(
    api_client,
    staff_user,
    maintenance_request
):
    maintenance_request.assigned_to = staff_user
    maintenance_request.save()

    api_client.force_authenticate(user=staff_user)

    response = api_client.patch(
        f"/api/requests/{maintenance_request.id}/",
        {
            "title": "New Title"
        },
        format="json"
    )

    assert response.status_code == 403
    assert (
        response.data["error"]
        == "Maintenance staff can only update status"
    )


def test_unassigned_staff_cannot_update_request(
    api_client,
    another_staff_user,
    maintenance_request
):
    api_client.force_authenticate(user=another_staff_user)

    response = api_client.patch(
        f"/api/requests/{maintenance_request.id}/",
        {
            "status": "Completed"
        },
        format="json"
    )

    assert response.status_code == 403


# =========================
# Delete Permission Tests
# =========================

def test_manager_can_delete_request(
    api_client,
    manager_user,
    maintenance_request
):
    api_client.force_authenticate(user=manager_user)

    response = api_client.delete(
        f"/api/requests/{maintenance_request.id}/"
    )

    assert response.status_code == 204


def test_resident_cannot_delete_request(
    api_client,
    resident_user,
    maintenance_request
):
    api_client.force_authenticate(user=resident_user)

    response = api_client.delete(
        f"/api/requests/{maintenance_request.id}/"
    )

    assert response.status_code == 403


# =========================
# UserViewSet Tests
# =========================

def test_user_viewset_returns_only_staff_users(
    api_client,
    manager_user,
    staff_user,
    resident_user
):
    api_client.force_authenticate(user=manager_user)

    response = api_client.get("/api/users/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["username"] == "staff"