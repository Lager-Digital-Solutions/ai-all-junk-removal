from django import forms
from .models import QuoteRequest

class QuoteRequestForm(forms.ModelForm):
    class Meta:
        model = QuoteRequest
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "service_address",
            "service_type",
            "description",
            "image",
        ]
        widgets = {
            "first_name": forms.TextInput(attrs={"placeholder": "First Name", "required": True}),
            "last_name": forms.TextInput(attrs={"placeholder": "Last Name", "required": True}),
            "email": forms.EmailInput(attrs={"placeholder": "Email Address", "required": True}),
            "phone": forms.TextInput(attrs={"placeholder": "Phone Number"}),
            "service_address": forms.TextInput(attrs={"placeholder": "Service Address", "required": True}),
            "service_type": forms.Select(attrs={"required": True}),
            "description": forms.Textarea(attrs={"placeholder": "Describe your junk removal needs...", "rows": 4, "required": True}),
        }

    def clean_image(self):
        img = self.cleaned_data.get("image")
        if not img:
            return img
        # Size limit ~5 MB
        max_bytes = 5 * 1024 * 1024
        if img.size > max_bytes:
            raise forms.ValidationError("Image too large. Max size is 5 MB.")
        # Basic type guard
        valid_exts = (".jpg", ".jpeg", ".png", ".webp", ".gif")
        name = (img.name or "").lower()
        if not any(name.endswith(ext) for ext in valid_exts):
            raise forms.ValidationError("Unsupported image type. Use JPG, PNG, WEBP, or GIF.")
        return img
