from django.core.management.base import BaseCommand
from core.models import Complaint
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Escalates priority for complaints older than 48 hours.'

    def handle(self, *args, **kwargs):
        # Calculate the threshold time (48 hours ago)
        threshold_time = timezone.now() - timedelta(hours=48)
        
        try:
            complaints_to_escalate = Complaint.objects.exclude(status='Resolved').filter(
                timestamp__lt=threshold_time
            )
            
            count = 0
            for complaint in complaints_to_escalate:
                old_score = complaint.priority_score
                complaint.priority_score = min(10, complaint.priority_score + 2)
                complaint.save()
                count += 1
            
            self.stdout.write(self.style.SUCCESS(f'Successfully escalated {count} complaints.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error escalating complaints: {e}'))
