from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework import generics
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer
from .models import CustomUser, Suggestion
from rest_framework.permissions import IsAdminUser
from .serializers import UserListSerializer, SuggestionSerializer
from services.models import Service
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from django.shortcuts import render

#signup
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer

#login
class LoginView(APIView):
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

        return Response({"detail": "تم حفظ الرد بنجاح"})

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
    query = request.GET.get('q', '').strip()

    if not query:
        # ✅ لو ما في كلمة بحث، رجّعي كل المستخدمين
        users = CustomUser.objects.all()
    else:
        # ✅ بحث شامل بعدة حقول
        users = CustomUser.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(phone__icontains=query) |
            Q(user_type__icontains=query)#المفروض بالعربي
        )

    serialized = UserListSerializer(users, many=True)
    return Response(serialized.data, status=status.HTTP_200_OK)

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
