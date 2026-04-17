# Guide: Running the App on Your Local Machine

To run the application, you need to have **three parts** active at the same time: the Database, the Python Backend, and the React Frontend.

## Step 1: Start the Database (PostgreSQL)
Ensure your PostgreSQL service is running on your computer.
1.  Open **pgAdmin 4**.
2.  Ensure you have run the SQL commands from `PYTHON_BACKEND_SETUP.md` to create the `users` and `restaurants` tables.
3.  Check that the `DB_CONFIG` in your `main.py` matches your local Postgres password.

---

## Step 2: Start the Python Backend
Open a terminal (Command Prompt, PowerShell, or VS Code Terminal) and follow these steps:

1.  **Navigate to your backend folder**:
    ```bash
    cd path/to/your/backend
    ```
2.  **Activate your virtual environment** (optional but recommended):
    ```bash
    # On Windows
    venv\Scripts\activate
    # On Mac/Linux
    source venv/bin/activate
    ```
3.  **Run the server**:
    ```bash
    python main.py
    ```
    *You should see a message saying: `INFO: Uvicorn running on http://0.0.0.0:8000`.*

---

## Step 3: Start the React Frontend
Open a **NEW** terminal window (do not close the backend terminal).

1.  **Navigate to your frontend folder**:
    ```bash
    cd path/to/your/frontend
    ```
2.  **Install dependencies** (if you haven't yet):
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    *You should see a link like: `Local: http://localhost:3000/`.*

---

## Step 4: Verify the Connection
1.  Open your browser to `http://localhost:3000`.
2.  Try to **Register** a new account.
3.  If the registration succeeds and you see a "Success" alert, your Frontend is talking to your Backend, and your Backend is talking to your Database!

### Troubleshooting
- **Network Error**: Ensure `axios.defaults.baseURL` in `App.tsx` is exactly `"http://localhost:8000"`.
- **404 Not Found**: Ensure you are running `python main.py` and not just a standard script without uvicorn launch.
- **CORS Error**: Ensure `app.add_middleware(CORSMiddleware, ...)` is present in your `main.py`.
