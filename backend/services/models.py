from django.db import models
from users.models import CustomUser
from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="اسم القسم")
    description = models.TextField(verbose_name="الوصف", blank=True, null=True)
    icon = models.FileField(upload_to='category_icons/', verbose_name="الأيقونة", blank=True, null=True)

    def __str__(self):
        return self.name

class Directorate(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="اسم المديرية")

    def __str__(self):
        return self.name

class Street(models.Model):
    name = models.CharField(max_length=255, verbose_name="اسم الشارع")
    directorate = models.ForeignKey(Directorate, on_delete=models.CASCADE, related_name="streets")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("name", "directorate")

    def __str__(self):
        return f"{self.name} - {self.directorate.name}"

class Service(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='services')
    visits_count = models.PositiveIntegerField(default=0)
    # الصور
    cover_image = models.ImageField(upload_to='service_profile/', max_length=255, blank=True, null=True)  # مطلوب
    logo_image = models.ImageField(upload_to='service_logos/', max_length=255, blank=True, null=True)  # اختياري
    directorate = models.ForeignKey(Directorate, on_delete=models.SET_NULL, null=True, related_name="services")
    street = models.ForeignKey(Street, on_delete=models.SET_NULL, null=True, related_name="services")
    latitude = models.FloatField(null=True, blank=True) 
    longitude = models.FloatField(null=True, blank=True)
    # التواصل
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
    @property
    def likes_count(self):
        # احسب عدد الإعجابات من جدول Favorite
        return self.favorited_by.count()

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
    EXPIRED = 'expired', 'Expired'   # حالة منطقية عند انتهاء المدة

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
    end_date = models.DateField()       
    status = models.CharField(max_length=20, choices=AdStatus.choices, default=AdStatus.PENDING)
    receipt_image = models.ImageField( upload_to="ad_payment_receipts/", verbose_name="صورة سند الدفع")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ad #{self.id}"

    def is_active(self):
        from django.utils import timezone
        return self.status == AdStatus.APPROVED and self.start_date <= timezone.localdate() <= self.end_date

class PaymentAccount(models.Model):
    bank_name = models.CharField(max_length=100,verbose_name="اسم البنك")
    account_name = models.CharField(max_length=100, blank=True, null=True,verbose_name="اسم الحساب")
    account_number = models.CharField(max_length=100, blank=True, null=True,verbose_name="رقم الحساب / المحفظة")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"

class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "service")

    def __str__(self):
        return f"{self.user} ❤️ {self.service}"
