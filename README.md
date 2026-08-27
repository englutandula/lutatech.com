# Luta Studio Desktop Application (Windows & macOS)

AI-powered Passport Photo Maker and Background Remover desktop application built with Electron, Next.js, and FastAPI (MediaPipe / BiRefNet).

## Requirements
- Node.js 18+ & npm
- Python 3.10+

## Quick Start

### 1. Setup Backend
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Run Desktop Application
```bash
npm install
npm start
```
