from django.db import models

class Tag(models.Model):
    tag_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ServiceTag(models.Model):
    service_tag_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='service_tags')
    tag = models.ForeignKey('tags.Tag', on_delete=models.CASCADE, related_name='service_links')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('service', 'tag'),)
