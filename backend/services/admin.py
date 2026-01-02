from django.contrib import admin
from .models import Service, Category, WorkSchedule

# عرض الفئات
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name',)

# عرض الخدمات
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'owner', 'category', 'status')
    list_filter = ('status', 'category')
    search_fields = ('title', 'description', 'owner__username')
    # نخلي الحالة قابلة للتعديل مباشرة من القائمة
    list_editable = ('status',)

# عرض جدول المواعيد
@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'service', 'day', 'start_time', 'end_time')
    list_filter = ('day',)
