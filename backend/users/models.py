from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator 
from django.conf import settings
# Create your models here.
def default_profile_image():
    return 'user_profile/default.png' #defualt image path

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=9, unique=True, validators=[ RegexValidator( regex=r'^7\d{8}$',message="رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 9 أرقام")])
    profile_image = models.ImageField(upload_to='user_profile/', default=default_profile_image, blank=True, null=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    USER_TYPES = (
        ('admin', 'مشرف'),
        ('user', 'مستخدم عادي'),
        ('owner', 'صاحب خدمة'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='user')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone']
    def __str__(self):
        return self.email if self.email else self.phone

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"إشعار لـ {self.user.username}: {self.message[:30]}"
    
    from django.db import models

class Suggestion(models.Model):
    service = models.ForeignKey("services.Service", on_delete=models.CASCADE, related_name="suggestions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # ← هذا هو الصحيح
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    response = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.message[:30]}"

