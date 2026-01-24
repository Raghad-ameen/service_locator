from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (ServiceViewSet, CategoryViewSet, WorkScheduleViewSet, DirectorateViewSet, StreetViewSet, ProductViewSet,DeleteProductImageAPIView, ProviderAdViewSet, ProviderAdPackageViewSet, AdminAdViewSet, AdminAdPackageViewSet, PublicAdViewSet, PublicProductViewSet, AdminDashboardStatsAPIView, AdminMonthlyServicesStatsAPIView, AdminMonthlyUsersStatsAPIView, FavoriteListView, FavoriteToggleView,AdminPaymentAccountViewSet, PublicPaymentAccountViewSet, owner_dashboard)
router = DefaultRouter()
router.register(r'service', ServiceViewSet, basename='service')
router.register(r'directorates', DirectorateViewSet, basename='directorates')
router.register(r'streets', StreetViewSet, basename='streets')
router.register(r'categories', CategoryViewSet)
router.register(r'work-schedules', WorkScheduleViewSet)
router.register(r"products", ProductViewSet, basename="products")
# Provider routes
router.register("provider/ads", ProviderAdViewSet, basename="provider-ads")
router.register("provider/packages", ProviderAdPackageViewSet, basename="provider-packages")

# Admin routes
router.register("admin/ads", AdminAdViewSet, basename="admin-ads")
router.register(r'ads', PublicAdViewSet, basename='public-ads')
router.register("admin/packages", AdminAdPackageViewSet, basename="admin-packages")
router.register(r'public/products', PublicProductViewSet, basename='public-products')
router.register(r'admin/payment-accounts', AdminPaymentAccountViewSet, basename='admin-payment-accounts')
router.register(r'payment-accounts', PublicPaymentAccountViewSet, basename='payment-accounts')

urlpatterns = [
    path("delete-image/<int:image_id>/", DeleteProductImageAPIView.as_view()),
    path("dashboard/stats/", AdminDashboardStatsAPIView.as_view()),
    path("services-monthly/", AdminMonthlyServicesStatsAPIView.as_view(),),
    path("users-monthly/", AdminMonthlyUsersStatsAPIView.as_view(),),
    path("favorites/", FavoriteListView.as_view(), name="favorites-list"),
    path("favorites/<int:service_id>/toggle/", FavoriteToggleView.as_view(), name="toggle-favorite",),
    path('owner-dashboard/', owner_dashboard, name='owner-dashboard'),
]
urlpatterns += router.urls
