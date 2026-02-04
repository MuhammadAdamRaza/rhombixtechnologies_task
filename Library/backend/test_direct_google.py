import requests
import json

# Test Google Books API directly
url = "https://www.googleapis.com/books/v1/volumes"

queries = ["Harry Potter", "Python programming", "The Great Gatsby"]

for query in queries:
    print(f"\n{'='*60}")
    print(f"Testing: {query}")
    print('='*60)
    
    # Without key
    response = requests.get(url, params={'q': query, 'maxResults': 5})
    print(f"Status: {response.status_code}")
    print(f"Full URL: {response.url}")
    
    data = response.json()
    print(f"Response Keys: {list(data.keys())}")
    print(f"Total Items: {data.get('totalItems', 'N/A')}")
    
    if 'items' in data:
        print(f"Found {len(data['items'])} books")
        print(f"First book: {data['items'][0]['volumeInfo'].get('title', 'N/A')}")
    else:
        print("NO ITEMS RETURNED")
        print(f"Full response: {json.dumps(data, indent=2)}")
