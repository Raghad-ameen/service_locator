from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import CustomUser, Suggestion
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from services.models import Service

#user signup
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=True, allow_blank=False, max_length=150, validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="اسم المستخدم موجود مسبقًا")])
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="هذا البريد الإلكتروني مستخدم من قبل")])
    phone = serializers.CharField(required=True, validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="رقم الهاتف مستخدم من قبل")])
    # نرجع التوكن في الاستجابة
    token = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'phone', 'profile_image', 'token')

    def get_token(self, obj):
        # نحصل التوكن الخاص بالمستخدم الجديد
        token, created = Token.objects.get_or_create(user=obj)
        return token.key

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "كلمتا المرور غير متطابقتان"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        validated_data.pop('user_type', None)
        validated_data['user_type'] = 'user'  # النوع الافتراضي للمستخدم الجديد
        user = CustomUser.objects.create_user(**validated_data)
        # إنشاء التوكن مباشرة
        Token.objects.get_or_create(user=user)
        return user

#user login
class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)  # يمكن أن يكون بريد أو رقم هاتف
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        identifier = attrs.get('identifier')
        password = attrs.get('password')

        try:
            # تحديد ما إذا كان المعرف بريد إلكتروني أو رقم هاتف
            if '@' in identifier:
                user_obj = CustomUser.objects.get(email=identifier)
            else:
                user_obj = CustomUser.objects.get(phone=identifier)
        except CustomUser.DoesNotExist:
            if '@' in identifier:
                raise serializers.ValidationError( "لا يوجد حساب بهذا البريد")
            else:
                raise serializers.ValidationError( "لا يوجد حساب بهذا الرقم")

        # التحقق من كلمة المرور مباشرة
        if not user_obj.check_password(password):
            raise serializers.ValidationError("كلمة المرور غير صحيحة")
        
        # تمرير المستخدم إلى validated_data
        attrs['user'] = user_obj
        return attrs

#show list of user in admin dashboard
class UserListSerializer(serializers.ModelSerializer):
    user_type_display = serializers.SerializerMethodField()
    has_service = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'phone', 'profile_image', 'user_type', 'user_type_display', 'has_service']
        #to change userType to arabic in display
    def get_user_type_display(self, obj):
        return obj.get_user_type_display()
    
    def get_has_service(self, obj):
        return Service.objects.filter(owner=obj).exists()

class SuggestionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Suggestion
        fields = ["id", "user_name", "message", "response", "created_at"]
