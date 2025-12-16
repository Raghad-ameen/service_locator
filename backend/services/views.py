from rest_framework import viewsets, filters, status, generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Service, Category, WorkSchedule, Product, ProductImage,  Ad, AdPackage, AdStatus
from .serializers import ServiceSerializer, CategorySerializer, WorkScheduleSerializer, ProductSerializer, ProductCreateUpdateSerializer, AdCreateSerializer, AdListSerializer, AdPackageSerializer, AdminAdUpdateSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from users.models import Notification
from django.shortcuts import render
from django.utils import timezone


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [filters.SearchFilter]
    search_fields = ['name'] 
    
class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_queryset(self):
        user = self.request.user

        # إذا المستخدم غير مسجل دخول → نرجع خدمات عامة فقط
        if not user.is_authenticated:
            return Service.objects.filter(status="approved")

        # لو مسجل دخول
        # الأدمن يشوف كل الخدمات
        if getattr(user, "user_type", None) == "admin":
            return Service.objects.all()

        # غير الأدمن → يشوف فقط خدماته المقبولة
        return Service.objects.filter(owner=user, status="approved")

    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category__name', 'owner__username'] 
    
    # إنشاء خدمة جديدة (تكون قيد المراجعة)
    def perform_create(self, serializer):
        service = serializer.save(owner=self.request.user, status='pending')
        if service.status == "pending":
            if service.owner.user_type != "admin":
                service.owner.user_type = "user"
                service.owner.save()
        return service
    
    # عند حذف الخدمة
    def perform_destroy(self, instance):
        owner = instance.owner
        super().perform_destroy(instance)
        # بعد الحذف، افحص إذا ما عنده خدمات مقبولة ثانية
        if not Service.objects.filter(owner=owner, status="approved").exists():
            if owner.user_type == "owner" and owner.user_type != "admin":
                owner.user_type = "user"
                owner.save()
    
    def perform_update(self, serializer):
        service = self.get_object()
        if service.owner != self.request.user and self.request.user.user_type != "admin":
            raise permissions.PermissionDenied("لا تملك صلاحية تعديل هذه الخدمة")
        serializer.save()
      
    # الموافقة على الخدمة
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        service = self.get_object()
        service.status = 'approved'
        service.save()
        
        user = service.owner
        if service.status == "approved":
            if user.user_type == "user":
                user.user_type = "owner"
                user.save()

        return Response({'status': 'approved'})

    #عرض الخدمة الخاصة لصاحب الخدمة
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_service(self, request):
        service = Service.objects.filter(
            owner=request.user,
            status="approved"
        ).first()

        if not service:
            return Response(None, status=200)

        serializer = self.get_serializer(service)
        return Response(serializer.data)

    # رفض الخدمة
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        service = self.get_object()
        reason = request.data.get('reason')

        # أنشئ إشعار لصاحب الخدمة
        Notification.objects.create(
            user=service.owner,
            message=f"تم رفض خدمتك ({service.title}) بسبب: {reason}"
        )

        # احذف الخدمة من قاعدة البيانات
        service.delete()

        owner = service.owner
        if not Service.objects.filter(owner=owner, status="approved").exists():
            if owner.user_type == "owner" and owner.user_type != "admin":
                owner.user_type = "user"
                owner.save()
                
        return Response({"status": "rejected", "reason": reason})   
    
class WorkScheduleViewSet(viewsets.ModelViewSet):
    queryset = WorkSchedule.objects.all()
    serializer_class = WorkScheduleSerializer
    permission_classes = [IsAuthenticated]

# ------------------- Product -------------------
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        service_id = self.request.query_params.get('service')
        if service_id:
            return Product.objects.filter(service_id=service_id)
        return Product.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer


# ------------------- Delete Product Image -------------------
class DeleteProductImageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, image_id):
        try:
            image = ProductImage.objects.get(id=image_id)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({"detail": "الصورة غير موجودة"}, status=status.HTTP_404_NOT_FOUND)
        
class IsProvider(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated  # بس لتبسيط؛ ممكن تربطينها بـ role='provider'

class ProviderAdViewSet(viewsets.ModelViewSet):
    permission_classes = [IsProvider]

    def get_queryset(self):
        return Ad.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return AdCreateSerializer
        return AdListSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        today = timezone.localdate()

        if instance.owner_id != request.user.id:
            raise permissions.PermissionDenied("لا يمكنك حذف إعلان لا تملكه.")

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def approved(self, request):
        today = timezone.localdate()
        ads = Ad.objects.filter(
            owner=request.user,
            status=AdStatus.APPROVED,
            start_date__lte=today,
            end_date__gte=today
        ).order_by("-start_date")
        serializer = AdListSerializer(ads, many=True)
        return Response(serializer.data)

class AdminAdViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = Ad.objects.all()

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return AdminAdUpdateSerializer
        return AdListSerializer

    @action(detail=False, methods=["get"])
    def pending(self, request):
        ads = Ad.objects.filter(status=AdStatus.PENDING).order_by("start_date")
        serializer = AdListSerializer(ads, many=True)
        return Response(serializer.data)
    
class PublicAdViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = AdListSerializer
    queryset = Ad.objects.none()
    parser_classes = [MultiPartParser, FormParser]

    @action(detail=False, methods=["get"])
    def approved(self, request):
        today = timezone.localdate()

        ads = Ad.objects.filter(
            status=AdStatus.APPROVED,
            start_date__lte=today,
            end_date__gte=today
        ).order_by("-start_date")

        return Response(AdListSerializer(ads, many=True).data)    

class AdminAdPackageViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdPackageSerializer
    queryset = AdPackage.objects.all()
    
class ProviderAdPackageViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsProvider]
    serializer_class = AdPackageSerializer
    queryset = AdPackage.objects.filter(is_active=True)
