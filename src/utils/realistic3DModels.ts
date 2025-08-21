import * as THREE from 'three';
import { Product } from '../types';

export interface Realistic3DConfig {
  geometry: THREE.BufferGeometry | THREE.Group;
  materials: THREE.Material[];
  lights: THREE.Light[];
  scale: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  animations?: {
    type: 'rotation' | 'floating' | 'pulsing';
    speed: number;
    amplitude: number;
  }[];
}

export class RealisticLightingModels {
  
  // Create realistic crystal chandelier
  static createCrystalChandelier(product: Product): Realistic3DConfig {
    const group = new THREE.Group();
    const materials: THREE.Material[] = [];
    const lights: THREE.Light[] = [];

    // Main body - ornate gold frame
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 12);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFFD700,
      metalness: 0.95,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);
    materials.push(bodyMaterial);

    // Decorative rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(0.5 + i * 0.1, 0.03, 8, 32);
      const ringMesh = new THREE.Mesh(ringGeometry, bodyMaterial);
      ringMesh.position.y = -0.3 - i * 0.4;
      ringMesh.castShadow = true;
      group.add(ringMesh);
    }

    // Crystal drops - multiple tiers
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      roughness: 0,
      metalness: 0,
      clearcoat: 1,
      transmission: 0.95,
      ior: 2.4,
      thickness: 0.1
    });
    materials.push(crystalMaterial);

    // First tier - large crystals
    for (let i = 0; i < 12; i++) {
      const crystal = new THREE.OctahedronGeometry(0.08, 1);
      const crystalMesh = new THREE.Mesh(crystal, crystalMaterial);
      
      const angle = (i / 12) * Math.PI * 2;
      crystalMesh.position.x = Math.cos(angle) * 0.7;
      crystalMesh.position.z = Math.sin(angle) * 0.7;
      crystalMesh.position.y = -0.5;
      crystalMesh.rotation.y = angle;
      crystalMesh.castShadow = true;
      
      group.add(crystalMesh);
    }

    // Second tier - medium crystals
    for (let i = 0; i < 18; i++) {
      const crystal = new THREE.OctahedronGeometry(0.06, 1);
      const crystalMesh = new THREE.Mesh(crystal, crystalMaterial);
      
      const angle = (i / 18) * Math.PI * 2;
      crystalMesh.position.x = Math.cos(angle) * 0.9;
      crystalMesh.position.z = Math.sin(angle) * 0.9;
      crystalMesh.position.y = -0.9;
      crystalMesh.rotation.y = angle;
      crystalMesh.castShadow = true;
      
      group.add(crystalMesh);
    }

    // Third tier - small crystals
    for (let i = 0; i < 24; i++) {
      const crystal = new THREE.OctahedronGeometry(0.04, 1);
      const crystalMesh = new THREE.Mesh(crystal, crystalMaterial);
      
      const angle = (i / 24) * Math.PI * 2;
      crystalMesh.position.x = Math.cos(angle) * 1.1;
      crystalMesh.position.z = Math.sin(angle) * 1.1;
      crystalMesh.position.y = -1.3;
      crystalMesh.rotation.y = angle;
      crystalMesh.castShadow = true;
      
      group.add(crystalMesh);
    }

    // LED light sources
    for (let i = 0; i < 8; i++) {
      const light = new THREE.PointLight(0xffffff, 0.8, 8);
      const angle = (i / 8) * Math.PI * 2;
      light.position.x = Math.cos(angle) * 0.5;
      light.position.z = Math.sin(angle) * 0.5;
      light.position.y = 0;
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      
      group.add(light);
      lights.push(light);
    }

    // Central main light
    const mainLight = new THREE.PointLight(0xffffff, 1.5, 12);
    mainLight.position.set(0, 0, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    group.add(mainLight);
    lights.push(mainLight);

    return {
      geometry: group,
      materials,
      lights,
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      animations: [
        {
          type: 'floating',
          speed: 0.5,
          amplitude: 0.02
        },
        {
          type: 'rotation',
          speed: 0.1,
          amplitude: 0.02
        }
      ]
    };
  }

  // Create modern LED chandelier
  static createModernLEDChandelier(product: Product): Realistic3DConfig {
    const group = new THREE.Group();
    const materials: THREE.Material[] = [];
    const lights: THREE.Light[] = [];

    // Main frame - sleek black metal
    const frameMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2a,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2
    });
    materials.push(frameMaterial);

    // Outer ring
    const outerRing = new THREE.TorusGeometry(0.8, 0.05, 8, 32);
    const outerRingMesh = new THREE.Mesh(outerRing, frameMaterial);
    outerRingMesh.castShadow = true;
    group.add(outerRingMesh);

    // Inner rings
    for (let i = 1; i <= 3; i++) {
      const ring = new THREE.TorusGeometry(0.6 - i * 0.15, 0.03, 6, 24);
      const ringMesh = new THREE.Mesh(ring, frameMaterial);
      ringMesh.position.y = -i * 0.2;
      ringMesh.castShadow = true;
      group.add(ringMesh);
    }

    // LED strips
    const ledMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    materials.push(ledMaterial);

    // LED strip on each ring
    for (let ring = 0; ring <= 3; ring++) {
      const radius = ring === 0 ? 0.8 : 0.6 - ring * 0.15;
      const segments = Math.floor(radius * 50);
      
      for (let i = 0; i < segments; i++) {
        const ledGeometry = new THREE.SphereGeometry(0.01, 8, 8);
        const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);
        
        const angle = (i / segments) * Math.PI * 2;
        ledMesh.position.x = Math.cos(angle) * radius;
        ledMesh.position.z = Math.sin(angle) * radius;
        ledMesh.position.y = -ring * 0.2;
        
        group.add(ledMesh);

        // Add point light for every 5th LED
        if (i % 5 === 0) {
          const light = new THREE.PointLight(0xffffff, 0.3, 3);
          light.position.copy(ledMesh.position);
          group.add(light);
          lights.push(light);
        }
      }
    }

    return {
      geometry: group,
      materials,
      lights,
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      animations: [
        {
          type: 'rotation',
          speed: 0.2,
          amplitude: 1
        }
      ]
    };
  }

  // Create wall sconce
  static createWallSconce(product: Product): Realistic3DConfig {
    const group = new THREE.Group();
    const materials: THREE.Material[] = [];
    const lights: THREE.Light[] = [];

    // Backplate
    const backplateMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 0.5
    });
    materials.push(backplateMaterial);

    const backplate = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
    const backplateMesh = new THREE.Mesh(backplate, backplateMaterial);
    backplateMesh.rotation.x = Math.PI / 2;
    backplateMesh.castShadow = true;
    group.add(backplateMesh);

    // Glass shade
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      thickness: 0.05
    });
    materials.push(glassMaterial);

    const shade = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI);
    const shadeMesh = new THREE.Mesh(shade, glassMaterial);
    shadeMesh.position.z = 0.12;
    shadeMesh.castShadow = true;
    group.add(shadeMesh);

    // Light source
    const light = new THREE.PointLight(0xffffff, 1, 5);
    light.position.set(0, 0, 0.15);
    light.castShadow = true;
    group.add(light);
    lights.push(light);

    return {
      geometry: group,
      materials,
      lights,
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    };
  }

  // Create table lamp
  static createTableLamp(product: Product): Realistic3DConfig {
    const group = new THREE.Group();
    const materials: THREE.Material[] = [];
    const lights: THREE.Light[] = [];

    // Base
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3,
      clearcoat: 0.8
    });
    materials.push(baseMaterial);

    const base = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16);
    const baseMesh = new THREE.Mesh(base, baseMaterial);
    baseMesh.position.y = -0.8;
    baseMesh.castShadow = true;
    group.add(baseMesh);

    // Stem
    const stem = new THREE.CylinderGeometry(0.015, 0.015, 1, 8);
    const stemMesh = new THREE.Mesh(stem, baseMaterial);
    stemMesh.position.y = -0.3;
    stemMesh.castShadow = true;
    group.add(stemMesh);

    // Lampshade
    const shadeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xF5F5DC,
      transparent: true,
      opacity: 0.9,
      roughness: 0.8,
      side: THREE.DoubleSide,
      transmission: 0.3
    });
    materials.push(shadeMaterial);

    const shade = new THREE.ConeGeometry(0.3, 0.5, 16, 1, true);
    const shadeMesh = new THREE.Mesh(shade, shadeMaterial);
    shadeMesh.position.y = 0.5;
    shadeMesh.castShadow = true;
    group.add(shadeMesh);

    // Light source
    const light = new THREE.PointLight(0xffffff, 0.8, 4);
    light.position.set(0, 0.4, 0);
    light.castShadow = true;
    group.add(light);
    lights.push(light);

    return {
      geometry: group,
      materials,
      lights,
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    };
  }

  // Main factory method
  static createRealisticModel(product: Product): Realistic3DConfig {
    const productName = product.name.toLowerCase();
    
    if (productName.includes('crystal') && product.category === 'Chandeliers') {
      return this.createCrystalChandelier(product);
    } else if (productName.includes('led') && product.category === 'Chandeliers') {
      return this.createModernLEDChandelier(product);
    } else if (product.category === 'Chandeliers') {
      return this.createCrystalChandelier(product);
    } else if (product.category === 'Wall Lights') {
      return this.createWallSconce(product);
    } else if (product.category === 'Table Lamps') {
      return this.createTableLamp(product);
    } else {
      // Default fallback
      return this.createModernLEDChandelier(product);
    }
  }
}
