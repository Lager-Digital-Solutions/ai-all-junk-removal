from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from pathlib import Path
import os

from .models import QuoteRequest

def _remove_empty_parents(start_dir: Path, stop_at: Path):
    """
    Walk upward from start_dir and remove empty folders until stop_at (inclusive boundary not removed).
    Safe for local FileSystem storage. Does nothing if dirs are non-empty.
    """
    current = start_dir
    try:
        stop_at = stop_at.resolve()
    except Exception:
        return
    while True:
        try:
            # only remove if empty
            if current.exists() and current.is_dir() and not any(current.iterdir()):
                current.rmdir()
            else:
                break
        except Exception:
            break
        if current == stop_at:
            break
        current = current.parent

@shared_task
def purge_quotes(older_than_days=None, older_than_minutes=None):
    """
    Delete QuoteRequest rows (and their image files via signals) ONLY if they're older than the cutoff.
    Age can be provided in days and/or minutes (both supported; they'll be added).
    After deletion, clean up any now-empty date folders under MEDIA_ROOT/quotes/.

    Example kwargs for django-celery-beat:
    {"older_than_days": 3}
    or
    {"older_than_minutes": 120}
    or
    {"older_than_days": 1, "older_than_minutes": 30}
    """
    # Build cutoff
    delta = timedelta(0)
    if older_than_days is not None:
        delta += timedelta(days=int(older_than_days))
    if older_than_minutes is not None:
        delta += timedelta(minutes=int(older_than_minutes))
    if delta.total_seconds() <= 0:
        # no-op if no valid age provided
        return {"deleted": 0, "reason": "no_cutoff_provided"}

    cutoff = timezone.now() - delta

    # Filter by age and delete
    qs = QuoteRequest.objects.filter(created_at__lte=cutoff).only("id", "image", "created_at")
    # Collect candidate directories to prune after deletion (local FS only)
    dirs_to_check = set()

    deleted = 0
    for obj in qs.iterator():
        # remember folder paths for pruning (local FileSystemStorage only)
        try:
            if obj.image and hasattr(obj.image, "path"):
                dirs_to_check.add(Path(obj.image.path).parent)
        except Exception:
            pass
        obj.delete()  # signals remove files
        deleted += 1

    # Prune empty folders under MEDIA_ROOT/quotes
    try:
        media_root = Path(getattr(settings, "MEDIA_ROOT", ""))
        quotes_root = media_root / "quotes"
        if media_root and quotes_root.exists():
            for d in list(dirs_to_check):
                # only prune within quotes_root
                try:
                    d_resolved = d.resolve()
                    if str(d_resolved).startswith(str(quotes_root.resolve())):
                        _remove_empty_parents(d_resolved, quotes_root)
                except Exception:
                    continue
    except Exception:
        pass

    return {"deleted": deleted}
