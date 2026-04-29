from django.db import models

class Room(models.Model):
    OCCUPANCY_CHOICES = [
        ('vacant', 'Vacant'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    ]
    room_number = models.CharField(max_length=10, unique=True)
    occupancy_status = models.CharField(max_length=20, choices=OCCUPANCY_CHOICES, default='vacant')
    is_balcony_room = models.BooleanField(default=False)

    def __str__(self):
        return f"Room {self.room_number}"

class Student(models.Model):
    DIETARY_CHOICES = [
        ('veg', 'Veg'),
        ('non_veg', 'Non-Veg'),
        ('vegan', 'Vegan'),
    ]
    name = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    sleep_schedule = models.CharField(max_length=100, help_text="e.g., Early Bird, Night Owl")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    dietary_preference = models.CharField(max_length=20, choices=DIETARY_CHOICES, default='veg')
    balcony_preference = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.course} (Year {self.year})"

class Complaint(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='complaints')
    category = models.CharField(max_length=100)
    description = models.TextField()
    
   
    priority_score = models.IntegerField(default=1, help_text="1 (Low) to 10 (Critical)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    timestamp = models.DateTimeField(auto_now_add=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )

   
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"[{self.status}] {self.category} - Priority: {self.priority_score}"