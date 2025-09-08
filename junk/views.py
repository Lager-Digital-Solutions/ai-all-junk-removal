from django.shortcuts import render


from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from .forms import QuoteRequestForm

# Create your views here.

def index(request):
    """
    GET  -> render the landing page
    POST -> process the quote form submitted from the modal on this same page
    """
    form = QuoteRequestForm()

    # Only treat POSTs with our hidden marker as the quote form
    if request.method == "POST" and request.POST.get("_form") == "quote":
        form = QuoteRequestForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()

            # If submitted via fetch/XHR, return JSON (no redirect)
            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                return JsonResponse({"ok": True, "message": "Thanks! We’ll contact you shortly."})

            messages.success(request, "Thanks! We’ll contact you shortly.")
            return redirect("index")

        # Invalid form
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse({"ok": False, "errors": form.errors}, status=400)
        messages.error(request, "Please correct the errors and try again.")

    # Render page (on GET or invalid POST fallback)
    return render(request, "junk/index.html", {"quote_form": form})
