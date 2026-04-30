from django.core.management.base import BaseCommand
from core.models import Room, Bed

class Command(BaseCommand):
    help = 'Seeds initial hostel rooms and bunks (decks) to test AI matching'

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting old rooms and beds...")
        Room.objects.all().delete()
        Bed.objects.all().delete()

        blocks = ['A', 'B']
        self.stdout.write("Seeding real rooms and beds...")

        for block in blocks:
            for floor in range(1, 4):
                for rn in range(1, 6):
                    room_str = f"{block}-{floor}0{rn}"
                    room = Room.objects.create(
                        room_number=room_str,
                        occupancy_status='vacant',
                        capacity=4,
                        is_balcony_room=(rn % 2 == 0)
                    )

                    # Create 4 Beds - 2 Lower, 2 Upper
                    Bed.objects.create(room=room, bed_number='1', deck='Lower')
                    Bed.objects.create(room=room, bed_number='2', deck='Lower')
                    Bed.objects.create(room=room, bed_number='3', deck='Upper')
                    Bed.objects.create(room=room, bed_number='4', deck='Upper')

        self.stdout.write(self.style.SUCCESS("Successfully seeded 30 Rooms. Each has 4 bunks (Lower/Upper)"))
