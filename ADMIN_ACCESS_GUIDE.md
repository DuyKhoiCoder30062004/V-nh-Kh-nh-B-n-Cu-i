# Admin Access & Database Credentials Guide

Since you are migrating to a local PostgreSQL database, you need to manage your own user accounts.

## 1. PostgreSQL Database Credentials
In your `main.py` (Python file), you have a `DB_CONFIG` block. These are **not** your app login details; they are the credentials for your database software.

```python
DB_CONFIG = {
    "dbname": "vinhkhanh_db",
    "user": "admin",      -- This is your Postgres username (usually 'postgres')
    "password": "***",    -- This is the password YOU set during Postgres installation
    "host": "localhost",
    "port": "5432"
}
```

## 2. Creating your first Admin Account
The registration form on the website creates accounts with the `user` role by default. To create an Admin, follow these steps:

### Method A: Register then Promote (Recommended)
1.  Run your Python backend and React frontend.
2.  Go to the **Register** page and create an account (e.g., `myadmin`).
3.  Open **pgAdmin 4** (the PostgreSQL management tool).
4.  Open the **Query Tool** for your `vinhkhanh_db`.
5.  Run this command:
    ```sql
    UPDATE users SET role = 'admin' WHERE username = 'myadmin';
    ```
6.  Now log in with `myadmin`. You will see the Admin Dashboard.

### Method B: Manual SQL Insert
Run this in pgAdmin to create an admin named `admin` with the password `password123`:

```sql
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$12$8K1p/a069v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v', 'admin');
```

## 3. Partner Accounts
To test the **Partner Portal**, you can promote a user to the `partner` role:
```sql
UPDATE users SET role = 'partner' WHERE username = 'someuser';
```
 partners can manage their own restaurants but cannot see system-wide stats.
