from django.db import models

class Rating(models.Model):
    rating_id = models.AutoField(primary_key=True)
    request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='ratings')
    rater = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='given_ratings')
    stars = models.PositiveSmallIntegerField()
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
