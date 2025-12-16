from django.urls import path
from .views import RegisterView, LoginView, UserListView, SuggestionListView, SuggestionReplyView, current_user, delete_user, search_users, delete_own_account, update_user, create_suggestion
# from .views import promote_admin
# from .views import demote_admin

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

]
