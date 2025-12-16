from django.db import models
from users.models import CustomUser
from django.utils import timezone
from django.conf import settings
import os
from django.db import models
from django.dispatch import receiver


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="اسم القسم")
    description = models.TextField(verbose_name="الوصف", blank=True, null=True)
    icon = models.FileField(upload_to='category_icons/', verbose_name="الأيقونة", blank=True, null=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='services')
    visits_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    # الصور
    cover_image = models.ImageField(upload_to='service_profile/', max_length=255, blank=True, null=True)  # مطلوب
    logo_image = models.ImageField(upload_to='service_logos/', max_length=255, blank=True, null=True)  # اختياري

    # الموقع
    # directorate = models.CharField(max_length=255)
    # street = models.CharField(max_length=255)
    # location_map = models.TextField(blank=True, null=True)  # يمكن تخزين إحداثيات أو رابط خريطة

    # التواصل
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    
    STATUS_CHOICES = [
        ('pending', 'قيد المراجعة'),
        ('approved', 'مقبولة'),
        ('rejected', 'مرفوضة'),
    ]
        
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title

class WorkSchedule(models.Model):
    DAYS = [
        ('السبت', 'السبت'),
        ('الأحد', 'الأحد'),
        ('الاثنين', 'الاثنين'),
        ('الثلاثاء', 'الثلاثاء'),
        ('الأربعاء', 'الأربعاء'),
        ('الخميس', 'الخميس'),
        ('الجمعة', 'الجمعة'),
    ]

    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='work_schedules')
    day = models.CharField(max_length=20, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('service', 'day')

    def __str__(self):
        return f"{self.service.title} - {self.day} من {self.start_time} إلى {self.end_time}"

class Product(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=0)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    photo = models.ImageField(upload_to="product_photos/")

    def __str__(self):
        return f"صورة لـ {self.product.name}"

class AdStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'
    EXPIRED = 'expired', 'Expired'  # حالة منطقية عند انتهاء المدة

class AdPackage(models.Model):
    name = models.CharField(max_length=50)              # باقة (يوم، يومين...)
    duration_days = models.PositiveIntegerField()       # المدة بالأيام
    price = models.PositiveIntegerField()               # السعر (للعرض فقط)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.duration_days} يوم - {self.price}"

class Ad(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ad')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='ads')
    image = models.ImageField(upload_to='ads/', null=True, blank=True)
    description = models.TextField(blank=True)
    package = models.ForeignKey(AdPackage, on_delete=models.PROTECT, related_name='ads')
    start_date = models.DateField()
    end_date = models.DateField()                       # يُحسب من الباقة عند الإنشاء
    status = models.CharField(max_length=20, choices=AdStatus.choices, default=AdStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ad #{self.id}"

    def is_active(self):
        from django.utils import timezone
        return self.status == AdStatus.APPROVED and self.start_date <= timezone.localdate() <= self.end_date

@receiver(models.signals.post_delete, sender=ProductImage)
def auto_delete_image_on_delete(sender, instance, **kwargs):
    if instance.photo:
        if os.path.isfile(instance.photo.path):
            os.remove(instance.photo.path)
