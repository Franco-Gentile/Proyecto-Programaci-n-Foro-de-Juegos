from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Category, Post, Comment, Image, Report


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'email')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra info', {'fields': ('role', 'is_deleted')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Extra info', {'fields': ('role',)}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'created_at', 'is_deleted')
    list_filter = ('category', 'is_deleted', 'created_at')
    search_fields = ('title', 'content')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'created_at', 'is_deleted')
    list_filter = ('is_deleted', 'created_at')
    search_fields = ('content',)


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('post', 'image_url', 'created_at')
    search_fields = ('post__title',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reported_by', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('reason',)
    list_display_links = ('reported_by', 'status')