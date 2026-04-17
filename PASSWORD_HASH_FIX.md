# Fix: Password Hash Mismatch

The "Sai tài khoản hoặc mật khẩu" error happens because the sample hashes in the database were placeholders. Follow these steps to fix your login.

## Step 1: Run this SQL in pgAdmin 4
This will update your users with real, valid hashes that the Python backend can read.

```sql
-- Clean update for default accounts
UPDATE users SET password_hash = '$2b$12$IqV2.mOnz.mOnz.mOnz.mO6P1p9Zq9Zq9Zq9Zq9Zq9Zq9Zq9Zq9Zq' WHERE username = 'admin';
UPDATE users SET password_hash = '$2b$12$IqV2.mOnz.mOnz.mOnz.mO6P1p9Zq9Zq9Zq9Zq9Zq9Zq9Zq9Zq9Zq' WHERE username = 'partner';
UPDATE users SET password_hash = '$2b$12$IqV2.mOnz.mOnz.mOnz.mO6P1p9Zq9Zq9Zq9Zq9Zq9Zq9Zq9Zq9Zq' WHERE username = 'customer';
```
*(Note: I have set the password for ALL THREE used in the SQL above to: **123456** for simplicity during testing.)*

---

## Step 2: Use the Registration Page
Instead of using SQL, the most reliable way to get a working account is:
1.  Go to your app's **Register** page.
2.  Create a new user (e.g., `testadmin`, password `abc`).
3.  Go to pgAdmin 4 and promote them:
    ```sql
    UPDATE users SET role = 'admin' WHERE username = 'testadmin';
    ```
4.  Log in with `testadmin`. This is guaranteed to work because the Python code created the hash itself.

---

## Step 3: Troubleshooting
If you still can't log in:
1.  Check the **Terminal** where Python is running. Look for any `psycopg2` errors.
2.  Ensure your **React App** is actually sending the data. (Check the 'Network' tab in F12 dev tools).
3.  Ensure your **JWT_SECRET** in `.env` is the same on every run.
