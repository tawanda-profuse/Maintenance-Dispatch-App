from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import MaintenanceRequest
from .serializers import MaintenanceRequestSerializer, UserSerializer
from .permissions import ( CanAccessRequest, IsPropertyManager)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class LoginView(APIView):

    permission_classes = []

    def get(self, request):
        csrf_token = get_token(request)
        response_data = {"csrf_token": csrf_token}

        if request.user.is_authenticated:
            role = "Resident"
            if request.user.is_staff:
                role = "Property Manager"
            elif request.user.groups.filter(name="MaintenanceStaff").exists():
                role = "Maintenance Staff"

            response_data["user"] = {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "role": role,
            }

        return Response(response_data)

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=401
            )
        
        login(request, user)

        csrf_token = get_token(request)
        role = "Resident"
        if user.is_staff:
            role = "Property Manager"
        elif user.groups.filter(name="MaintenanceStaff").exists():
            role = "Maintenance Staff"

        return Response({
            "message": "Logged in successfully",
            "csrf_token": csrf_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": role,
            },
        })
    

@method_decorator(ensure_csrf_cookie, name="dispatch")
class LogoutView(APIView):

    permission_classes = []

    def post(self, request):
        logout(request)

        return Response({
            "message": "Logged out successfully"
        })

class MaintenanceRequestViewSet(viewsets.ModelViewSet):

    serializer_class = MaintenanceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAuthenticated(), IsPropertyManager()]

        if self.action in ["retrieve", "update", "partial_update"]:
            return [IsAuthenticated(), CanAccessRequest()]

        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return MaintenanceRequest.objects.all()
        
        if user.groups.filter(name="MaintenanceStaff").exists():
            return MaintenanceRequest.objects.filter(
                assigned_to=user
            )
        
        return MaintenanceRequest.objects.filter(
            resident=user
        )
    
    def perform_create(self, serializer):
        serializer.save(resident=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        if not (user.is_staff or instance.resident == user):
            return Response(
                {"error": "You don't have permission to update this request"},
                status=403
            )
        
        if user.groups.filter(name="MaintenanceStaff").exists():
            allowed_fields = set(request.data.keys())
            if allowed_fields - {"status"}:
                return Response(
                    {"error": "Maintenance staff can only update status"},
                    status=403
                )
        
        return super().update(request, *args, **kwargs)
    
    @action(
        detail=True,
        methods=["POST"],
        permission_classes=[IsAuthenticated, IsPropertyManager]
    )
    def assign(self, request, pk=None):

        maintenance_request = self.get_object()

        if maintenance_request.status != "Pending":
            return Response(
                {"error": "Only pending requests can be assigned"},
                status=400
            )
        
        user_id = request.data.get("assigned_to_id")

        try:
            staff_user = User.objects.get(id=user_id)

            if not staff_user.groups.filter(
                name="MaintenanceStaff"
            ).exists():
                return Response(
                    {"error": "User is not maintenance staff"},
                    status=400
                )
            
            maintenance_request.assigned_to = staff_user
            maintenance_request.status = "In Progress"
            maintenance_request.save()

            return Response({
                "message": "Task assigned successfully"
            })
        
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=404
            )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only maintenance staff users for assignment
        return User.objects.filter(
            groups__name="MaintenanceStaff"
        ).distinct()



