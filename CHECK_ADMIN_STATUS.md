# How to Check and Manage Admin Status in pgAdmin 4

Since your Python backend uses a `role` column in the `users` table to determine permissions, you can manage this directly inside **pgAdmin 4**.

## 1. Using the Query Tool (Recommended)
This is the fastest way to check and update your users.

1.  Open **pgAdmin 4**.
2.  Expand your Server -> Databases -> `postgres` (or your database name).
3.  Right-click the database and select **Query Tool**.
4.  **To see all users and their roles**, run:
    ```sql
    SELECT id, username, role FROM users;
    ```
5.  **To make a specific user an Admin**, run:
    ```sql
    UPDATE users SET role = 'admin' WHERE username = 'YOUR_USERNAME';
    ```
    *(Replace `YOUR_USERNAME` with the name they registered with)*.

---

## 2. Using the Visual Data Grid
If you prefer not to write SQL, you can edit the table manually:

1.  In the left sidebar of pgAdmin, navigate to:
    `Schemas` -> `public` -> `Tables` -> `users`.
2.  Right-click the `users` table.
3.  Select **View/Edit Data** -> **All Rows**.
4.  A grid will appear. Find the user you want to change.
5.  Click on the cell in the **role** column and type `admin`.
6.  Click the **Save Data Changes** icon (diskette icon) in the toolbar at the top of the grid.

---

## 3. Creating an Admin from Scratch
If you haven't registered anyone yet, you can run this command to create a "Ready-to-use" Admin account (Username: `admin`, Password: `password123`):

```sql
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$12$8K1p/a069v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v', 'admin');
```

## 4. Troubleshooting
If your App still doesn't show the Admin Dashboard after you update the database:
*   **Logout and Login again**: The role is stored in your login token (JWT). You must log out and back in for the change to take effect in your browser.
*   **Check spelling**: Ensure the role is exactly lowercase `admin` (not `Admin` or `ADMIN`).
