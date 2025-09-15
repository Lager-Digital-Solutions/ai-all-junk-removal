from django.db import models
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.conf import settings          
from pathlib import Path   

# Create your models here.


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


def _prune_parent_dirs_if_empty(image_field):
    try:
        # Only for local filesystem where .path is available
        if not image_field or not hasattr(image_field, "path"):
            return
        img_path = Path(image_field.path)
        if not img_path.exists():
            parent = img_path.parent
        else:
            # If file exists (unlikely right after delete), use its parent anyway
            parent = img_path.parent
        media_root = Path(getattr(settings, "MEDIA_ROOT", ""))
        quotes_root = media_root / "quotes"
        # Climb up removing empty dirs until quotes_root (not removing quotes_root itself)
        current = parent
        while True:
            if current.exists() and current.is_dir() and not any(current.iterdir()):
                current.rmdir()
            else:
                break
            if current == quotes_root:
                break
            current = current.parent
    except Exception:
        # best-effort
        pass

@receiver(post_delete, sender=QuoteRequest)
def delete_file_on_row_delete(sender, instance, **kwargs):
    if instance.image:
        # delete the file
        instance.image.delete(save=False)
        # and prune empty folders
        _prune_parent_dirs_if_empty(instance.image)

@receiver(pre_save, sender=QuoteRequest)
def delete_old_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = QuoteRequest.objects.get(pk=instance.pk)
    except QuoteRequest.DoesNotExist:
        return
    old_file = getattr(old, "image", None)
    new_file = getattr(instance, "image", None)
    if old_file and old_file != new_file:
        old_file.delete(save=False)