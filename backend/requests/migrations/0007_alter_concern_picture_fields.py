# Generated migration to fix concern_picture field size

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0005_customrequest_estimated_budget'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customrequest',
            name='concern_picture',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='emergencyrequest',
            name='concern_picture',
            field=models.TextField(blank=True, null=True),
        ),
    ]
