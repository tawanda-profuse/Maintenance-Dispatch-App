from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MaintenanceRequest


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username"]


class MaintenanceRequestSerializer(serializers.ModelSerializer):

    resident = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)

    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="assigned_to",
        write_only=True,
        required=False
    )

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "title",
            "description",
            "resident",
            "assigned_to",
            "assigned_to_id",
            "status",
            "created_at"
        ]
        read_only_fields = [
            "resident",
            "created_at",
        ]

        def create(self, validated_data):
            validated_data["resident"] = self.context["request"].user
            return super().create(validated_data)