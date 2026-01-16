from rest_framework import serializers
from .models import Service, Category, WorkSchedule, Product, ProductImage, Ad, AdPackage, AdStatus, Favorite
from users.models import Suggestion 
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Avg

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon']
    def validate_icon(self, value):
        if value:
            allowed_types = ['image/png', 'image/svg+xml']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("يُسمح فقط برفع ملفات PNG أو SVG.")
        return value

class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = ['id', 'service', 'day', 'start_time', 'end_time']

class ServiceSerializer(serializers.ModelSerializer):
    work_schedules = WorkScheduleSerializer(many=True, read_only=True)
    products = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    owner = serializers.ReadOnlyField(source='owner.username')
    owner_image = serializers.ImageField(source='owner.profile_image', read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    class Meta:
        model = Service
        fields = [
            'id', 'owner', 'owner_image', 'title', 'description', 'category', 'category_id',
            'cover_image', 'logo_image', 'phone', 'whatsapp', 'work_schedules','products', 'status', 'created_at','latitude','longitude', "average_rating",
            "reviews_count",        
        ]
    def get_average_rating(self, obj):
        return obj.reviews.aggregate(avg=Avg("rating"))["avg"] or 0

    def get_reviews_count(self, obj):
        return obj.reviews.count()
    def get_products(self, obj):
        products = Product.objects.filter(service=obj.id)
        return ProductSerializer(products, many=True).data
# , 'directorate', 'street','location_map'

# ============ Product Images ============
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'photo']

# ============ Product Display ============
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'service', 'name', 'description', 'price', 'images']
        read_only_fields = ['service']  # مهم — service لا يتغير على التعديل

# ============ Product Create / Update ============
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    deleted_images = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "photos",
            "deleted_images",
        ]

    # =========================
    # CREATE
    # =========================
    def create(self, validated_data):
        photos = validated_data.pop("photos", [])
        deleted_images = validated_data.pop("deleted_images", [])

        product = Product.objects.create(**validated_data)

        # حفظ الصور الجديدة
        for photo in photos:
            ProductImage.objects.create(
                product=product,
                photo=photo
            )

        return product

    # =========================
    # UPDATE
    # =========================
    def update(self, instance, validated_data):
        photos = validated_data.pop("photos", [])
        deleted_images = validated_data.pop("deleted_images", [])

        # تحديث الحقول الأساسية
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # حذف الصور المطلوبة
        if deleted_images:
            ProductImage.objects.filter(
                id__in=deleted_images,
                product=instance
            ).delete()

        # إضافة صور جديدة
        for photo in photos:
            ProductImage.objects.create(
                product=instance,
                photo=photo
            )

        return instance

#============== advertisment =======================
class AdPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdPackage
        fields = ['id', 'name', 'duration_days', 'price']

class AdCreateSerializer(serializers.ModelSerializer):
    package = serializers.PrimaryKeyRelatedField(
        queryset=AdPackage.objects.filter(is_active=True)
    )

    class Meta:
        model = Ad
        fields = ['id', 'image', 'description', 'package', 'start_date']

    def validate(self, attrs):
        request = self.context['request']

        service = Service.objects.filter(
            owner=request.user,
            status='approved'
        ).first()

        if not service:
            raise serializers.ValidationError(
                "لا تملك خدمة معتمدة لإنشاء إعلان."
            )

        # ===== تصحيح تاريخ البدء =====
        start_date = attrs['start_date']

        if isinstance(start_date, str):
            start_date = date.fromisoformat(start_date)

        if start_date < timezone.localdate():
            raise serializers.ValidationError(
                "تاريخ البدء يجب أن يكون اليوم أو لاحقًا."
            )

        attrs['start_date'] = start_date
        attrs['service'] = service
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        package = validated_data['package']
        start_date = validated_data['start_date']
        end_date = start_date + timedelta(days=package.duration_days)

        return Ad.objects.create(
            owner=request.user,
            end_date=end_date,
            status=AdStatus.PENDING,
            **validated_data
        )

class AdListSerializer(serializers.ModelSerializer):
    package = AdPackageSerializer()
    
    owner_name = serializers.CharField(
        source="service.owner.username",
        read_only=True
    )
    
    service_title = serializers.CharField(
        source="service.title",
        read_only=True
    )
    
    class Meta:
        model = Ad
        fields = ['id','description', 'image', 'start_date', 'end_date', 'status', 'package', 'service', 'owner_name', 'service_title']

class AdminAdUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ad
        fields = ['status']

#================= favorite ==============================
class FavoriteServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "title", "description", "logo_image", "cover_image"]

class FavoriteSerializer(serializers.ModelSerializer):
    service = FavoriteServiceSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "service", "created_at"]

class SuggestionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    user_image = serializers.ImageField(source="user.profile_image", read_only=True)

    class Meta:
        model = Suggestion
        fields = ["id", "user_name", "user_image", "message", "response", "created_at"]