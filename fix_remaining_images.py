#!/usr/bin/env python3
"""
Script to replace remaining Unsplash images with authentic Brightet.com images
"""

import re

# Authentic Brightet.com images we collected
authentic_images = [
    'https://brightet.com/cdn/shop/files/2c5cfcbb38d77b027814568aa2d77001.jpg?v=1755543215',
    'https://brightet.com/cdn/shop/files/81D70T5ThoL._AC_SL1500.jpg?v=1755360633',
    'https://brightet.com/cdn/shop/files/711bFnEy8zL._AC_SL1500.jpg?v=1754328394',
    'https://brightet.com/cdn/shop/files/82d1330474079571d42eac81908dc01f.jpg?v=1755549649',
    'https://brightet.com/cdn/shop/files/f61db2ded4fd87d9454128161facf1c9_d0542512-f95f-40d9-8e8d-4b332123ee27.jpg?v=1755548988',
    'https://brightet.com/cdn/shop/files/ff3d30e14abcfb9a0d1c03fd164baebc.jpg?v=1755548252',
    'https://brightet.com/cdn/shop/files/981981c4a2c55799ce001ef41c1135ce.jpg?v=1755548251',
    'https://brightet.com/cdn/shop/files/61mR6SzBzGL._AC_SL1500.jpg?v=1755547998',
    'https://brightet.com/cdn/shop/files/36770087971ec19856d7c180819a53de.jpg?v=1755547998',
    'https://brightet.com/cdn/shop/files/f5809762868c703138f95b7212991919.jpg?v=1755547702',
    'https://brightet.com/cdn/shop/files/b626e3158b5011e361f5e3b6b45c5b3c.jpg?v=1755547626',
    'https://brightet.com/cdn/shop/files/173ee5ef7bd9621c4da3ee1de120366c.jpg?v=1755547587',
    'https://brightet.com/cdn/shop/files/71oxYoQDPbL._AC_SL1500.jpg?v=1755547560',
    'https://brightet.com/cdn/shop/files/71DnmxWR6kL._AC_SL1500.jpg?v=1755547447',
    'https://brightet.com/cdn/shop/files/81s1-cX7ThL._AC_SL1500.jpg?v=1755547263',
    'https://brightet.com/cdn/shop/files/81QPOlwO95L._AC_SL1500.jpg?v=1755547200',
    'https://brightet.com/cdn/shop/files/d6e0cd0879c35dee1850b8efb807f956.jpg?v=1755547149',
    'https://brightet.com/cdn/shop/files/81oQXCK9VQL._AC_SL1500.jpg?v=1755547029',
    'https://brightet.com/cdn/shop/files/bac568a56a3554ae11d06d3e3b4a9543.jpg?v=1755546987',
    'https://brightet.com/cdn/shop/files/09fd34c551a7b45d811e0a87350652b1.jpg?v=1755546889',
]

def fix_images():
    # Read the products file
    with open('project/src/data/products.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all Unsplash URLs
    unsplash_pattern = r"image: 'https://images\.unsplash\.com/[^']+'"
    unsplash_matches = re.findall(unsplash_pattern, content)

    print(f"Found {len(unsplash_matches)} Unsplash images to replace")

    # Replace each Unsplash image with an authentic Brightet image
    image_index = 0
    for match in unsplash_matches:
        # Cycle through authentic images
        replacement_image = authentic_images[image_index % len(authentic_images)]
        replacement = f"image: '{replacement_image}'"
        content = content.replace(match, replacement, 1)
        image_index += 1
        print(f"Replaced: {match} -> {replacement}")

    # Write back to file
    with open('project/src/data/products.ts', 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully replaced {len(unsplash_matches)} images!")

if __name__ == "__main__":
    fix_images()
