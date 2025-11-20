from django.db import models

class ServiceLocation(models.Model):
    service_location_id = models.AutoField(primary_key=True)
    back_jobs = models.ForeignKey('bookings.BackJobsBooking', on_delete=models.CASCADE, null=True, blank=True, related_name='service_locations')
    reschedule = models.ForeignKey('bookings.RescheduledBooking', on_delete=models.CASCADE, null=True, blank=True, related_name='service_locations')
    direct_request = models.ForeignKey('requests.DirectRequest', on_delete=models.CASCADE, null=True, blank=True, related_name='service_locations')
    custom_request = models.ForeignKey('requests.CustomRequest', on_delete=models.CASCADE, null=True, blank=True, related_name='service_locations')

    street_name = models.CharField(max_length=255, null=True, blank=True)
    subdivision_village = models.CharField(max_length=255, null=True, blank=True)
    barangay = models.CharField(max_length=255, null=True, blank=True)
    city_municipality = models.CharField(max_length=255, null=True, blank=True)
    province = models.CharField(max_length=255, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    landmark = models.CharField(max_length=255, null=True, blank=True)


class ServiceTime(models.Model):
    service_time_id = models.AutoField(primary_key=True)
    back_jobs = models.ForeignKey('bookings.BackJobsBooking', on_delete=models.CASCADE, null=True, blank=True, related_name='service_times')
    reschedule = models.ForeignKey('bookings.RescheduledBooking', on_delete=models.CASCADE, null=True, blank=True, related_name='service_times')
    direct_request = models.ForeignKey('requests.DirectRequest', on_delete=models.CASCADE, null=True, blank=True, related_name='service_times')
    custom_request = models.ForeignKey('requests.CustomRequest', on_delete=models.CASCADE, null=True, blank=True, related_name='service_times')

    is_urgent = models.BooleanField(default=False)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
