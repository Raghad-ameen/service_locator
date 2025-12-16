from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    
    list_display = ['username', 'email', 'user_type', 'is_staff']
    
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('phone', 'profile_image')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('phone', 'profile_image')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)