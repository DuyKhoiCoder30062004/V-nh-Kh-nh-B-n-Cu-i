# Implementation Guide: Local Machine Setup

Follow these steps to get your Python backend and React frontend running together on your local machine (PyCharm + VS Code).

## Step 1: Database Setup (PostgreSQL)
1.  Install **PostgreSQL** and **pgAdmin 4**.
2.  Create a database named `vinhkhanh_db`.
3.  **CRITICAL:** Enable PostGIS by running this SQL command in pgAdmin:
    ```sql
    CREATE EXTENSION postgis;
    ```
4.  Create the `users` and `restaurants` tables (see `DATABASE_POSTGRES_SETUP.md` for the SQL code).

## Step 2: Backend Setup (PyCharm)
1.  Open your backend folder in PyCharm.
2.  Create a virtual environment (`venv`).
3.  Install dependencies:
    ```bash
    pip install fastapi uvicorn psycopg2-binary passlib[bcrypt] pyjwt python-dotenv requests
    ```
4.  Create a `.env` file and add your `ELEVENLABS_API_KEY` and `GEMINI_API_KEY`.
5.  Update the `DB_CONFIG` in your Python file with your actual PostgreSQL password.
6.  Run the server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```

## Step 3: Frontend Setup (VS Code)
1.  Open the `applet` folder in VS Code.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Apply Code Changes:** Follow the instructions in `FRONTEND_CHANGES_LOG.md` to update `src/App.tsx`.
    *   Set `axios.defaults.baseURL`.
    *   Replace direct AI SDK calls with backend API calls.
    *   Update audio playback to handle Base64 strings.
4.  Run the frontend:
    ```bash
    npm run dev
    ```

## Step 4: Verification
1.  Open `http://localhost:3000` in your browser.
2.  Try registering a new account.
3.  Check pgAdmin to see if the user appeared in the `users` table.
4.  Try adding a restaurant and verify the PostGIS `location` column is populated.
