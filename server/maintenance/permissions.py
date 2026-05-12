from rest_framework.permissions import BasePermission

class IsPropertyManager(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_staff


class IsResident(BasePermission):

    def has_permission(self, request, view):
        return not request.user.is_staff and not request.user.groups.filter(
            name="MaintenanceStaff"
        ).exists()


class IsMaintenanceStaff(BasePermission):

    def has_permission(self, request, view):
        return request.user.groups.filter(
            name="MaintenanceStaff"
        ).exists()

    
class CanAccessRequest(BasePermission):

    def has_object_permission(self, request, view, obj):

        if request.user.is_staff:
            return True
        
        if request.user.groups.filter(name="MaintenanceStaff").exists():
            return obj.assigned_to == request.user
        
        return obj.resident == request.user