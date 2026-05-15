from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MaintenanceRequestViewSet,
    UserViewSet,
    LoginView,
    LogoutView
)

router = DefaultRouter()
router.register(
    r"requests",
    MaintenanceRequestViewSet,
    basename="requests"
)
router.register(
    r"users",
    UserViewSet,
    basename="users"
)

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('', include(router.urls)),
]