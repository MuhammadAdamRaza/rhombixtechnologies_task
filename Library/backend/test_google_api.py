import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_BOOKS_URL = os.getenv('GOOGLE_BOOKS_API_URL', 'https://www.googleapis.com/books/v1/volumes')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

def test_search(query):
    print(f"\n--- Testing Search for: '{query}' ---")
    
    # 1. With Key
    params = {'q': query, 'maxResults': 5}
    if GOOGLE_API_KEY:
        params['key'] = GOOGLE_API_KEY
    
    try:
        res = requests.get(GOOGLE_BOOKS_URL, params=params)
        print(f"Calling URL: {res.url}")
        print(f"Status: {res.status_code}")
        data = res.json()
        items = data.get('items', [])
        print(f"Found {len(items)} items with key.")
        if not items:
            print(f"Response data: {data}")
    except Exception as e:
        print(f"Error with key: {e}")

    # 2. Without Key
    print("\nRetrying without key...")
    try:
        res = requests.get(GOOGLE_BOOKS_URL, params={'q': query, 'maxResults': 5})
        print(f"Calling URL: {res.url}")
        print(f"Status: {res.status_code}")
        data = res.json()
        items = data.get('items', [])
        print(f"Found {len(items)} items without key.")
    except Exception as e:
        print(f"Error without key: {e}")

if __name__ == "__main__":
    test_search("Harry Potter")
    test_search("Adam")
