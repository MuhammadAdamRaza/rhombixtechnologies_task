import requests

BASE_URL = "http://localhost:5000/api/auth"

def test_flow():
    email = "simulated_employee@library.om"
    password = "password123"
    
    # 1. Register
    print(f"Registering {email}...")
    reg_res = requests.post(f"{BASE_URL}/register", json={"email": email, "password": password})
    print(f"Register status: {reg_res.status_code}, Response: {reg_res.json()}")
    
    if reg_res.status_code != 201 and reg_res.json().get('message') != "User already exists":
        print("Registration failed!")
        return

    # 2. Login
    print(f"Logging in {email}...")
    login_res = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
    print(f"Login status: {login_res.status_code}")
    if login_res.status_code == 200:
        data = login_res.json()
        print("Login SUCCESS!")
        print(f"User: {data['user']}")
    else:
        print(f"Login FAILED! Response: {login_res.json()}")

if __name__ == "__main__":
    test_flow()
