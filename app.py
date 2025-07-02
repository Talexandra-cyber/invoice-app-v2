from flask import Flask, render_template_string, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = "replace_with_a_secure_random_key"

HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Funny English Bulldogs</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #fef9f4;
            color: #333;
            text-align: center;
            padding: 50px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: auto;
            background: #fff8dc;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #8b4513;
            font-size: 2.5em;
            margin-bottom: 30px;
        }
        .fact-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .fun-fact {
            font-style: italic;
            color: #666;
            margin: 15px 0;
        }
        .characteristics {
            list-style: none;
            padding: 0;
            text-align: left;
            max-width: 500px;
            margin: 20px auto;
        }
        .characteristics li {
            padding: 10px;
            margin: 5px 0;
            background: #fff;
            border-radius: 5px;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐶 English Bulldogs: The Clowns of the Dog World 🎭</h1>
        
        <div class="fact-box">
            <h2>Why English Bulldogs Are Hilarious</h2>
            <p class="fun-fact">"They don't just walk, they waddle with style!"</p>
        </div>

        <div class="characteristics">
            <h3>Funny Characteristics:</h3>
            <ul>
                <li>🛋️ Professional couch potato specialists</li>
                <li>😴 Olympic-level snoring champions</li>
                <li>🎭 Masters of the dramatic face</li>
                <li>💨 Expert in producing interesting sounds</li>
                <li>🦮 Stubborn but lovable personalities</li>
            </ul>
        </div>

        <div class="fact-box">
            <h2>Daily Activities</h2>
            <p>1. Nap</p>
            <p>2. Snack</p>
            <p>3. Short walk (followed by long nap)</p>
            <p>4. More snacks</p>
            <p>5. Evening nap</p>
        </div>

        <div class="footer">
            <p>© 2024 Bulldog Appreciation Society</p>
            <p>No bulldogs were disturbed from their naps in the making of this webpage</p>
        </div>
    </div>
</body>
</html>
'''

# ------------------ NEW LOGIN TEMPLATES ------------------
LOGIN_HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .login-container {
            background: #ffffff;
            padding: 2rem 2.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 380px;
        }
        h2 {
            margin-top: 0;
            margin-bottom: 1.5rem;
            text-align: center;
            color: #333;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #555;
        }
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 1.25rem;
            font-size: 1rem;
        }
        button {
            width: 100%;
            padding: 0.75rem;
            border: none;
            border-radius: 8px;
            background: #2e7d32;
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.25s, transform 0.15s;
        }
        button:hover {
            background: #27642b;
        }
        button:active {
            transform: scale(0.98);
        }
        .error {
            color: #c62828;
            margin-bottom: 1rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Login</h2>
        {% if error %}
            <div class="error">{{ error }}</div>
        {% endif %}
        <form method="POST">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>

            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>

            <button type="submit">Sign In</button>
        </form>
    </div>
</body>
</html>
'''

DASHBOARD_HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #fafafa;
            margin: 0;
            padding: 0;
        }
        header {
            background: #2e7d32;
            color: #fff;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        main {
            padding: 2rem;
            text-align: center;
        }
        a.logout {
            color: #fff;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <header>
        <h1>Welcome, {{ user }}</h1>
        <a href="{{ url_for('logout') }}" class="logout">Logout</a>
    </header>
    <main>
        <p>You have successfully logged in. 🎉</p>
    </main>
</body>
</html>
'''
# ------------------ END LOGIN TEMPLATES ------------------

# Dummy credentials for demonstration purposes (username: admin, password: password)
VALID_USERS = {"admin": "password"}

@app.route('/')
def home():
    return render_template_string(HTML)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username in VALID_USERS and VALID_USERS[username] == password:
            session['user'] = username
            return redirect(url_for('dashboard'))
        else:
            return render_template_string(LOGIN_HTML, error="Invalid username or password")
    # GET
    return render_template_string(LOGIN_HTML, error=None)

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template_string(DASHBOARD_HTML, user=session['user'])

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True) 