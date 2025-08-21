import requests
import re
import json
import time
from urllib.parse import urlparse

def test_image_accessibility(image_url, timeout=10):
    """
    Test if an image URL is accessible and returns a valid image
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.head(image_url, headers=headers, timeout=timeout)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '').lower()
            if any(img_type in content_type for img_type in ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']):
                return True, "OK"
            else:
                return False, f"Invalid content type: {content_type}"
        else:
            return False, f"HTTP {response.status_code}"
            
    except requests.exceptions.RequestException as e:
        return False, f"Request failed: {str(e)}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def get_alternative_brightet_images():
    """
    Get alternative real product images from brightet.com for products that failed
    """
    alternative_images = {
        # Chandeliers - using real brightet.com images
        'chandelier_1': 'https://brightet.com/cdn/shop/files/71K-chpX1OL._AC_SL1500.jpg?v=1754682995&width=800',
        'chandelier_2': 'https://brightet.com/cdn/shop/files/2c5cfcbb38d77b027814568aa2d77001.jpg?v=1755543215&width=800',
        'chandelier_3': 'https://brightet.com/cdn/shop/files/81D70T5ThoL._AC_SL1500.jpg?v=1755360633&width=800',
        'chandelier_4': 'https://brightet.com/cdn/shop/files/81_NJU-ngCL._AC_SL1500.jpg?v=1754685016&width=800',
        'chandelier_5': 'https://brightet.com/cdn/shop/files/81tNzkaYZlL._AC_SL1500.jpg?v=1754683853&width=800',
        'chandelier_6': 'https://brightet.com/cdn/shop/files/81ZXJQ088JL._AC_SL1500.jpg?v=1755360371&width=800',
        'chandelier_7': 'https://brightet.com/cdn/shop/files/61e084786e7f84f4e7f945fdc3ddee6d.jpg?v=1754588002&width=800',
        'chandelier_8': 'https://brightet.com/cdn/shop/files/583633cdd1a19c968336f082cb2dabde.jpg?v=1754684972&width=800',
        'chandelier_9': 'https://brightet.com/cdn/shop/files/71phJFzvoWL._AC_SL1500.jpg?v=1754327915&width=800',
        'chandelier_10': 'https://brightet.com/cdn/shop/files/b626e3158b5011e361f5e3b6b45c5b3c.jpg?v=1755547626&width=800',
        
        # Table Lamps
        'table_lamp_1': 'https://brightet.com/cdn/shop/files/81-9cJlklsL._AC_SL1500.jpg?v=1754327894&width=800',
        'table_lamp_2': 'https://brightet.com/cdn/shop/files/61khW8PiOTL._AC_SL1500.jpg?v=1754327900&width=800',
        
        # Floor Lamps
        'floor_lamp_1': 'https://brightet.com/cdn/shop/files/711bFnEy8zL._AC_SL1500.jpg?v=1754328394&width=800',
        
        # Wall Lights
        'wall_light_1': 'https://brightet.com/cdn/shop/files/812nX7k5QbL._AC_SL1500.jpg?v=1754327926&width=800',
        'wall_light_2': 'https://brightet.com/cdn/shop/files/819dJTw8FCL._AC_SL1500.jpg?v=1755545002&width=800',
        
        # Outdoor Lighting
        'outdoor_1': 'https://brightet.com/cdn/shop/files/81z3HdbrIiL._AC_SL1500.jpg?v=1754327835&width=800',
        'outdoor_2': 'https://brightet.com/cdn/shop/files/81NQfL7ZOkL._AC_SL1500.jpg?v=1754327811&width=800',
        
        # Pendant Lights
        'pendant_1': 'https://brightet.com/cdn/shop/files/9eec62f92aacf5320596bb0c7199e0ad.jpg?v=1754327939&width=800',
        'pendant_2': 'https://brightet.com/cdn/shop/files/77b015e7cb303a9efd7c07ff8700a8cb.jpg?v=1754587766&width=800'
    }
    
    return alternative_images

def extract_products_with_images():
    """
    Extract all products and their current image URLs from the TypeScript file
    """
    products = []
    
    with open('src/data/products.ts', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # More comprehensive regex to extract product data
    product_pattern = r'\{[^}]*id:\s*[\'"]([^\'"]*)[\'"][^}]*name:\s*[\'"]([^\'"]*)[\'"][^}]*image:\s*[\'"]([^\'"]*)[\'"][^}]*category:\s*[\'"]([^\'"]*)[\'"][^}]*\}'
    
    matches = re.findall(product_pattern, content, re.DOTALL)
    
    for match in matches:
        product_id, name, image_url, category = match
        # Clean up the data
        name = name.replace('\\"', '"').strip()
        image_url = image_url.strip()
        category = category.strip()
        
        products.append({
            'id': product_id,
            'name': name,
            'image': image_url,
            'category': category
        })
    
    return products

def assign_alternative_image(category, used_alternatives):
    """
    Assign an appropriate alternative image based on category
    """
    alternatives = get_alternative_brightet_images()
    
    category_mapping = {
        'Chandeliers': [f'chandelier_{i}' for i in range(1, 11)],
        'Table Lamps': ['table_lamp_1', 'table_lamp_2'],
        'Floor Lamps': ['floor_lamp_1'],
        'Wall Lights': ['wall_light_1', 'wall_light_2'],
        'Outdoor Lighting': ['outdoor_1', 'outdoor_2'],
        'Pendant Lights': ['pendant_1', 'pendant_2'],
        'Ceiling Lights': [f'chandelier_{i}' for i in range(1, 6)]  # Use chandelier images for ceiling lights
    }
    
    # Get available alternatives for this category
    available_keys = category_mapping.get(category, ['chandelier_1'])  # Default to chandelier
    
    # Find an unused alternative
    for key in available_keys:
        if key not in used_alternatives:
            used_alternatives.add(key)
            return alternatives[key]
    
    # If all used, cycle through them
    key = available_keys[len(used_alternatives) % len(available_keys)]
    return alternatives[key]

def update_products_with_fixed_images(image_updates):
    """
    Update the products.ts file with fixed image URLs
    """
    with open('src/data/products.ts', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace image URLs
    for product_id, new_image_url in image_updates.items():
        # Find the product and replace its image URL
        pattern = r'(id:\s*[\'"]' + re.escape(product_id) + r'[\'"][^}]*image:\s*[\'"])[^\'"]*([\'"],[^}]*)'
        replacement = r'\1' + new_image_url + r'\2'
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write back to file
    with open('src/data/products.ts', 'w', encoding='utf-8') as file:
        file.write(content)

def main():
    print("🔍 Verifying and fixing all product images...")
    
    # Extract all products with their current images
    products = extract_products_with_images()
    print(f"📦 Found {len(products)} products to verify")
    
    # Track results
    accessible_images = 0
    broken_images = 0
    fixed_images = 0
    image_updates = {}
    used_alternatives = set()
    
    print("\n🧪 Testing image accessibility...")
    
    for i, product in enumerate(products, 1):
        print(f"[{i}/{len(products)}] Testing: {product['name'][:50]}...")
        
        # Test current image
        is_accessible, status = test_image_accessibility(product['image'])
        
        if is_accessible:
            print(f"   ✅ Image accessible: {status}")
            accessible_images += 1
        else:
            print(f"   ❌ Image broken: {status}")
            print(f"   🔄 Finding alternative image...")
            
            # Check if it's an Unsplash placeholder (needs replacement)
            if 'unsplash.com' in product['image']:
                # Assign real brightet.com alternative
                alternative_image = assign_alternative_image(product['category'], used_alternatives)
                
                # Test the alternative
                alt_accessible, alt_status = test_image_accessibility(alternative_image)
                
                if alt_accessible:
                    image_updates[product['id']] = alternative_image
                    print(f"   ✅ Alternative found: {alternative_image}")
                    fixed_images += 1
                else:
                    print(f"   ❌ Alternative also broken: {alt_status}")
                    broken_images += 1
            else:
                broken_images += 1
        
        # Small delay to be respectful
        time.sleep(0.5)
        
        # Progress update every 10 items
        if i % 10 == 0:
            print(f"\n📊 Progress: {i}/{len(products)}")
            print(f"   ✅ Accessible: {accessible_images}")
            print(f"   🔄 Fixed: {fixed_images}")
            print(f"   ❌ Still broken: {broken_images}")
    
    print(f"\n🎉 Verification completed!")
    print(f"   ✅ Accessible images: {accessible_images}")
    print(f"   🔄 Fixed images: {fixed_images}")
    print(f"   ❌ Still broken: {broken_images}")
    
    # Update the file with fixes
    if image_updates:
        print(f"\n🔄 Updating products.ts with {len(image_updates)} fixed images...")
        update_products_with_fixed_images(image_updates)
        print("✅ Products file updated with fixed images!")
        
        # Save the updates for reference
        with open('image_fixes.json', 'w') as f:
            json.dump(image_updates, f, indent=2)
        print("💾 Image fixes saved to image_fixes.json")
    
    total_working = accessible_images + fixed_images
    success_rate = (total_working / len(products)) * 100
    print(f"\n📈 Final success rate: {success_rate:.1f}% ({total_working}/{len(products)} images working)")

if __name__ == "__main__":
    main()
