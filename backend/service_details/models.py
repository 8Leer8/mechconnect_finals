from django.db import models
from booking.models import BackJobsBooking, RescheduledBooking
from requests.models import DirectRequest, CustomRequest

class ServiceLocation(models.Model):
    service_location_id = models.AutoField(primary_key=True)

    back_jobs = models.ForeignKey(BackJobsBooking, on_delete=models.CASCADE, null=True, blank=True, related_name='locations')
    reschedule = models.ForeignKey(RescheduledBooking, on_delete=models.CASCADE, null=True, blank=True, related_name='locations')
    direct_request = models.ForeignKey(DirectRequest, on_delete=models.CASCADE, null=True, blank=True, related_name='locations')
    custom_request = models.ForeignKey(CustomRequest, on_delete=models.CASCADE, null=True, blank=True, related_name='locations')

    street_name = models.CharField(max_length=255)
    subdivision_village = models.CharField(max_length=255)
    barangay = models.CharField(max_length=255)
    city_municipality = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    landmark = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        parts = [self.street_name, self.subdivision_village, self.barangay, self.city_municipality]
        return ", ".join([p for p in parts if p])


class ServiceTime(models.Model):
    service_time_id = models.AutoField(primary_key=True)

    back_jobs = models.ForeignKey(BackJobsBooking, on_delete=models.CASCADE, null=True, blank=True, related_name='times')
    reschedule = models.ForeignKey(RescheduledBooking, on_delete=models.CASCADE, null=True, blank=True, related_name='times')
    direct_request = models.ForeignKey(DirectRequest, on_delete=models.CASCADE, null=True, blank=True, related_name='times')
    custom_request = models.ForeignKey(CustomRequest, on_delete=models.CASCADE, null=True, blank=True, related_name='times')

    is_urgent = models.BooleanField(default=False)
    date = models.DateField()
    time = models.TimeField()

    def __str__(self):
        return f"{self.date} {self.time}"
