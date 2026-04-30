"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, BedViewSet, StudentViewSet, ComplaintViewSet, get_recommended_rooms, TriggerEscalationView, auth_login

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'beds', BedViewSet)
router.register(r'students', StudentViewSet)
router.register(r'complaints', ComplaintViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', auth_login, name='auth-login'),
    path('api/recommended-rooms/', get_recommended_rooms, name='recommended-rooms'),
    path('api/escalate/', TriggerEscalationView.as_view(), name='escalate-complaints'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
