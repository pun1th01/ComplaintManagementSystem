from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Student, Complaint
from .serializers import RoomSerializer, StudentSerializer, ComplaintSerializer
from .ai_utils import match_roommates, categorize_complaint

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

@api_view(['POST'])
def get_recommended_rooms(request):
    """
    Accepts a JSON payload with student preferences and returns the top 3 recommended rooms
    based on the current roommates in those rooms.
    """
    target_student_dict = request.data
    
    # We evaluate available students (students currently in rooms) to match preferences
    # and map the recommendation back to their rooms.
    available_students = Student.objects.filter(room__isnull=False)
    serializer = StudentSerializer(available_students, many=True)
    available_students_list = serializer.data
    
    # Run the matching algorithm
    matches = match_roommates(target_student_dict, available_students_list)
    
    # Get top 3 matches
    top_matches = matches[:3]
    
    return Response(top_matches, status=status.HTTP_200_OK)
