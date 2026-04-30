# LockTalk

Welcome to LockTalk, a project created by Brendan Farrell, Maddie Luth, Miah Mason, Callum Ward, and Camden Wright for UNO's CSCI-4970 Computer Science Capstone Course in collaboration with sponsor Northrop Grumman. This application aims to deliver a secure messaging experience similar to existing alternatives such as WhatsApp or Mattermost and guarantee a high level of security and trust with communications. Once cloning this repository locally, the steps seen below can be used to get LockTalk up and running on your machine.

---

# Release Notes

## Milestone 4 Features

- Chat moderators can add and remove users
- Messages are sorted by date
- Site supports hosting on HTTPS if certs and key are present locally
- Logs get rotated weekly and automatically saved upon rotation
- Account Admin role affects permissions, including access to Logs, User Management, and Chat Directory
- Logging support added for deletion of conversations/messages and logging out
- Brute force login attempts are met with a cooldown
- Numerous UI tweaks to improve site appearance and cohesiveness

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

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

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

Now, keep this backend server running in one terminal and open a new instance to run and open the site's frontend.

# React Setup (Frontend)

## 1. Install NPM (Node Package Manager)

Follow steps on https://nodejs.org/en/download to download Node on your machine, which will ensure you have NPM and can run subsequent steps.

## 2. Get Plugins Up to Date and Initialize Frontend

```bash
cd frontend
npm install
```

## 3. Run the Frontend Server

```bash
npm run dev
```

To access and load into the GUI of LockTalk, visit:

```
http://localhost:5173/
```

# Optional: Hosting site on HTTPS
For stronger security and encrypted site traffic, follow the below steps depending on your machine's operating system to obtain HTTPS hosting certificates

## 1. Install mkcert

**Windows (PowerShell)**

```bash
winget install FiloSottile.mkcert
mkcert -install
```

**macOS**

```bash
brew install mkcert
brew install nss
mkcert -install
```

## 2. Create certificates in a directory of your choice

```bash
mkdir certs
cd certs
mkcert localhost 127.0.0.1::1
```

## 3. Add the newly created certs to frontend/.env

Create a file titled ".env" within the project's "frontend" folder as a duplicate of the ".env.example" file in the same directory. In this file, copy the directory of the new HTTPS key and cert files that should be in a folder called "certs" following previous instructions as the values for LOCAL_HTTPS_KEY and LOCAL_HTTPS_CERT respectively.

When completed, .env's LOCAL_HTTPS_KEY should point to a file titled "localhost+2-key.pem" and LOCAL_HTTPS_CERT should point to "localhost+2.pem". These files will be referenced by Vite and should allow future instances of the application to automatically switch from HTTP to HTTPS.

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

# Documentation Setup

How to work with the documentation, with Doxygen for the backend, and TypeDoc for the frontend.

## Doxygen Download

Download Doxygen here: https://www.doxygen.nl/download.html

## Updating / generating documentation files:

To see and update documentation run:

For backend: doxygen Doxyfile

For frontend: cd frontend && npx typedoc

For viewing use docs/backend/html/index.html and/or docs/frontend/index.html. In windows it is start docs/backend/html/index.html or start docs/frontend/index.html

There is also a page leading to both by running:
start docs/index.html

## Testing Note:
For testing backend test cases, many of the tests rely upon an entry for SECRET_KEY within LockTalk/settings.py

## Note: Comment type

For documentation to show up, the comments must be formatted a certain way. For Django use ## style, for typescript use /** */ style.
