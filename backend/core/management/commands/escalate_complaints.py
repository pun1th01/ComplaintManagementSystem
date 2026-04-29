from django.core.management.base import BaseCommand
from core.models import Complaint
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Escalates priority for complaints older than 48 hours.'

    def handle(self, *args, **kwargs):
        # Calculate the threshold time (48 hours ago)
        threshold_time = timezone.now() - timedelta(hours=48)
        
        # Note: Assuming the status field exists on the Complaint model. 
        # If it doesn't, this will throw an error and you will need to add it to models.py
        # and create a migration or adapt this query if the field is named differently.
        try:
            complaints_to_escalate = Complaint.objects.exclude(status='Resolved').filter(
                timestamp__lt=threshold_time
            )
            
            escalated_count = 0
            
            for complaint in complaints_to_escalate:
                if complaint.priority_score < 10:
                    escalated_score = min(complaint.priority_score + 2, 10)
                    complaint.priority_score = escalated_score
                    complaint.save()
                    escalated_count += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'Successfully escalated {escalated_count} neglected complaint(s).'
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error escalating complaints: {str(e)}'))
