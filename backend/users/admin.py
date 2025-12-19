from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Review, Comment, CommentImage

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    
    list_display = ['username', 'email', 'user_type', 'is_staff']
    
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('phone', 'profile_image')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('phone', 'profile_image')}),
    )
    
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "service", "rating", "created_at")
    list_filter = ("service", "rating")
    search_fields = ("user__username",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "service", "text", "created_at")
    list_filter = ("service",)
    search_fields = ("user__username", "text")


@admin.register(CommentImage)
class CommentImageAdmin(admin.ModelAdmin):
    list_display = ("id", "comment", "image", "uploaded_at")


admin.site.register(CustomUser, CustomUserAdmin)