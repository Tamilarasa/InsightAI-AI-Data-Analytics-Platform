from rest_framework import serializers
from .models import CustomUser
from .models import UploadedFile

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = CustomUser

        fields = [
            "id",
            "username",
            "email",
            "company_name",
            "password"
        ]

    def create(self, validated_data):

        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            company_name=validated_data.get(
                "company_name", ""
            ),
            password=validated_data["password"]
        )

        return user


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = [
            "id",
            "username",
            "email",
            "company_name"
        ]

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = "__all__"