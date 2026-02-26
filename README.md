# LockTalk

Welcome to LockTalk, a project created by Brendan Farrell, Maddie Luth, Miah Mason, Callum Ward, and Camden Wright for UNO's CSCI-4970 Computer Science Capstone Course in collaboration with sponsor Northrop Grumman. This application aims to deliver a secure messaging experience similar to existing alternatives such as WhatsApp or Mattermost and guarantee a high level of security and trust with communications. Once cloning this repository locally, the steps seen below can be used to get LockTalk up and running on your machine.

---

# Django Setup (Backend)

## 1. Create and Activate a Virtual Environment

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

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Run Database Migrations

### Apply Migrations

```bash
python manage.py migrate
```

### Create Migrations After Model Changes

```bash
python manage.py makemigrations
python manage.py migrate
```

## 4. Run the Development Server

```bash
python manage.py runserver
```

To access the server in a browser, visit:

```
http://localhost:8000/
```

---

Now, keep this backend server running in one terminal and open a new instance to run and open the site's frontend.

---

# React Setup (Frontend)

## 1. Install NPM (Node Package Manager)

Follow steps on https://nodejs.org/en/download to download Node on your machine, which will ensure you have NPM and can run subsequent steps.

---

## 2. Get Plugins Up to Date and Initialize Frontend

```bash
cd frontend
npm install
```

---

## 3. Run the Frontend Server

```bash
npm run dev
```

To access and load into the GUI of LockTalk, visit:

```
http://localhost:5173/
```