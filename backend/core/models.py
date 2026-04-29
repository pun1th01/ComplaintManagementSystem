from django.db import models

class Room(models.Model):
    OCCUPANCY_CHOICES = [
        ('vacant', 'Vacant'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    ]
    room_number = models.CharField(max_length=10, unique=True)
    occupancy_status = models.CharField(max_length=20, choices=OCCUPANCY_CHOICES, default='vacant')

    def __str__(self):
        return f"Room {self.room_number}"

class Student(models.Model):
    name = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    sleep_schedule = models.CharField(max_length=100, help_text="e.g., Early Bird, Night Owl")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    def __str__(self):
        return f"{self.name} - {self.course} (Year {self.year})"

class Complaint(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='complaints')
    category = models.CharField(max_length=100)
    description = models.TextField()
    priority_score = models.IntegerField(default=1, help_text="1 (Low) to 5 (High)")
    timestamp = models.DateTimeField(auto_now_add=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"Complaint: {self.category} by {self.student.name}"
