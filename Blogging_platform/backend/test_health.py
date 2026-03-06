import requests

# Assuming we can login as an admin or test health
r = requests.get('http://localhost:5000/health')
print("Health:", r.status_code, r.text)

# Let's try to register a new admin or login
# Since we don't know the admin password, we'll try to login with a test user or just hit the audit endpoint without token
r2 = requests.get('http://localhost:5000/api/admin/audit')
print("Audit no token:", r2.status_code, r2.text)
