from django.db import models

# Create your models here.
from django.db import models

class QuoteRequest(models.Model):
    SERVICE_RESIDENTIAL = "residential"
    SERVICE_COMMERCIAL = "commercial"
    SERVICE_CONSTRUCTION = "construction"
    SERVICE_ECO = "eco-friendly"

    SERVICE_CHOICES = [
        (SERVICE_RESIDENTIAL, "Residential Cleanout"),
        (SERVICE_COMMERCIAL, "Commercial Service"),
        (SERVICE_CONSTRUCTION, "Construction Debris"),
        (SERVICE_ECO, "Eco-Friendly Disposal"),
    ]

    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    service_address = models.CharField(max_length=255)
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    description = models.TextField()
    image = models.ImageField(
        upload_to="quotes/%Y/%m/",
        blank=True,
        null=True,
        help_text="Optional: upload a photo of the junk."
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} • {self.get_service_type_display()} • {self.created_at:%Y-%m-%d}"
