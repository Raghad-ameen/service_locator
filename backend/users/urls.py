from django.urls import path
from .views import RegisterView, LoginView, UserListView, SuggestionListView, SuggestionReplyView, ReviewViewSet, CommentViewSet, current_user, delete_user, search_users, delete_own_account, update_user, create_suggestion,delete_suggestion, my_rating, service_rating_summary
from rest_framework.routers import DefaultRouter
# from .views import promote_admin
# from .views import demote_admin

router = DefaultRouter()

router.register("reviews", ReviewViewSet, basename="reviews")
router.register("comments", CommentViewSet, basename="comments")

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users_list/', UserListView.as_view(), name='users-list'),
    path('<int:user_id>/delete_user/', delete_user, name='delete-user'),
    path('user/', current_user, name='current_user'),
    path('update_user/', update_user),
    path("search-users/", search_users),
    # path('<int:user_id>/promote_admin/', promote_admin, name='promote_admin'),
    # path('<int:user_id>/demote_admin/', demote_admin, name='demote_admin'),
    path('delete_own_account/', delete_own_account),
    path('suggestions/', SuggestionListView.as_view(), name='suggestions'),
    path("suggestions/<int:pk>/reply/", SuggestionReplyView.as_view(), name="suggestion-reply"),
    path("suggestions/create/", create_suggestion),
    path("suggestions/<int:pk>/",delete_suggestion,name="delete-suggestion"),
    path("my-rating/", my_rating),
    path("service-rating/", service_rating_summary),
]

urlpatterns += router.urls