from rest_framework import viewsets, filters, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Service, Category, WorkSchedule, Product, ProductImage,  Ad, AdPackage, AdStatus, Favorite
from .serializers import ServiceSerializer, CategorySerializer, WorkScheduleSerializer, ProductSerializer, ProductCreateUpdateSerializer, AdCreateSerializer, AdListSerializer, AdPackageSerializer, AdminAdUpdateSerializer, FavoriteSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from users.models import Suggestion, CustomUser
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from notifications.services import send_notification
from datetime import timedelta
from rest_framework.permissions import IsAdminUser
from datetime import date
from calendar import monthrange
from django.shortcuts import get_object_or_404  

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [filters.SearchFilter]
    search_fields = ['name'] 
    
class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category__name', 'owner__username'] 
    
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

        send_notification(
            user_id=service.owner.id,
            message=f"تم قبول خدمتك ({service.title}) بنجاح"
        )

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
        send_notification(
            user_id=service.owner.id,
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        service_id = self.request.query_params.get("service")

        qs = Product.objects.filter(service__owner=user)

        if service_id:
            qs = qs.filter(service_id=service_id)

        return qs

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    def perform_update(self, serializer):
        if serializer.instance.service.owner != self.request.user:
            raise PermissionDenied("غير مصرح لك")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.service.owner != self.request.user:
            raise PermissionDenied("غير مصرح لك")
        instance.delete()
        
    def perform_create(self, serializer):
        service = Service.objects.filter(
        owner=self.request.user,
        status="approved"
        ).first()

        if not service:
            raise ValidationError({
                "service": "يجب أن يكون لديك خدمة مقبولة لإضافة منتجات"
            })

        serializer.save(service=service)
        
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        service_id = self.request.query_params.get("service")
        if not service_id:
            return Product.objects.none()

        return Product.objects.filter(
            service_id=service_id,
            service__status="approved"  # لو عندك حالة
        )

class DeleteProductImageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, image_id):
        try:
            image = ProductImage.objects.select_related(
                "product__service"
            ).get(id=image_id)

            if image.product.service.owner != request.user:
                return Response(
                    {"detail": "غير مصرح لك"},
                    status=status.HTTP_403_FORBIDDEN
                )

            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except ProductImage.DoesNotExist:
            return Response(
                {"detail": "الصورة غير موجودة"},
                status=status.HTTP_404_NOT_FOUND
            )

# ------------------adv------------------------
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
    
    # قبول الإعلان
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        ad = self.get_object()
        ad.status = AdStatus.APPROVED
        ad.save()

        send_notification(
            user_id=ad.owner.id,
            message=f"تم قبول إعلانك ✅"
        )

        return Response({'status': 'approved'})

    # رفض الإعلان
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        ad = self.get_object()
        reason = request.data.get('reason')
        # إرسال إشعار لصاحب الإعلان
        send_notification(
            user_id=ad.owner.id,
            message=f"تم رفض إعلانك ({reason}) ❌"
        )
        # احذف الخدمة من قاعدة البيانات
        ad.delete()
        return Response({"status": "rejected"})
    
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
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # ✅ فحص ثابت بدون related_name
        if Ad.objects.filter(package=instance).exists():
            return Response(
                {"detail": "لا يمكن حذف الباقة لأنها مستخدمة في إعلانات"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except (ProtectedError, IntegrityError):
            return Response(
                {"detail": "لا يمكن حذف الباقة لأنها مرتبطة ببيانات أخرى"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
class ProviderAdPackageViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsProvider]
    serializer_class = AdPackageSerializer
    queryset = AdPackage.objects.filter(is_active=True)

#---------------------owner dashboard----------------------
class OwnerDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = Service.objects.filter(owner=request.user).first()
        if not service:
            return Response({"detail": "لا توجد خدمة مرتبطة بهذا المستخدم"}, status=404)

        visits = service.visits_count
        likes = service.likes_count
        products_count = Product.objects.filter(service=service).count()

        latest_products = Product.objects.filter(service=service).order_by('-created_at')[:5]
        latest_suggestions = Suggestion.objects.filter(service=service).order_by('-created_at')[:5]

        return Response({
            "visits": visits,
            "likes": likes,
            "products": products_count,
            "latest_products": [
                {"name": p.name, "description": p.description, "price": p.price, "img": p.images.first().photo.url if p.images.exists() else ""}
                for p in latest_products
            ],
            "latest_suggestions": [
                {"name": s.user.get_full_name(), "text": s.message, "img": s.user.profile_image.url if s.user.profile_image else ""}
                for s in latest_suggestions
            ]
        })

#--------------------admin dashboard-----------------------
class AdminDashboardStatsAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        prev_week_start = week_ago - timedelta(days=7)

        # ======================
        # Counters (الكروت)
        # ======================
        services_count = Service.objects.filter(status="approved").count()
        users_count = CustomUser.objects.count()
        Category_count = Category.objects.count()  # أو Department لو عندك موديل مستقل

        # ======================
        # This week
        # ======================
        users_this_week = CustomUser.objects.filter(
            date_joined__date__gte=week_ago
        ).count()

        services_this_week = Service.objects.filter(
            status="approved",
            created_at__date__gte=week_ago
        ).count()

        # ======================
        # Previous week
        # ======================
        users_prev_week = CustomUser.objects.filter(
            date_joined__date__range=[prev_week_start, week_ago]
        ).count()

        services_prev_week = Service.objects.filter(
            created_at__date__range=[prev_week_start, week_ago]
        ).count()

        # ======================
        # Percentage helper
        # ======================
        def percent_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100)

        return Response({
            "counts": {
                "services": services_count,
                "users": users_count,
                "Category": Category_count,
            },
            "weekly": {
                "users": {
                    "count": users_this_week,
                    "change": percent_change(users_this_week, users_prev_week)
                },
                "services": {
                    "count": services_this_week,
                    "change": percent_change(services_this_week, services_prev_week)
                }
            }
        })

class AdminMonthlyServicesStatsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        year = int(request.query_params.get("year"))
        month = int(request.query_params.get("month"))

        last_day = monthrange(year, month)[1]

        weeks = [
            (1, 1, 7),
            (2, 8, 14),
            (3, 15, 21),
            (4, 22, last_day),
        ]

        data = []

        for _, start_day, end_day in weeks:
            start = date(year, month, start_day)
            end = date(year, month, end_day)

            count = Service.objects.filter(
                status="approved",
                created_at__date__range=[start, end]
            ).count()

            data.append(count)

        return Response({
            "labels": [
                "الأسبوع 1",
                "الأسبوع 2",
                "الأسبوع 3",
                "الأسبوع 4",
            ],
            "data": data,
        })
      
class AdminMonthlyUsersStatsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        year = int(request.query_params.get("year"))
        month = int(request.query_params.get("month"))

        last_day = monthrange(year, month)[1]

        weeks = [
            (1, 1, 7),
            (2, 8, 14),
            (3, 15, 21),
            (4, 22, last_day),
        ]


        data = []

        for _, start_day, end_day in weeks:
            start = date(year, month, start_day)
            end = date(year, month, end_day)

            count = CustomUser.objects.filter(
                date_joined__date__range=[start, end]
            ).count()

            data.append(count)

        return Response({
            "labels": [
                "الأسبوع 1",
                "الأسبوع 2",
                "الأسبوع 3",
                "الأسبوع 4"
            ],
            "data": data,
        })

#  المفضلة
class FavoriteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, service_id):
        service = get_object_or_404(Service, id=service_id)

        favorite = Favorite.objects.filter(
            user=request.user,
            service=service
        ).first()

        if favorite:
            favorite.delete()
            return Response({"favorite": False})

        Favorite.objects.create(
            user=request.user,
            service=service
        )
        return Response({"favorite": True})
    
class FavoriteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        services = [fav.service for fav in favorites]

        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

