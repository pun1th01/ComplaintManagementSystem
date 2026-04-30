from rest_framework import serializers
from .models import Room, Bed, Student, Complaint

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class BedSerializer(serializers.ModelSerializer):
    student_occupant = StudentSerializer(read_only=True)
    class Meta:
        model = Bed
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    beds = BedSerializer(many=True, read_only=True)
    class Meta:
        model = Room
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), required=False)

    class Meta:
        model = Complaint
        fields = '__all__'
