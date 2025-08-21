import * as THREE from 'three';

export interface Model3DConfig {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export class Product3DModelGenerator {
  static generateChandelier(type: 'crystal' | 'modern' | 'traditional' = 'crystal'): Model3DConfig {
    const group = new THREE.Group();

    if (type === 'crystal') {
      // Main body - ornate crystal chandelier
      const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.4, 1.2, 8);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFD700,
        shininess: 100
      });
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(bodyMesh);
      
      // Crystal drops
      for (let tier = 0; tier < 3; tier++) {
        const tierRadius = 0.6 + tier * 0.3;
        const tierY = 0.3 - tier * 0.4;
        const crystalsInTier = 8 + tier * 4;
        
        for (let i = 0; i < crystalsInTier; i++) {
          const angle = (i / crystalsInTier) * Math.PI * 2;
          const crystalGeometry = new THREE.TetrahedronGeometry(0.08 + tier * 0.02);
          const crystalMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.9,
            shininess: 100
          });
          const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
          crystalMesh.position.set(
            Math.cos(angle) * tierRadius, 
            tierY, 
            Math.sin(angle) * tierRadius
          );
          crystalMesh.rotation.y = angle;
          group.add(crystalMesh);
        }
      }
      
      // Chain/suspension
      const chainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6);
      const chainMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
      const chainMesh = new THREE.Mesh(chainGeometry, chainMaterial);
      chainMesh.position.y = 1.0;
      group.add(chainMesh);
      
    } else if (type === 'modern') {
      // Modern minimalist chandelier
      const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
      const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 80
      });
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(bodyMesh);
      
      // LED strips
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const stripGeometry = new THREE.BoxGeometry(0.02, 0.6, 0.02);
        const stripMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xffffff,
          emissive: 0x444444
        });
        const stripMesh = new THREE.Mesh(stripGeometry, stripMaterial);
        stripMesh.position.set(Math.cos(angle) * 0.35, -0.35, Math.sin(angle) * 0.35);
        group.add(stripMesh);
      }
    }
    
    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }
  
  static generateWallSconce(style: 'modern' | 'traditional' = 'modern'): Model3DConfig {
    const group = new THREE.Group();
    
    if (style === 'modern') {
      // Modern wall sconce
      const backPlateGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
      const backPlateMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const backPlateMesh = new THREE.Mesh(backPlateGeometry, backPlateMaterial);
      backPlateMesh.position.z = -0.05;
      group.add(backPlateMesh);
      
      // Light diffuser
      const diffuserGeometry = new THREE.BoxGeometry(0.6, 1.0, 0.2);
      const diffuserMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.8,
        emissive: 0x222222
      });
      const diffuserMesh = new THREE.Mesh(diffuserGeometry, diffuserMaterial);
      diffuserMesh.position.z = 0.1;
      group.add(diffuserMesh);
    }
    
    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }
  
  static generateTableLamp(style: 'rustic' | 'modern' | 'traditional' = 'modern'): Model3DConfig {
    const group = new THREE.Group();

    if (style === 'rustic') {
      // Realistic wooden base with texture
      const baseGeometry = new THREE.CylinderGeometry(0.35, 0.45, 0.25, 16);
      const baseMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.7
      });
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.position.y = -0.7;
      group.add(baseMesh);

      // Detailed wooden stem with natural taper
      const stemGeometry = new THREE.CylinderGeometry(0.04, 0.06, 0.9, 12);
      const stemMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0.0,
        clearcoat: 0.4
      });
      const stemMesh = new THREE.Mesh(stemGeometry, stemMaterial);
      stemMesh.position.y = -0.25;
      group.add(stemMesh);

      // Realistic fabric lampshade with proper proportions
      const shadeGeometry = new THREE.ConeGeometry(0.5, 0.6, 16, 1, true);
      const shadeMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFF8DC,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);
      shadeMesh.position.y = 0.4;
      group.add(shadeMesh);

      // Shade top with realistic closure
      const shadeTopGeometry = new THREE.CircleGeometry(0.5, 16);
      const shadeTopMesh = new THREE.Mesh(shadeTopGeometry, shadeMaterial);
      shadeTopMesh.position.y = 0.7;
      shadeTopMesh.rotation.x = -Math.PI / 2;
      group.add(shadeTopMesh);

      // Metal shade frame (top and bottom rings)
      const frameTopGeometry = new THREE.TorusGeometry(0.5, 0.008, 6, 16);
      const frameMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
      });
      const frameTopMesh = new THREE.Mesh(frameTopGeometry, frameMaterial);
      frameTopMesh.position.y = 0.7;
      group.add(frameTopMesh);

      const frameBottomMesh = new THREE.Mesh(frameTopGeometry, frameMaterial);
      frameBottomMesh.position.y = 0.1;
      group.add(frameBottomMesh);

      // Light bulb inside shade
      const bulbGeometry = new THREE.SphereGeometry(0.04, 12, 12);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA,
        transparent: true,
        opacity: 0.8
      });
      const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulbMesh.position.y = 0.35;
      group.add(bulbMesh);

      // Warm light glow effect
      const glowGeometry = new THREE.SphereGeometry(0.45, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA,
        transparent: true,
        opacity: 0.1
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.y = 0.4;
      group.add(glowMesh);
    }
    
    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }
  
  static generateCeilingLight(type: 'flush' | 'semi-flush' | 'pendant' = 'flush'): Model3DConfig {
    const group = new THREE.Group();
    
    if (type === 'flush') {
      // Flush mount ceiling light
      const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16);
      const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0x111111
      });
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(bodyMesh);
      
      // Decorative rim
      const rimGeometry = new THREE.TorusGeometry(0.6, 0.05, 8, 16);
      const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
      const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
      rimMesh.position.y = 0.1;
      group.add(rimMesh);
    }
    
    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }
  
  static generateOutdoorLight(type: 'wall' | 'landscape' = 'wall'): Model3DConfig {
    const group = new THREE.Group();
    
    if (type === 'wall') {
      // Outdoor wall light
      const housingGeometry = new THREE.BoxGeometry(0.6, 1.0, 0.4);
      const housingMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const housingMesh = new THREE.Mesh(housingGeometry, housingMaterial);
      group.add(housingMesh);
      
      // Glass front
      const glassGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.02);
      const glassMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.7
      });
      const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
      glassMesh.position.z = 0.21;
      group.add(glassMesh);
    } else if (type === 'landscape') {
      // Landscape light
      const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
      const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
      poleMesh.position.y = -0.75;
      group.add(poleMesh);
      
      // Light head
      const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const headMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0x222222
      });
      const headMesh = new THREE.Mesh(headGeometry, headMaterial);
      headMesh.position.y = 0.15;
      group.add(headMesh);
    }
    
    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateSolarLandscapeLight(): Model3DConfig {
    const group = new THREE.Group();

    // Create multiple solar lights in a pack arrangement (12-pack)
    const lightPositions = [
      { x: -0.8, z: -0.8 }, { x: 0, z: -0.8 }, { x: 0.8, z: -0.8 },
      { x: -0.8, z: 0 }, { x: 0, z: 0 }, { x: 0.8, z: 0 },
      { x: -0.8, z: 0.8 }, { x: 0, z: 0.8 }, { x: 0.8, z: 0.8 },
      { x: -1.2, z: -0.4 }, { x: 1.2, z: -0.4 }, { x: -1.2, z: 0.4 }
    ];

    lightPositions.forEach((pos, index) => {
      const lightGroup = new THREE.Group();

      // Solar panel on top (black photovoltaic surface)
      const solarGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8);
      const solarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.3,
        reflectivity: 0.2
      });
      const solarMesh = new THREE.Mesh(solarGeometry, solarMaterial);
      solarMesh.position.y = 0.4;
      lightGroup.add(solarMesh);

      // Light housing (stainless steel finish)
      const housingGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 12);
      const housingMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xC0C0C0,
        metalness: 0.8,
        roughness: 0.2,
        reflectivity: 0.9
      });
      const housingMesh = new THREE.Mesh(housingGeometry, housingMaterial);
      housingMesh.position.y = 0.3;
      lightGroup.add(housingMesh);

      // LED light (warm white glow)
      const ledGeometry = new THREE.SphereGeometry(0.04, 12, 12);
      const ledMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA,
        transparent: true,
        opacity: 0.8
      });
      const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);
      ledMesh.position.y = 0.25;
      lightGroup.add(ledMesh);

      // Ground stake (plastic/metal)
      const stakeGeometry = new THREE.CylinderGeometry(0.01, 0.015, 0.4, 6);
      const stakeMaterial = new THREE.MeshPhongMaterial({
        color: 0x2a2a2a
      });
      const stakeMesh = new THREE.Mesh(stakeGeometry, stakeMaterial);
      stakeMesh.position.y = 0.0;
      lightGroup.add(stakeMesh);

      // Position each light in the pack
      lightGroup.position.set(pos.x, 0, pos.z);
      group.add(lightGroup);
    });

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 0.8,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static getModelForProduct(productName: string, productId: string): Model3DConfig {
    try {
      const name = productName.toLowerCase();

      // Specific Brightet.com product models based on actual products
      if (productId === '7704163287142') {
        // 11.8" Modern LED Crystal Chandelier – Flush Mount with K9 Crystals
        return this.generateModernLEDCrystalChandelier();
      } else if (productId === '7709795778662') {
        // 12-Light Gold Crystal Flush Mount Chandelier
        return this.generate12LightGoldCrystalChandelier();
      } else if (productId === '7708729966694') {
        // 14-Light Gold Empire Crystal Chandelier
        return this.generateEmpireCrystalChandelier();
      } else if (productId === '7704181964902') {
        // 16" Gold Crystal Chandelier – 4-Light Modern 2-Tier Pendant
        return this.generate2TierPendantChandelier();
      } else if (productId === '7704168005734') {
        // 16.5" Gold Globe Crystal Chandelier – 4-Light Pendant
        return this.generateGlobeCrystalChandelier();
      } else if (productId === '7708729475174') {
        // 18-Light Crystal Flush Mount Chandelier
        return this.generate18LightCrystalChandelier();
      } else if (productId === '7704180752486') {
        // 20" Black Crystal Drum Chandelier – 6-Light Semi Flush Mount
        return this.generateBlackCrystalDrumChandelier();
      } else if (productId === '7701864808550') {
        // 18" Black LED Wall Sconces Set of 2 – 12W
        return this.generateModernLEDWallSconce();
      } else if (productId === '7703391305830') {
        // 18.7" 6-Light Modern Black Glass Drum Chandelier
        return this.generateBlackGlassDrumChandelier();
      } else if (productId === '7701875163238') {
        // 20" Brushed Brass Dining Room Chandelier
        return this.generateBrushedBrassChandelier();
      } else if (productId === '7701864906854') {
        // 20" Crystal Farmhouse Chandelier – 5-Light
        return this.generateFarmhouseCrystalChandelier();
      } else if (productId === '7701862645862') {
        // 12-Pack Solar Landscape Lights – Warm White
        return this.generateSolarLandscapeLight();
      }

      // Generic fallbacks based on product type
      if (name.includes('chandelier')) {
        if (name.includes('crystal')) {
          return this.generateChandelier('crystal');
        } else if (name.includes('modern')) {
          return this.generateChandelier('modern');
        } else {
          return this.generateChandelier('traditional');
        }
      } else if (name.includes('wall') || name.includes('sconce')) {
        if (name.includes('outdoor')) {
          return this.generateOutdoorLight('wall');
        } else {
          return this.generateWallSconce('modern');
        }
      } else if (name.includes('table') || name.includes('lamp')) {
        if (name.includes('rustic')) {
          return this.generateTableLamp('rustic');
        } else {
          return this.generateTableLamp('modern');
        }
      } else if (name.includes('ceiling') || name.includes('flush')) {
        return this.generateCeilingLight('flush');
      } else if (name.includes('outdoor') || name.includes('landscape')) {
        return this.generateOutdoorLight('landscape');
      } else {
        // Default fallback
        return this.generateChandelier('modern');
      }
    } catch (error) {
      console.error('Error in getModelForProduct:', error);
      // Ultimate fallback - simple box
      return {
        geometry: new THREE.BoxGeometry(1, 1, 1),
        material: new THREE.MeshPhongMaterial({ color: 0x888888 }),
        scale: 1,
        position: { x: 0, y: 0, z: 0 }
      };
    }
  }

  // Specific product model generators based on actual Brightet.com products
  static generateModernLEDCrystalChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Main flush mount base - realistic chrome finish
    const baseGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.08, 32);
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xE8E8E8,
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(baseMesh);

    // LED housing ring
    const ledRingGeometry = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
    const ledRingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      emissive: 0x444444,
      emissiveIntensity: 0.3
    });
    const ledRingMesh = new THREE.Mesh(ledRingGeometry, ledRingMaterial);
    ledRingMesh.position.y = -0.04;
    group.add(ledRingMesh);

    // K9 Crystal elements - more realistic crystal shapes
    const crystalPositions = [
      // Inner ring
      { radius: 0.3, count: 8, size: 0.04, length: 0.12 },
      // Middle ring
      { radius: 0.45, count: 12, size: 0.035, length: 0.15 },
      // Outer ring
      { radius: 0.58, count: 16, size: 0.03, length: 0.18 }
    ];

    crystalPositions.forEach(ring => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;

        // Create realistic crystal drop shape
        const crystalGeometry = new THREE.ConeGeometry(ring.size, ring.length, 8);
        const crystalMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.95,
          transmission: 0.9,
          roughness: 0.0,
          metalness: 0.0,
          reflectivity: 1.0,
          ior: 2.4, // Crystal refractive index
          thickness: 0.01
        });

        const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystalMesh.position.set(
          Math.cos(angle) * ring.radius,
          -0.08 - ring.length / 2,
          Math.sin(angle) * ring.radius
        );

        // Add slight random rotation for natural look
        crystalMesh.rotation.z = (Math.random() - 0.5) * 0.2;
        group.add(crystalMesh);

        // Add small crystal connectors
        const connectorGeometry = new THREE.SphereGeometry(0.008, 8, 8);
        const connectorMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xC0C0C0,
          metalness: 0.8,
          roughness: 0.2
        });
        const connectorMesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
        connectorMesh.position.set(
          Math.cos(angle) * ring.radius,
          -0.04,
          Math.sin(angle) * ring.radius
        );
        group.add(connectorMesh);
      }
    });

    // Realistic LED light effect with multiple light points
    const lightGeometry = new THREE.SphereGeometry(0.015, 12, 12);
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFDD,
      transparent: true,
      opacity: 0.9
    });

    // Create LED array in circular pattern
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const radius = 0.42;
      const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
      lightMesh.position.set(
        Math.cos(angle) * radius,
        -0.03,
        Math.sin(angle) * radius
      );
      group.add(lightMesh);
    }

    // Add warm light glow effect
    const glowGeometry = new THREE.CircleGeometry(0.6, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFAA,
      transparent: true,
      opacity: 0.15
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.y = -0.06;
    glowMesh.rotation.x = -Math.PI / 2;
    group.add(glowMesh);

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generate12LightGoldCrystalChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Main ornate gold frame with detailed metalwork
    const frameGeometry = new THREE.TorusGeometry(1.1, 0.08, 8, 32);
    const frameMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFFD700,
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 0.8,
      clearcoat: 1.0
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    group.add(frameMesh);

    // Decorative inner ring
    const innerRingGeometry = new THREE.TorusGeometry(0.8, 0.04, 6, 24);
    const innerRingMesh = new THREE.Mesh(innerRingGeometry, frameMaterial);
    innerRingMesh.position.y = -0.3;
    group.add(innerRingMesh);

    // 12 ornate light arms extending from frame
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 1.0;

      // Decorative arm extending outward
      const armGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.4, 8);
      const armMesh = new THREE.Mesh(armGeometry, frameMaterial);
      armMesh.position.set(
        Math.cos(angle) * (radius * 0.7),
        -0.2,
        Math.sin(angle) * (radius * 0.7)
      );
      armMesh.rotation.z = Math.cos(angle) * 0.3;
      armMesh.rotation.x = Math.sin(angle) * 0.3;
      group.add(armMesh);

      // Candle-style light fixture at end of arm
      const candleBaseGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.08, 12);
      const candleBaseMesh = new THREE.Mesh(candleBaseGeometry, frameMaterial);
      candleBaseMesh.position.set(
        Math.cos(angle) * radius,
        -0.35,
        Math.sin(angle) * radius
      );
      group.add(candleBaseMesh);

      // Light bulb (candle flame style)
      const bulbGeometry = new THREE.SphereGeometry(0.025, 12, 12);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA,
        transparent: true,
        opacity: 0.9
      });
      const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulbMesh.position.set(
        Math.cos(angle) * radius,
        -0.28,
        Math.sin(angle) * radius
      );
      group.add(bulbMesh);

      // Realistic crystal drops hanging from each light
      const crystalConfigs = [
        { offset: 0, size: 0.025, length: 0.12 },
        { offset: 0.06, size: 0.02, length: 0.1 },
        { offset: -0.06, size: 0.02, length: 0.1 },
        { offset: 0.03, size: 0.018, length: 0.08 }
      ];

      crystalConfigs.forEach((config, j) => {
        const crystalGeometry = new THREE.ConeGeometry(config.size, config.length, 8);
        const crystalMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.95,
          transmission: 0.9,
          roughness: 0.0,
          metalness: 0.0,
          reflectivity: 1.0,
          ior: 2.4
        });
        const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);

        const offsetAngle = angle + config.offset * 0.1;
        crystalMesh.position.set(
          Math.cos(offsetAngle) * (radius + config.offset * 0.3),
          -0.45 - j * 0.03,
          Math.sin(offsetAngle) * (radius + config.offset * 0.3)
        );

        crystalMesh.rotation.z = (Math.random() - 0.5) * 0.1;
        group.add(crystalMesh);
      });
    }

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateEmpireCrystalChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Empire style tiered structure
    const tiers = [
      { radius: 0.6, height: 0.8, crystals: 8 },
      { radius: 0.9, height: 0.4, crystals: 12 },
      { radius: 1.2, height: 0.0, crystals: 14 }
    ];

    tiers.forEach((tier, tierIndex) => {
      // Tier frame
      const frameGeometry = new THREE.TorusGeometry(tier.radius, 0.03, 8, 16);
      const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFD700,
        shininess: 100
      });
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
      frameMesh.position.y = tier.height;
      group.add(frameMesh);

      // Crystals for this tier
      for (let i = 0; i < tier.crystals; i++) {
        const angle = (i / tier.crystals) * Math.PI * 2;

        // Large crystal drops
        const crystalGeometry = new THREE.ConeGeometry(0.04, 0.2, 6);
        const crystalMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          shininess: 100
        });
        const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystalMesh.position.set(
          Math.cos(angle) * tier.radius,
          tier.height - 0.2,
          Math.sin(angle) * tier.radius
        );
        group.add(crystalMesh);
      }
    });

    // Central column
    const columnGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8);
    const columnMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const columnMesh = new THREE.Mesh(columnGeometry, columnMaterial);
    columnMesh.position.y = 0.4;
    group.add(columnMesh);

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generate2TierPendantChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Upper tier
    const upperRadius = 0.4;
    const upperFrameGeometry = new THREE.TorusGeometry(upperRadius, 0.02, 8, 16);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFD700,
      shininess: 100
    });
    const upperFrameMesh = new THREE.Mesh(upperFrameGeometry, frameMaterial);
    upperFrameMesh.position.y = 0.3;
    group.add(upperFrameMesh);

    // Lower tier
    const lowerRadius = 0.6;
    const lowerFrameMesh = new THREE.Mesh(upperFrameGeometry.clone(), frameMaterial);
    lowerFrameMesh.scale.setScalar(lowerRadius / upperRadius);
    lowerFrameMesh.position.y = -0.1;
    group.add(lowerFrameMesh);

    // Crystals on both tiers
    [
      { radius: upperRadius, y: 0.3, count: 6 },
      { radius: lowerRadius, y: -0.1, count: 8 }
    ].forEach(tier => {
      for (let i = 0; i < tier.count; i++) {
        const angle = (i / tier.count) * Math.PI * 2;

        const crystalGeometry = new THREE.TetrahedronGeometry(0.03);
        const crystalMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          shininess: 100
        });
        const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystalMesh.position.set(
          Math.cos(angle) * tier.radius,
          tier.y - 0.1,
          Math.sin(angle) * tier.radius
        );
        group.add(crystalMesh);
      }
    });

    // Connecting chains
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const chainGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.4, 6);
      const chainMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
      const chainMesh = new THREE.Mesh(chainGeometry, chainMaterial);
      chainMesh.position.set(
        Math.cos(angle) * 0.5,
        0.1,
        Math.sin(angle) * 0.5
      );
      group.add(chainMesh);
    }

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateGlobeCrystalChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Spherical frame structure
    const sphereRadius = 0.8;

    // Outer sphere wireframe
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 12);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFD700,
      wireframe: true,
      shininess: 100
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphereMesh);

    // Crystal elements positioned on sphere surface
    for (let i = 0; i < 20; i++) {
      const phi = Math.acos(-1 + (2 * i) / 20);
      const theta = Math.sqrt(20 * Math.PI) * phi;

      const x = sphereRadius * Math.cos(theta) * Math.sin(phi);
      const y = sphereRadius * Math.cos(phi);
      const z = sphereRadius * Math.sin(theta) * Math.sin(phi);

      const crystalGeometry = new THREE.OctahedronGeometry(0.04);
      const crystalMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        shininess: 100
      });
      const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystalMesh.position.set(x, y, z);
      group.add(crystalMesh);
    }

    // Central light source
    const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
    group.add(lightMesh);

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generate18LightCrystalChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Large circular frame for 18 lights
    const mainRadius = 1.6;
    const frameGeometry = new THREE.TorusGeometry(mainRadius, 0.05, 8, 32);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFD700,
      shininess: 100
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    group.add(frameMesh);

    // 18 light positions
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;

      // Light socket
      const socketGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
      const socketMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
      const socketMesh = new THREE.Mesh(socketGeometry, socketMaterial);
      socketMesh.position.set(
        Math.cos(angle) * mainRadius,
        -0.1,
        Math.sin(angle) * mainRadius
      );
      group.add(socketMesh);

      // Crystal cascade for each light
      for (let j = 0; j < 5; j++) {
        const crystalGeometry = new THREE.ConeGeometry(0.02, 0.08, 6);
        const crystalMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          shininess: 100
        });
        const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystalMesh.position.set(
          Math.cos(angle) * mainRadius,
          -0.2 - j * 0.06,
          Math.sin(angle) * mainRadius
        );
        group.add(crystalMesh);
      }
    }

    // Inner ring of crystals
    const innerRadius = 0.8;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const crystalGeometry = new THREE.DiamondGeometry ? new THREE.DiamondGeometry(0.03) : new THREE.OctahedronGeometry(0.03);
      const crystalMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        shininess: 100
      });
      const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystalMesh.position.set(
        Math.cos(angle) * innerRadius,
        -0.3,
        Math.sin(angle) * innerRadius
      );
      group.add(crystalMesh);
    }

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateBlackCrystalDrumChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Black drum shade
    const drumRadius = 1.0;
    const drumHeight = 0.4;

    // Outer drum
    const drumGeometry = new THREE.CylinderGeometry(drumRadius, drumRadius, drumHeight, 32, 1, true);
    const drumMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      side: THREE.DoubleSide
    });
    const drumMesh = new THREE.Mesh(drumGeometry, drumMaterial);
    group.add(drumMesh);

    // Top and bottom of drum
    const topGeometry = new THREE.CircleGeometry(drumRadius, 32);
    const topMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });

    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = drumHeight / 2;
    topMesh.rotation.x = -Math.PI / 2;
    group.add(topMesh);

    const bottomMesh = new THREE.Mesh(topGeometry, topMaterial);
    bottomMesh.position.y = -drumHeight / 2;
    bottomMesh.rotation.x = Math.PI / 2;
    group.add(bottomMesh);

    // Crystal elements inside drum
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 0.6;

      // Light bulb
      const bulbGeometry = new THREE.SphereGeometry(0.03, 8, 8);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulbMesh.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      group.add(bulbMesh);

      // Crystal strands
      for (let j = 0; j < 3; j++) {
        const crystalGeometry = new THREE.SphereGeometry(0.015, 8, 8);
        const crystalMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          shininess: 100
        });
        const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystalMesh.position.set(
          Math.cos(angle) * (radius - j * 0.1),
          -0.1 - j * 0.05,
          Math.sin(angle) * (radius - j * 0.1)
        );
        group.add(crystalMesh);
      }
    }

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateModernLEDWallSconce(): Model3DConfig {
    const group = new THREE.Group();

    // Main sconce body - rectangular modern design
    const bodyGeometry = new THREE.BoxGeometry(0.1, 0.9, 0.15);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 50
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.z = -0.075;
    group.add(bodyMesh);

    // LED light strip
    const ledGeometry = new THREE.BoxGeometry(0.02, 0.8, 0.02);
    const ledMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);
    ledMesh.position.z = 0.01;
    group.add(ledMesh);

    // Light diffusion effect
    const diffuserGeometry = new THREE.PlaneGeometry(0.08, 0.85);
    const diffuserMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3
    });
    const diffuserMesh = new THREE.Mesh(diffuserGeometry, diffuserMaterial);
    diffuserMesh.position.z = 0.02;
    group.add(diffuserMesh);

    // Mounting bracket
    const bracketGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8);
    const bracketMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const bracketMesh = new THREE.Mesh(bracketGeometry, bracketMaterial);
    bracketMesh.rotation.x = Math.PI / 2;
    bracketMesh.position.z = -0.125;
    group.add(bracketMesh);

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateBlackGlassDrumChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Black glass drum shade
    const drumRadius = 0.9;
    const drumHeight = 0.5;

    // Glass drum with transparency
    const drumGeometry = new THREE.CylinderGeometry(drumRadius, drumRadius, drumHeight, 32, 1, true);
    const drumMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a2a2a,
      transparent: true,
      opacity: 0.7,
      shininess: 100,
      side: THREE.DoubleSide
    });
    const drumMesh = new THREE.Mesh(drumGeometry, drumMaterial);
    group.add(drumMesh);

    // Metal frame
    const frameGeometry = new THREE.TorusGeometry(drumRadius, 0.02, 8, 32);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 80
    });

    // Top frame
    const topFrameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    topFrameMesh.position.y = drumHeight / 2;
    group.add(topFrameMesh);

    // Bottom frame
    const bottomFrameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    bottomFrameMesh.position.y = -drumHeight / 2;
    group.add(bottomFrameMesh);

    // 6 internal lights
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 0.5;

      // Light source
      const lightGeometry = new THREE.SphereGeometry(0.025, 8, 8);
      const lightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      });
      const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
      lightMesh.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      group.add(lightMesh);

      // Light fixture
      const fixtureGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8);
      const fixtureMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
      const fixtureMesh = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixtureMesh.position.set(
        Math.cos(angle) * radius,
        0.08,
        Math.sin(angle) * radius
      );
      group.add(fixtureMesh);
    }

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateBrushedBrassChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Brushed brass finish
    const brassColor = 0xB5651D;

    // Main circular frame
    const frameRadius = 1.0;
    const frameGeometry = new THREE.TorusGeometry(frameRadius, 0.04, 8, 32);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: brassColor,
      shininess: 60,
      roughness: 0.3
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    group.add(frameMesh);

    // 5 light arms extending from center
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;

      // Arm
      const armGeometry = new THREE.CylinderGeometry(0.02, 0.02, frameRadius, 8);
      const armMaterial = new THREE.MeshPhongMaterial({ color: brassColor });
      const armMesh = new THREE.Mesh(armGeometry, armMaterial);
      armMesh.rotation.z = Math.PI / 2;
      armMesh.position.set(
        Math.cos(angle) * frameRadius / 2,
        0,
        Math.sin(angle) * frameRadius / 2
      );
      armMesh.rotation.y = angle;
      group.add(armMesh);

      // Light socket at end of arm
      const socketGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
      const socketMesh = new THREE.Mesh(socketGeometry, armMaterial);
      socketMesh.position.set(
        Math.cos(angle) * frameRadius,
        -0.1,
        Math.sin(angle) * frameRadius
      );
      group.add(socketMesh);

      // Decorative candle-style bulb
      const bulbGeometry = new THREE.SphereGeometry(0.025, 8, 8);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff8dc,
        transparent: true,
        opacity: 0.8
      });
      const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulbMesh.position.set(
        Math.cos(angle) * frameRadius,
        -0.05,
        Math.sin(angle) * frameRadius
      );
      group.add(bulbMesh);
    }

    // Central decorative element
    const centerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const centerMaterial = new THREE.MeshPhongMaterial({ color: brassColor });
    const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
    group.add(centerMesh);

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  static generateFarmhouseCrystalChandelier(): Model3DConfig {
    const group = new THREE.Group();

    // Black metal farmhouse frame
    const frameColor = 0x2a2a2a;

    // Main circular frame
    const frameRadius = 1.0;
    const frameGeometry = new THREE.TorusGeometry(frameRadius, 0.03, 8, 32);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: frameColor,
      shininess: 30
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    group.add(frameMesh);

    // 5 rustic light fixtures
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;

      // Rustic candle holder style
      const holderGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.12, 8);
      const holderMaterial = new THREE.MeshPhongMaterial({ color: frameColor });
      const holderMesh = new THREE.Mesh(holderGeometry, holderMaterial);
      holderMesh.position.set(
        Math.cos(angle) * frameRadius,
        -0.1,
        Math.sin(angle) * frameRadius
      );
      group.add(holderMesh);

      // Crystal accents - farmhouse style
      const crystalGeometry = new THREE.TetrahedronGeometry(0.025);
      const crystalMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });

      // Multiple crystals per light
      for (let j = 0; j < 3; j++) {
        const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystalMesh.position.set(
          Math.cos(angle) * frameRadius + (Math.random() - 0.5) * 0.1,
          -0.2 - j * 0.05,
          Math.sin(angle) * frameRadius + (Math.random() - 0.5) * 0.1
        );
        group.add(crystalMesh);
      }

      // Warm light bulb
      const bulbGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff8dc,
        transparent: true,
        opacity: 0.9
      });
      const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulbMesh.position.set(
        Math.cos(angle) * frameRadius,
        -0.05,
        Math.sin(angle) * frameRadius
      );
      group.add(bulbMesh);
    }

    // Rustic chain for hanging
    const chainGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6);
    const chainMaterial = new THREE.MeshPhongMaterial({ color: frameColor });
    const chainMesh = new THREE.Mesh(chainGeometry, chainMaterial);
    chainMesh.position.y = 0.5;
    group.add(chainMesh);

    return {
      geometry: group as any,
      material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    };
  }
}
