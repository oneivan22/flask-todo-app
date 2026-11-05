import sqlite3
from flask import Flask, render_template, request, redirect

app = Flask(__name__)

conn = sqlite3.connect('todo.sqlite')
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0
    )
''')
conn.commit()
conn.close()


@app.route('/')
def index():
    conn = sqlite3.connect('todo.sqlite')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks ORDER BY completed, id DESC')
    tasks = cursor.fetchall()
    conn.close()
    
    return render_template('index.html', tasks=tasks)


@app.route('/add', methods=['POST'])
def add():
    title = request.form.get('title', '')
    if title.strip():
        conn = sqlite3.connect('todo.sqlite')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO tasks (title) VALUES (?)', (title,))
        conn.commit()
        conn.close()
    return redirect('/')


@app.route('/toggle/<int:task_id>')
def toggle(task_id):
    conn = sqlite3.connect('todo.sqlite')
    cursor = conn.cursor()
    cursor.execute('SELECT completed FROM tasks WHERE id = ?', (task_id,))
    task = cursor.fetchone()
    
    if task:
        new_status = 1 if task[0] == 0 else 0
        cursor.execute('UPDATE tasks SET completed = ? WHERE id = ?', (new_status, task_id))
        conn.commit()
        
    conn.close()
    return redirect('/')


@app.route('/delete/<int:task_id>')
def delete(task_id):
    conn = sqlite3.connect('todo.sqlite')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    
    return redirect('/')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7345, debug=True)