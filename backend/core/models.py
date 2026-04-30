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
    capacity = models.IntegerField(default=4)

    def __str__(self):
        return f"Room {self.room_number}"

class Bed(models.Model):
    DECK_CHOICES = [
        ('Lower', 'Lower Deck'),
        ('Upper', 'Upper Deck'),
    ]
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=10) # eg. "1", "2"
    deck = models.CharField(max_length=10, choices=DECK_CHOICES, default='Lower')

    def __str__(self):
        return f"{self.room.room_number} - {self.deck} {self.bed_number}"

class Student(models.Model):
    DIETARY_CHOICES = [
        ('veg', 'Veg'),
        ('non_veg', 'Non-Veg'),
        ('vegan', 'Vegan'),
    ]
    name = models.CharField(max_length=100, unique=True)
    course = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    sleep_schedule = models.CharField(max_length=100, help_text="e.g., Early Bird, Night Owl")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    bed = models.OneToOneField(Bed, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_occupant')
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    priority_score = models.IntegerField(default=1, help_text="1 (Low) to 10 (Critical)")
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='complaints/', null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_staff = models.CharField(max_length=100, default="Unassigned")
    ai_summary = models.TextField(null=True, blank=True)

    def _str_(self):
        return f"[{self.status}] {self.category} - Priority: {self.priority_score}"