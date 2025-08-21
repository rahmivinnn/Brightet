import requests
import re
import json
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import random

def get_real_product_image(product_url, product_name, retries=3):
    """
    Scrape the actual product image from brightet.com
    """
    base_url = "https://brightet.com"
    full_url = urljoin(base_url, product_url)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    for attempt in range(retries):
        try:
            print(f"🔍 Scraping: {product_name}")
            print(f"   URL: {full_url}")
            
            response = requests.get(full_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try multiple selectors to find product images
            image_selectors = [
                'img[data-src*="cdn.shop"]',
                'img[src*="cdn.shop"]',
                '.product-single__photo img',
                '.product__photo img',
                '.product-image img',
                '.main-product-image img',
                'img[alt*="' + product_name.split()[0] + '"]',
                'img[data-zoom-src]',
                'img.product-featured-image',
                'img.product-image-main'
            ]
            
            image_url = None
            
            for selector in image_selectors:
                try:
                    img_element = soup.select_one(selector)
                    if img_element:
                        # Try data-src first (lazy loading), then src
                        image_url = img_element.get('data-src') or img_element.get('src')
                        if image_url:
                            # Make sure it's a full URL
                            if image_url.startswith('//'):
                                image_url = 'https:' + image_url
                            elif image_url.startswith('/'):
                                image_url = base_url + image_url
                            
                            # Verify it's a valid image URL
                            if any(ext in image_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                                print(f"   ✅ Found image: {image_url}")
                                return image_url
                except Exception as e:
                    continue
            
            # If no image found with selectors, try to find any image in the page
            all_images = soup.find_all('img')
            for img in all_images:
                src = img.get('data-src') or img.get('src')
                if src and 'cdn.shop' in src and any(ext in src.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = base_url + src
                    print(f"   ✅ Found fallback image: {src}")
                    return src
            
            print(f"   ❌ No image found for {product_name}")
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"   ⚠️  Request failed (attempt {attempt + 1}): {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            continue
        except Exception as e:
            print(f"   ❌ Error scraping {product_name}: {e}")
            return None
    
    return None

def extract_products_from_ts_file():
    """
    Extract product data from the TypeScript file
    """
    products = []
    
    with open('src/data/products.ts', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Use regex to extract product objects
    product_pattern = r'\{[^}]*id:\s*[\'"]([^\'"]*)[\'"][^}]*name:\s*[\'"]([^\'"]*)[\'"][^}]*url:\s*[\'"]([^\'"]*)[\'"][^}]*\}'
    
    matches = re.findall(product_pattern, content, re.DOTALL)
    
    for match in matches:
        product_id, name, url = match
        # Clean up the name and URL
        name = name.replace('\\"', '"').strip()
        url = url.strip()
        
        products.append({
            'id': product_id,
            'name': name,
            'url': url
        })
    
    return products

def update_products_file_with_real_images(image_mapping):
    """
    Update the products.ts file with real image URLs
    """
    with open('src/data/products.ts', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace image URLs
    for product_id, image_url in image_mapping.items():
        if image_url:
            # Find the product and replace its image URL
            pattern = r'(id:\s*[\'"]' + re.escape(product_id) + r'[\'"][^}]*image:\s*[\'"])[^\'"]*([\'"],[^}]*\})'
            replacement = r'\1' + image_url + r'\2'
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write back to file
    with open('src/data/products.ts', 'w', encoding='utf-8') as file:
        file.write(content)

def main():
    print("🚀 Starting real product image extraction from brightet.com...")
    
    # Extract products from TypeScript file
    products = extract_products_from_ts_file()
    print(f"📦 Found {len(products)} products to process")
    
    # Dictionary to store image mappings
    image_mapping = {}
    successful_scrapes = 0
    failed_scrapes = 0
    
    # Process each product
    for i, product in enumerate(products, 1):
        print(f"\n[{i}/{len(products)}] Processing: {product['name']}")
        
        # Get real image URL
        real_image_url = get_real_product_image(product['url'], product['name'])
        
        if real_image_url:
            image_mapping[product['id']] = real_image_url
            successful_scrapes += 1
        else:
            failed_scrapes += 1
        
        # Add delay to be respectful to the server
        time.sleep(random.uniform(1, 3))
        
        # Progress update every 10 items
        if i % 10 == 0:
            print(f"\n📊 Progress: {i}/{len(products)} processed")
            print(f"   ✅ Successful: {successful_scrapes}")
            print(f"   ❌ Failed: {failed_scrapes}")
    
    print(f"\n🎉 Scraping completed!")
    print(f"   ✅ Successfully scraped: {successful_scrapes} images")
    print(f"   ❌ Failed to scrape: {failed_scrapes} images")
    
    if successful_scrapes > 0:
        print(f"\n🔄 Updating products.ts file with real images...")
        update_products_file_with_real_images(image_mapping)
        print(f"✅ Products file updated with {successful_scrapes} real product images!")
    
    # Save mapping for reference
    with open('image_mapping.json', 'w') as f:
        json.dump(image_mapping, f, indent=2)
    
    print(f"\n💾 Image mapping saved to image_mapping.json")

if __name__ == "__main__":
    main()
