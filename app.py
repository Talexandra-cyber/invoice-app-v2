from flask import Flask, render_template_string

app = Flask(__name__)

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

@app.route('/')
def home():
    return render_template_string(HTML)

if __name__ == '__main__':
    app.run(debug=True) 