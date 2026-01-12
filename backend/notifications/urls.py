from django.urls import path
from .views import NotificationList, NotificationOpen

urlpatterns = [
    path("", NotificationList.as_view()),
    path("<str:notif_id>/open/", NotificationOpen.as_view()),
]
