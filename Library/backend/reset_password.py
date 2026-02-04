from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    print("Checking for admin user...")
    admin = User.query.filter_by(email='admin@library.com').first()
    
    if not admin:
        print("Admin user not found. Creating...")
        admin = User(email='admin@library.com', role='admin', is_admin=True)
        db.session.add(admin)
    else:
        print("Admin user found. Resetting password...")
        
    admin.set_password('admin123')
    db.session.commit()
    print("SUCCESS: Admin password set to 'admin123'")
