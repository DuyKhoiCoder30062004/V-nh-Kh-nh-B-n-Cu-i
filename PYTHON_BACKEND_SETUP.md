# Python Backend Setup Guide (FastAPI)

This guide explains how to prepare your local environment in **PyCharm** to run the FastAPI backend.

## 1. Project Initialization in PyCharm
1.  Open PyCharm and create a new project (or open your existing folder).
2.  **Virtual Environment:** PyCharm usually creates a `venv` automatically. If not:
    *   Go to **Settings** > **Project** > **Python Interpreter**.
    *   Click **Add Interpreter** > **New Virtualenv Environment**.
3.  Create a file named `main.py` and paste your FastAPI code into it.

## 2. Install Dependencies
Open the terminal in PyCharm and run the following command to install all required libraries:

```bash
pip install fastapi uvicorn psycopg2-binary passlib[bcrypt] pyjwt python-dotenv requests
```

*   `fastapi`: The web framework.
*   `uvicorn`: The server that runs FastAPI.
*   `psycopg2-binary`: The connector for PostgreSQL.
*   `passlib[bcrypt]`: For secure password hashing.
*   `pyjwt`: For handling JSON Web Tokens.
*   `python-dotenv`: To manage your API keys in a `.env` file.
*   `requests`: To make calls to Gemini and ElevenLabs APIs.

## 3. Configure Environment Variables
Create a `.env` file in your root directory:

```env
GEMINI_API_KEY=your_gemini_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
SECRET_KEY=your_super_secret_jwt_key
DB_PASSWORD=your_postgres_password
```

## 4. Running the Server
In your PyCharm terminal, run:

```bash
uvicorn main:app --reload --port 8000
```
*   The server will be available at `http://localhost:8000`.
*   You can view the interactive API documentation at `http://localhost:8000/docs`.
