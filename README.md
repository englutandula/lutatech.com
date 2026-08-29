# Luta Studio Web 🌐

AI-powered Passport & Visa Photo Maker and Background Remover web application built with **Next.js (React 19)**, **TailwindCSS**, and **FastAPI** (MediaPipe & BiRefNet).

Runs in any modern web browser (Chrome, Edge, Safari, Firefox) on macOS, Windows, Linux, Android, and iOS.

---

## ✨ Features

- 📸 **AI Passport & Visa Photo Maker**: Automatically crops to official specifications for 15+ countries (US, UK, EU/Schengen, Canada, Australia, India, China, Japan, Germany, Tanzania, Kenya, Uganda, Rwanda, Burundi, South Sudan) plus custom mm/inch dimensions.
- ✂️ **AI Background Remover**: High-accuracy portrait background removal powered by BiRefNet with transparent PNG export and customizable solid backdrops.
- 📐 **300 DPI Print Layouts & Multi-Person Sheets**: Generate multi-photo print sheets (4×6", 5×7", A4, US Letter) ready for direct printing or high-resolution download.
- ⚡ **Zero Setup Requirements for End Users**: No account signup, no watermarks, completely free and open-source.

---

## 🚀 Quick Start (Local Web Development)

### 1. Requirements
- **Node.js 18+** & **npm**
- **Python 3.10 or 3.11**

### 2. Install Dependencies

```bash
# 1. Install root & frontend dependencies
npm run install:all

# 2. Setup Python Virtual Environment
cd backend
python3.11 -m venv venv

# Activate venv:
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python requirements:
pip install -r requirements.txt
cd ..
```

### 3. Run Development Web Servers

To run both the Next.js frontend (with hot-reloading) and FastAPI backend concurrently:

```bash
npm run dev
```

- **Frontend (Web App)**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📦 Production Web Build

To build the static web application and serve everything through a single unified FastAPI web server:

```bash
# 1. Build the frontend web export
npm run build

# 2. Start the unified production web server
npm start
```

Open your browser at **[http://localhost:8000](http://localhost:8000)**.

---

## 🐳 Docker Deployment

You can also run Luta Studio Web in a containerized environment using Docker:

```bash
# Build and run with Docker Compose
docker compose up --build
```

Then visit **[http://localhost:8000](http://localhost:8000)**.

---

## 📄 License

Open-source under the ISC License.
