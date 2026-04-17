# Fix: AttributeError: module 'bcrypt' has no attribute '__about__'

This error occurs because the **`passlib`** library is trying to check the version of **`bcrypt`** in an outdated way. Follow one of these two methods to fix it.

## Method 1: Downgrade bcrypt (Easiest & Recommended)
This is the standard fix for this issue. It ensures the libraries can "talk" to each other correctly.

Run these in your PyCharm terminal:
```bash
pip uninstall bcrypt
pip install bcrypt==3.1.7
```

---

## Method 2: Use bcrypt directly (No Downgrade)
If you want to keep the latest version of `bcrypt`, you can modify your `main.py` to stop using `passlib`.

**Step 1:** Replace the `pwd_context` lines in `main.py` with this:
```python
import bcrypt

def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
```

**Step 2:** Update your `register_user` function to use `hash_password(req.password)`.

**Step 3:** Update your `login_user` function to use `verify_password(req.password, user['password_hash'])`.

---

## Method 3: The "Magic" Upgrade
Sometimes, simply reinstalling the bridge package fixes it:
```bash
pip install --upgrade "passlib[bcrypt]"
```

**Recommendation**: Use **Method 1**. It is the most stable for learners and requires zero changes to the logic we have already built!
