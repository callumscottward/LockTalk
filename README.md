# Django Project Setup & Reference Guide

This repository contains everything you need to get started with a **Django** project, from environment setup to common commands, project structure, and learning resources.

---

## Useful Resources

* Official Django Documentation: [https://docs.djangoproject.com/](https://docs.djangoproject.com/)
* Django Tutorial (Beginner Friendly): [https://www.w3schools.com/django/](https://www.w3schools.com/django/)
* Django REST Framework: [https://www.django-rest-framework.org/](https://www.django-rest-framework.org/)
* Django Packages: [https://djangopackages.org/](https://djangopackages.org/)
* Mozilla Django Tutorial: [https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django)

---

## Requirements

Before starting, make sure you have the following installed:

* **Python 3.10+** (recommended)
* **pip** (comes with Python)
* **virtualenv** (optional but recommended)
* **Git**

Verify installation:

```bash
python --version
pip --version
git --version
```

---

## Project Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Create and Activate a Virtual Environment

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

Deactivate later with:

```bash
deactivate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` does not exist yet:

```bash
pip install django
pip freeze > requirements.txt
```

---

## Creating a Django Project

If this repository is empty and you need to create a new project:

```bash
django-admin startproject project_name
cd project_name
```

Project structure:

```
project_name/
│── manage.py
│── project_name/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
```

---

## Creating a Django App

```bash
python manage.py startapp app_name
```

Add the app to `settings.py`:

```python
INSTALLED_APPS = [
    'app_name',
]
```

App structure:

```
app_name/
│── migrations/
│── __init__.py
│── admin.py
│── apps.py
│── models.py
│── tests.py
│── views.py
```

---

## Running the Development Server

```bash
python manage.py runserver
```

Then visit:

```
http://127.0.0.1:8000/
```

---

## Database & Migrations

### Apply Migrations

```bash
python manage.py migrate
```

### Create Migrations After Model Changes

```bash
python manage.py makemigrations
python manage.py migrate
```

### Create a Superuser

```bash
python manage.py createsuperuser
```

Admin panel:

```
http://127.0.0.1:8000/admin/
```

---

## URLs & Views Basics

### Example View (`views.py`)

```python
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, Django!")
```

### Example URL Mapping (`urls.py`)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
]
```

---

## Templates

Recommended structure:

```
app_name/
│── templates/
│   └── app_name/
│       └── index.html
```

In `settings.py` ensure:

```python
TEMPLATES = [
    {
        'DIRS': [BASE_DIR / 'templates'],
    },
]
```

---

## Static Files (CSS, JS, Images)

Structure:

```
app_name/
│── static/
│   └── app_name/
│       ├── css/
│       └── js/
```

Load static files in templates:

```html
{% load static %}
<link rel="stylesheet" href="{% static 'app_name/css/style.css' %}">
```

---

## Environment Variables (Recommended)

Install:

```bash
pip install python-dotenv
```

Use a `.env` file for secrets:

```
SECRET_KEY=your-secret-key
DEBUG=True
```

Never commit `.env` files.

---

## Common Django Commands

```bash
python manage.py runserver
python manage.py startapp app_name
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
```

---

## Testing

Run tests:

```bash
python manage.py test
```

---

## Deployment Notes (High-Level)

* Set `DEBUG = False`
* Configure `ALLOWED_HOSTS`
* Use environment variables for secrets
* Collect static files:

```bash
python manage.py collectstatic
```

---

## Recommended `.gitignore`

```
venv/
__pycache__/
*.pyc
.env
db.sqlite3
```

---

## License

Specify your license here (MIT, GPL, etc.).

---

## Notes

This README is designed to be a **complete Django quick-start and reference**. It can be used for coursework, personal projects, or production-ready applications.
