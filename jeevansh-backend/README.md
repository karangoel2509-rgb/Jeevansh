# Jeevansh Backend

FastAPI + MongoDB backend for the Jeevansh blood donor coordination platform.

## Setup
1. Create virtual environment: `python -m venv venv`
2. Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies: `pip install -r requirements.txt`
4. Configure `.env` with your MongoDB URI
5. Seed data: `python -m app.utils.seed`
6. Run: `uvicorn app.main:app --reload`

## API Docs
Visit http://localhost:8000/docs