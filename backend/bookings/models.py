from django.db import models
from requests.models import DirectRequest

class BackJobsBooking(models.Model):
    back_jobs_id = models.AutoField(primary_key=True)
    request = models.ForeignKey(DirectRequest, on_delete=models.CASCADE, related_name='back_jobs')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"BackJobsBooking {self.back_jobs_id} for Request {self.request_id}"


class RescheduledBooking(models.Model):
    reschedule_id = models.AutoField(primary_key=True)
    request = models.ForeignKey(DirectRequest, on_delete=models.CASCADE, related_name='reschedules')
    reason = models.TextField()
    requested_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reschedule {self.reschedule_id} for Request {self.request_id}"
