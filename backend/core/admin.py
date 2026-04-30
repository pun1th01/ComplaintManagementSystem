from django.contrib import admin
from .models import Room, Bed, Student, Complaint

# Register your models here.
admin.site.register(Room)
admin.site.register(Bed)
admin.site.register(Student)
admin.site.register(Complaint)
