from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Attendance
from utils import generate_qr_code
import os

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
app.config['SECRET_KEY'] = 'your_secret_key'
# Replace with your database credentials
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:your_password@localhost/attendance_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists.')
            return redirect(url_for('register'))

        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        # Generate QR code
        qr_code_folder = os.path.join(app.static_folder, 'qrcodes')
        if not os.path.exists(qr_code_folder):
            os.makedirs(qr_code_folder)
            
        qr_code_path = os.path.join(qr_code_folder, f'{new_user.id}.png')
        generate_qr_code(str(new_user.id), qr_code_path)
        new_user.qr_code = f'qrcodes/{new_user.id}.png'
        db.session.commit()

        flash('Registration successful! Please log in.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            flash('Login successful!')
            return redirect(url_for('dashboard', user_id=user.id))
        else:
            flash('Invalid username or password.')
    return render_template('login.html')

@app.route('/dashboard/<int:user_id>')
def dashboard(user_id):
    user = User.query.get_or_404(user_id)
    return render_template('dashboard.html', user=user)

@app.route('/scan')
def scan():
    return render_template('scan.html')

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    user_id = request.json.get('user_id')
    user = User.query.get(user_id)
    if user:
        attendance = Attendance(user_id=user.id)
        db.session.add(attendance)
        db.session.commit()
        return {'status': 'success', 'message': f'Attendance marked for {user.username}'}
    return {'status': 'error', 'message': 'User not found'}, 404

@app.route('/admin')
def admin():
    attendance_records = db.session.query(Attendance, User).join(User).all()
    return render_template('admin.html', records=attendance_records)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
