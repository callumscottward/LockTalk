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

# Setup: Running Redis with Docker
To handle WebSockets (Django Channels), our project requires a Redis server. We use Docker to ensure everyone is running the same version.

## 0.5 Updates
Pull the changes. Before using Docker / redis, re-run:
pip install -r requirements.txt

It may fix any 'ModuleNotFound' stuff if that happens when pulling. Also do the migration commands.

## 1. Docker Desktop Installation
Install Docker: Download Docker Desktop for your OS. This can be through the Microsoft Store, or with this link: https://www.docker.com/products/docker-desktop/

Get it Running: If you haven't used Docker before, make an account and sign in. You may need to close your terminals / VS code completely then reopen after installing. After installing, try running: docker ps


## 2. Running Docker
In your terminal, navigate to the project root and run:

docker-compose up -d

Going forward, rerun this to reestablish the connection. If that command doesn't work, try without the dash:

docker compose up -d

## 3. Verify it's Running
Run docker ps. You should see a container mapped to port 6379. In docker desktop, your connection should have a green dot.

## 4. Run Normal backend and frontend commands
Backend command:
python manage.py runserver

Frontend command:
npm run dev

## 4. Stopping Setup
When you are done for the moment and want to free up the system, run:

docker-compose stop
