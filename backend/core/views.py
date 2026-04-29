from rest_framework import viewsets
from .models import Room, Student, Complaint
from .serializers import RoomSerializer, StudentSerializer, ComplaintSerializer
from .ai_utils import categorize_complaint

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer

    def perform_create(self, serializer):
        description = serializer.validated_data.get('description', '')
        
        # Trigger the AI script for description text
        if description:
            ai_data = categorize_complaint(description)
            # Inject category and priority_score from AI into the save logic
            serializer.save(
                category=ai_data.get('category', 'General'), 
                priority_score=ai_data.get('priority_score', 1)
            )
        else:
            serializer.save()
