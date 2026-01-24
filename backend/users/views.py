from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .models import CustomUser, Suggestion, Review, CommentImage, Comment
from .utils import send_verification_email
from services.models import Service
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly, IsAuthenticated
from .serializers import UserListSerializer, SuggestionSerializer , CommentSerializer, ReviewSerializer, RegisterSerializer, LoginSerializer
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from django.db.models import Avg, Count
from notifications.services import send_notification



#signup
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()  # إنشاء المستخدم
                send_verification_email(user)  # إرسال رابط التحقق
                return Response(
                    {"message": "Account created. Check your email to verify."},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": f"Something went wrong: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            send_verification_email(user)
            return Response(
                    {"message": "Account created. Check your email to verify."},
                    status=status.HTTP_201_CREATED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# users/views.py
class VerifyEmailView(APIView):
    def get(self, request, token):
        try:
            user = CustomUser.objects.get(email_verification_token=token)
            user.is_email_verified = True
            user.email_verification_token = None
            user.save()
            return Response({"message": "Email verified successfully"})
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid token"}, status=400)


#login
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            # 🔒 التحقق من الإيميل
            if not user.is_email_verified:
                return Response(
                    {"error": "Please verify your email first"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # التوكن
            try:
                token = Token.objects.get(user=user)
            except Token.DoesNotExist:
                return Response(
                    {"detail": "لم يتم العثور على التوكن. الرجاء تسجيل حساب جديد أولاً."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # تحقق من الخدمات
            has_service = Service.objects.filter(owner=user, status="approved").exists()
            
            if has_service and user.user_type == "user":
                user.user_type = "owner"
                user.save()
                
            return Response({
                'token': token.key,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'profile_image': user.profile_image.url if user.profile_image else None,
                'user_type': user.user_type,
                'has_service': has_service
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            try:
                token = Token.objects.get(user=user)
            except Token.DoesNotExist:
                return Response(
                    {"detail": "لم يتم العثور على التوكن. الرجاء تسجيل حساب جديد أولاً."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                

            has_service = Service.objects.filter(owner=user, status="approved").exists()
            
            if has_service and user.user_type == "user":
                user.user_type = "owner"
                user.save()
                
            return Response({
                'token': token.key,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'profile_image': user.profile_image.url if user.profile_image else None,
                'user_type': user.user_type,
                'has_service': has_service
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#list of user
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]

# create suggestion
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_suggestion(request):
    message = request.data.get("message")
    service_id = request.data.get("service_id")

    if not message:
        return Response({"message": "نص الاقتراح مطلوب"}, status=400)

    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({"service": "الخدمة غير موجودة"}, status=404)

    Suggestion.objects.create(
        user=request.user,
        service=service,
        message=message
    )

    return Response({"detail": "تم إرسال الاقتراح بنجاح"}, status=201)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_suggestion(request, pk):
    try:
        suggestion = Suggestion.objects.get(
            pk=pk,
            service__owner=request.user  # 🔒 تأكيد أن المزوّد هو المالك
        )
    except Suggestion.DoesNotExist:
        return Response(
            {"detail": "الاقتراح غير موجود"},
            status=status.HTTP_404_NOT_FOUND
        )

    suggestion.delete()
    return Response(
        {"detail": "تم حذف الاقتراح بنجاح"},
        status=status.HTTP_204_NO_CONTENT
    )

# عرض الاقتراحات الخاصة بالمزوّد
class SuggestionListView(generics.ListAPIView):
    serializer_class = SuggestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        service = Service.objects.filter(owner=self.request.user).first()
        if not service:
            return Suggestion.objects.none()
        return Suggestion.objects.filter(service=service).order_by("-created_at")

# المزوّد يرد على اقتراح
class SuggestionReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            suggestion = Suggestion.objects.get(pk=pk, service__owner=request.user)
        except Suggestion.DoesNotExist:
            return Response({"detail": "الاقتراح غير موجود"}, status=404)

        reply = request.data.get("response")
        suggestion.response = reply
        suggestion.save()
        
        send_notification(
            user_id=suggestion.user.id,
            message={reply}
        )

        return Response({"detail": "تم حفظ الرد بنجاح"})

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(service_id=self.request.query_params.get("service"))

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            service_id=self.request.data.get("service")
        )

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Comment.objects.filter(
            service_id=self.request.query_params.get("service")
        ).prefetch_related("images").order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        service_id = self.request.data.get("service")

        if not service_id:
            raise ValidationError("service is required")

        service = Service.objects.get(id=service_id)

        # تحقق فقط
        review_exists = Review.objects.filter(
            user=user,
            service=service
        ).exists()

        if not review_exists:
            raise ValidationError("يجب إضافة تقييم قبل التعليق")

        serializer.save(
            user=user,
            service=service
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_rating(request):
    service_id = request.query_params.get("service")
    review = Review.objects.filter(
        user=request.user,
        service_id=service_id
    ).first()

    if review:
        return Response({"rating": review.rating})

    return Response({"rating": None})

@api_view(["GET"])
def service_rating_summary(request):
    service_id = request.query_params.get("service")

    data = Review.objects.filter(service_id=service_id).aggregate(
        average=Avg("rating"),
        count=Count("id")
    )

    return Response({
        "average": round(data["average"] or 0, 1),
        "count": data["count"]
    })
#current user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    has_service = Service.objects.filter(owner=user, status="approved").exists()    
    if has_service and user.user_type == "user":
        user.user_type = "owner"
        user.save()

    # إذا ما عنده خدمات مقبولة وهو owner → يرجع user
    if not has_service and user.user_type == "owner" and user.user_type != "admin":
        user.user_type = "user"
        user.save()
        
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
        'profile_image': request.build_absolute_uri(user.profile_image.url) if user.profile_image else None,
        'user_type': user.user_type,
        'user_type_display': user.get_user_type_display(), 
        'has_service': has_service
    })
    
# profile
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    data = request.data
    errors = {}
    
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')
    # ✅ Update profile info
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.phone = data.get('phone', user.phone)

    if 'profile_image' in request.FILES:
        file = request.FILES['profile_image']
        user.profile_image.save(file.name, file, save=False)

    if CustomUser.objects.exclude(id=user.id).filter(username=data.get('username')).exists():
        errors['username'] = 'اسم المستخدم مستخدم بالفعل'

    if CustomUser.objects.exclude(id=user.id).filter(email=data.get('email')).exists():
        errors['email'] = 'البريد الإلكتروني مستخدم بالفعل'

    if CustomUser.objects.exclude(id=user.id).filter(phone=data.get('phone')).exists():
        errors['phone'] = 'رقم الهاتف مستخدم بالفعل'
        
    if old_password and new_password:
        if not user.check_password(old_password):
            errors['old_password'] = 'كلمة المرور القديمة غير صحيحة'
        elif new_password != confirm_password:
            errors['confirm_password'] = 'كلمة المرور الجديدة وتأكيدها غير متطابقين'
        else:
            try:
                from django.contrib.auth.password_validation import validate_password
                validate_password(new_password, user)
                user.set_password(new_password)
            except ValidationError as e:
                errors['new_password'] = e.messages

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    user.save()

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
        'profile_image': request.build_absolute_uri(user.profile_image.url) if user.profile_image else None,
        'user_type': user.user_type,
        'user_type_display': user.get_user_type_display()
    }, status=status.HTTP_200_OK)

#delete user (admin) 
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        user.delete()
        return Response({'status': 'deleted'}, status=status.HTTP_204_NO_CONTENT)
    except CustomUser.DoesNotExist:
        return Response({'error': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)

#delete user account
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_own_account(request):
    user = request.user
    user.delete()
    return Response({'status': 'deleted'}, status=status.HTTP_204_NO_CONTENT)

#user search
@api_view(['GET'])
@permission_classes([IsAdminUser])
def search_users(request):
    q = request.GET.get('q', '').strip()

    users = CustomUser.objects.all()

    if q:
        user_type = None

        if q.startswith("مس"):
            user_type = "user"
        elif q.startswith("صا"):
            user_type = "owner"
        elif q.startswith("مش"):
            user_type = "admin"

        users = users.filter(
            Q(username__icontains=q) |
            Q(phone__icontains=q)
        )

        if user_type:
            users = users | CustomUser.objects.filter(user_type=user_type)

    return Response(
        UserListSerializer(users.distinct(), many=True).data,
        status=status.HTTP_200_OK
    )

# #promote user
# @api_view(['POST'])
# @permission_classes([IsAdminUser])
# def promote_admin(request, user_id):
#     try:
#         user = CustomUser.objects.get(id=user_id)
#         user.user_type = "admin"
#         user.is_staff = True
#         user.save()
#         return Response(UserListSerializer(user).data, status=status.HTTP_200_OK)
#     except CustomUser.DoesNotExist:
#         return Response({'error': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)

# #demote admin
# @api_view(['POST'])
# @permission_classes([IsAdminUser])
# def demote_admin(request, user_id):
#     try:
#         user = CustomUser.objects.get(id=user_id)
#         # Prevent removing the last admin
#         if user.user_type == 'admin' and CustomUser.objects.filter(user_type='admin').count() == 1:
#             return Response({'error': 'لا يمكن إزالة آخر مشرف في النظام.'}, status=status.HTTP_400_BAD_REQUEST)

#         user.user_type = "user"
#         user.is_staff = False
#         user.save()

#         return Response(UserListSerializer(user).data, status=status.HTTP_200_OK)

#     except CustomUser.DoesNotExist:
#         return Response({'error': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)
