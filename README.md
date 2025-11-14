# Mechconnect Finals — Setup and Requirements

This repository contains two main parts:

- backend: Django REST API (in `backend/`)
- mobile: Flutter app (in `mobile/mechconnect_flutter/`)

This README explains what to install and how teammates can get the project running after they pull from GitHub.

## Backend (Django)

Requirements file: `backend/requirements.txt`

Recommended steps on Windows (cmd.exe):

1. Install Python 3.11+ (if not already installed). Make sure `python` is on your PATH.
2. Create and activate a virtual environment and install dependencies:

   ```cmd
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. Run migrations and start the development server:

   ```cmd
   python manage.py migrate
   python manage.py createsuperuser   # optional, follow prompts
   python manage.py runserver 0.0.0.0:8000
   ```

Notes:
- The project uses Django 5.2.8 (pinned in `requirements.txt`).
- If a `backend/venv` or `backend/.venv` directory exists locally, remove it from the repo and keep virtual environments local only. This repo's `.gitignore` already ignores typical venv folders.

## Mobile (Flutter)

The Flutter app lives in `mobile/mechconnect_flutter/` and already contains a `pubspec.yaml` with package dependencies.

Prerequisites:
- Install Flutter SDK: https://flutter.dev/docs/get-started/install
- For Android: install Android Studio and Android SDK (set ANDROID_HOME / PATH as needed).
- For iOS/macOS: Xcode is required on macOS.

Install Flutter packages and run:

```cmd
cd mobile\mechconnect_flutter
flutter pub get
flutter run   # pick a connected device or an emulator
```

If you only want to fetch the packages (CI or quick setup):

```cmd
flutter pub get
```

## Notes for collaborators

- Don't commit your virtual environments. Use the `.gitignore` at the repo root.
- If you run into package version issues, open an issue or send a quick message with the error and Python/Flutter versions you used.

## Files added for onboarding

- `backend/requirements.txt` — Python packages for the Django backend.
- `README.md` — This onboarding/setup guide (you are reading it).
- `.gitignore` — Top-level ignore rules to keep venvs, build artifacts, and common IDE files out of the repo.

If you'd like, I can also:
- Pin exact versions for DRF and `django-cors-headers` in `backend/requirements.txt`.
- Add a short `CONTRIBUTING.md` with branch and PR rules.
- Create a `dev` script or `Makefile`/PowerShell script to automate the steps above.

Happy hacking!
