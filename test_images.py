import requests
import re
import time

def test_image_url(url, timeout=10):
    """Test if an image URL is accessible"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.head(url, headers=headers, timeout=timeout)
        return response.status_code == 200
    except:
        return False

def extract_brightet_images():
    """Extract all brightet.com image URLs from products.ts"""
    with open('src/data/products.ts', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Find all brightet.com image URLs
    pattern = r'image:\s*[\'"]([^\'\"]*brightet\.com[^\'\"]*)[\'"]'
    matches = re.findall(pattern, content)
    
    return matches

def main():
    print("🧪 Testing all real brightet.com product images...")
    
    image_urls = extract_brightet_images()
    print(f"📦 Found {len(image_urls)} brightet.com images to test")
    
    working_images = 0
    broken_images = 0
    
    for i, url in enumerate(image_urls, 1):
        print(f"[{i}/{len(image_urls)}] Testing: {url[:80]}...")
        
        if test_image_url(url):
            print(f"   ✅ Working")
            working_images += 1
        else:
            print(f"   ❌ Broken")
            broken_images += 1
        
        time.sleep(0.5)  # Be respectful to the server
    
    print(f"\n🎉 Test Results:")
    print(f"   ✅ Working images: {working_images}")
    print(f"   ❌ Broken images: {broken_images}")
    print(f"   📈 Success rate: {(working_images/len(image_urls)*100):.1f}%")

if __name__ == "__main__":
    main()
