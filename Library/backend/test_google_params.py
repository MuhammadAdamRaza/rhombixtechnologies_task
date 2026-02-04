import requests

# Test different parameter combinations
url = "https://www.googleapis.com/books/v1/volumes"

tests = [
    {"name": "Basic query", "params": {"q": "Harry Potter", "maxResults": 5}},
    {"name": "With country=US", "params": {"q": "Harry Potter", "maxResults": 5, "country": "US"}},
    {"name": "With printType", "params": {"q": "Harry Potter", "maxResults": 5, "printType": "books"}},
    {"name": "Subject search", "params": {"q": "subject:fiction", "maxResults": 5}},
    {"name": "ISBN search", "params": {"q": "isbn:9780545010221", "maxResults": 5}},
    {"name": "All parameters", "params": {"q": "Harry Potter", "maxResults": 5, "country": "US", "printType": "books", "langRestrict": "en"}},
]

for test in tests:
    print(f"\n{'='*60}")
    print(f"Test: {test['name']}")
    print(f"Params: {test['params']}")
    print('='*60)
    
    try:
        response = requests.get(url, params=test['params'], timeout=10)
        print(f"Status: {response.status_code}")
        print(f"URL: {response.url}")
        
        data = response.json()
        total = data.get('totalItems', 0)
        items = data.get('items', [])
        
        print(f"Total Items: {total}")
        print(f"Items Returned: {len(items)}")
        
        if items:
            print(f"✅ SUCCESS - First book: {items[0]['volumeInfo'].get('title', 'N/A')}")
            break  # Found working combination!
        else:
            print("❌ NO RESULTS")
            if 'error' in data:
                print(f"Error: {data['error']}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")

print("\n" + "="*60)
print("Test complete!")
