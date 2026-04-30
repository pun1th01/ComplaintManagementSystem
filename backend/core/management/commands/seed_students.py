import random
from django.core.management.base import BaseCommand
from core.models import Room, Bed, Student

class Command(BaseCommand):
    help = 'Seed database with mock students for the recommendation engine'

    def handle(self, *args, **kwargs):
        courses = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business', 'Arts', 'Cybernetics']
        sleep_schedules = ['early', 'late']
        dietary_prefs = ['veg', 'non_veg', 'vegan']
        names = ['Alex', 'Brian', 'Charlie', 'David', 'Eva', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Luna', 'Mike', 'Nina', 'Oscar']

        # Get vacant beds
        vacant_beds = list(Bed.objects.filter(student_occupant__isnull=True))
        if not vacant_beds:
            self.stdout.write(self.style.ERROR('No vacant beds available to assign students. Please run seed_rooms first or free up beds.'))
            return

        random.shuffle(vacant_beds)
        num_to_create = min(15, len(vacant_beds))
        
        created_count = 0
        for i in range(num_to_create):
            name = f"{names[i]} {random.randint(100, 999)}"
            bed = vacant_beds[i]
            room = bed.room

            Student.objects.create(
                name=name,
                course=random.choice(courses),
                year=random.randint(1, 4),
                sleep_schedule=random.choice(sleep_schedules),
                dietary_preference=random.choice(dietary_prefs),
                balcony_preference=random.choice([True, False]),
                room=room,
                bed=bed
            )
            
            # Check room occupancy
            if room.beds.filter(student_occupant__isnull=False).count() >= 4:
                room.occupancy_status = 'occupied'
            else:
                room.occupancy_status = 'vacant'
            room.save()
                
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} mock students into random beds!'))
