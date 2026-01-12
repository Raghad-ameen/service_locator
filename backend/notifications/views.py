from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import get_user_notifications, open_notification

class NotificationList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            get_user_notifications(request.user.id)
        )


class NotificationOpen(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notif_id):
        open_notification(request.user.id, notif_id)
        return Response({"status": "opened"})
