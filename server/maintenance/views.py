from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group

from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import MaintenanceRequest
from .serializers import MaintenanceRequestSerializer
from .permissions import (
    CanAccessRequest,
    IsPropertyManager,
    IsMaintenanceStaff
)


class LoginView(APIView):

    permission_classes = []

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

        return Response({
            "message": "Logged in successfully"
        })
    

class LogoutView(APIView):

    def post(self, request):
        logout(request)

        return Response({
            "message": "Logged out successfully"
        })
    

class MaintenanceRequestViewSet(viewsets.ModelViewSet):

    serializer_class = MaintenanceRequestSerializer
    permission_classes = [IsAuthenticated, CanAccessRequest]

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

        # Maintenance staff can only update status
        if user.groups.filter(name="MaintenanceStaff").exists():

            allowed_status = request.data.get("status")

            if not allowed_status:
                return Response(
                    {"error": "Only status updates allowed"},
                    status=403
                )
            
            instance.status = allowed_status
            instance.save()

            serializer = self.get_serializer(instance)

            return Response(serializer.data)
        
        # Resident cannot update requests
        if not user.is_staff:
            return Response(
                {"error": "Residents cannot modify requests"},
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



