import * as THREE from 'three';
import { DetectedObject } from './ComputerVisionService';

export interface Generated3DObject {
  mesh: THREE.Object3D;
  materials: THREE.Material[];
  boundingBox: THREE.Box3;
  metadata: {
    category: string;
    realWorldDimensions: { width: number; height: number; depth: number };
    detectedColor: string;
    material: string;
    texture: string;
  };
}

export class Object3DGenerator {
  private textureLoader: THREE.TextureLoader;
  private materialCache: Map<string, THREE.Material>;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.materialCache = new Map();
  }

  async generateObjectFromDetection(detectedObject: DetectedObject): Promise<Generated3DObject> {
    try {
      const mesh = await this.createMeshFromDetection(detectedObject);
      const materials = this.extractMaterials(mesh);
      const boundingBox = new THREE.Box3().setFromObject(mesh);

      return {
        mesh,
        materials,
        boundingBox,
        metadata: {
          category: detectedObject.category,
          realWorldDimensions: detectedObject.dimensions,
          detectedColor: detectedObject.color,
          material: detectedObject.material,
          texture: detectedObject.texture || 'smooth'
        }
      };
    } catch (error) {
      console.error('Failed to generate 3D object:', error);
      throw error;
    }
  }

  private async createMeshFromDetection(detectedObject: DetectedObject): Promise<THREE.Object3D> {
    const { category, dimensions, color, material, texture } = detectedObject;
    
    switch (category.toLowerCase()) {
      case 'sofa':
        return this.createSofa(dimensions, color, material, texture);
      case 'chair':
        return this.createChair(dimensions, color, material, texture);
      case 'table':
      case 'coffee_table':
        return this.createTable(dimensions, color, material, texture);
      case 'bed':
        return this.createBed(dimensions, color, material, texture);
      case 'floor_lamp':
        return this.createFloorLamp(dimensions, color, material, texture);
      case 'table_lamp':
        return this.createTableLamp(dimensions, color, material, texture);
      case 'ceiling_light':
      case 'chandelier':
        return this.createCeilingLight(dimensions, color, material, texture);
      case 'bookshelf':
        return this.createBookshelf(dimensions, color, material, texture);
      case 'tv_stand':
        return this.createTVStand(dimensions, color, material, texture);
      default:
        return this.createGenericObject(dimensions, color, material, texture);
    }
  }

  private createSofa(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.6, dimensions.depth);
    const bodyMaterial = this.createMaterial(color, material, texture);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = dimensions.height * 0.3;
    body.castShadow = true;
    body.receiveShadow = true;
    
    // Backrest
    const backGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.7, dimensions.depth * 0.15);
    const backMaterial = this.createMaterial(color, material, texture);
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, dimensions.height * 0.65, -dimensions.depth * 0.35);
    back.castShadow = true;
    back.receiveShadow = true;
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(dimensions.width * 0.15, dimensions.height * 0.5, dimensions.depth);
    const armMaterial = this.createMaterial(color, material, texture);
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-dimensions.width * 0.425, dimensions.height * 0.5, 0);
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(dimensions.width * 0.425, dimensions.height * 0.5, 0);
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, dimensions.height * 0.3);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Wood color
    
    const legPositions = [
      [-dimensions.width * 0.4, dimensions.height * 0.15, -dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.15, -dimensions.depth * 0.4],
      [-dimensions.width * 0.4, dimensions.height * 0.15, dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.15, dimensions.depth * 0.4]
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      leg.receiveShadow = true;
      group.add(leg);
    });
    
    group.add(body, back, leftArm, rightArm);
    return group;
  }

  private createChair(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.1, dimensions.depth);
    const seatMaterial = this.createMaterial(color, material, texture);
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = dimensions.height * 0.5;
    seat.castShadow = true;
    seat.receiveShadow = true;
    
    // Backrest
    const backGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.4, dimensions.depth * 0.1);
    const backMaterial = this.createMaterial(color, material, texture);
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, dimensions.height * 0.75, -dimensions.depth * 0.45);
    back.castShadow = true;
    back.receiveShadow = true;
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, dimensions.height * 0.5);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    const legPositions = [
      [-dimensions.width * 0.4, dimensions.height * 0.25, -dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.25, -dimensions.depth * 0.4],
      [-dimensions.width * 0.4, dimensions.height * 0.25, dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.25, dimensions.depth * 0.4]
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      leg.receiveShadow = true;
      group.add(leg);
    });
    
    group.add(seat, back);
    return group;
  }

  private createTable(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();
    
    // Tabletop
    const topGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.1, dimensions.depth);
    const topMaterial = this.createMaterial(color, material, texture);
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = dimensions.height * 0.95;
    top.castShadow = true;
    top.receiveShadow = true;
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, dimensions.height * 0.9);
    const legMaterial = this.createMaterial(this.darkenColor(color), material, texture);
    
    const legPositions = [
      [-dimensions.width * 0.4, dimensions.height * 0.45, -dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.45, -dimensions.depth * 0.4],
      [-dimensions.width * 0.4, dimensions.height * 0.45, dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.45, dimensions.depth * 0.4]
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      leg.receiveShadow = true;
      group.add(leg);
    });
    
    group.add(top);
    return group;
  }

  private createFloorLamp(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(dimensions.width * 0.8, dimensions.width, dimensions.height * 0.1);
    const baseMaterial = this.createMaterial(this.darkenColor(color), material, texture);
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = dimensions.height * 0.05;
    base.castShadow = true;
    base.receiveShadow = true;
    
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, dimensions.height * 0.7);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = dimensions.height * 0.45;
    pole.castShadow = true;
    
    // Lampshade
    const shadeGeometry = new THREE.ConeGeometry(dimensions.width * 0.6, dimensions.height * 0.2, 8);
    const shadeMaterial = this.createMaterial(color, 'fabric', 'smooth');
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.position.y = dimensions.height * 0.85;
    shade.castShadow = true;
    shade.receiveShadow = true;
    
    // Light source
    const light = new THREE.PointLight(0xffffff, 0.8, 10);
    light.position.set(0, dimensions.height * 0.8, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    
    group.add(base, pole, shade, light);
    return group;
  }

  private createTableLamp(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(dimensions.width * 0.8, dimensions.width, dimensions.height * 0.3);
    const baseMaterial = this.createMaterial(color, material, texture);
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = dimensions.height * 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    
    // Lampshade
    const shadeGeometry = new THREE.ConeGeometry(dimensions.width * 0.9, dimensions.height * 0.4, 8);
    const shadeMaterial = this.createMaterial(this.lightenColor(color), 'fabric', 'smooth');
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.position.y = dimensions.height * 0.7;
    shade.castShadow = true;
    shade.receiveShadow = true;
    
    // Light source
    const light = new THREE.PointLight(0xffffff, 0.6, 8);
    light.position.set(0, dimensions.height * 0.6, 0);
    light.castShadow = true;
    
    group.add(base, shade, light);
    return group;
  }

  private createCeilingLight(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();
    
    // Main fixture
    const fixtureGeometry = new THREE.CylinderGeometry(dimensions.width, dimensions.width * 0.8, dimensions.height);
    const fixtureMaterial = this.createMaterial(color, material, texture);
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    fixture.castShadow = true;
    fixture.receiveShadow = true;
    
    // Crystal elements (if chandelier)
    if (material === 'crystal' || color.includes('crystal')) {
      const crystalGeometry = new THREE.SphereGeometry(0.05, 8, 6);
      const crystalMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.8,
        shininess: 100
      });
      
      for (let i = 0; i < 12; i++) {
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        const angle = (i / 12) * Math.PI * 2;
        crystal.position.set(
          Math.cos(angle) * dimensions.width * 0.6,
          -dimensions.height * 0.3,
          Math.sin(angle) * dimensions.width * 0.6
        );
        group.add(crystal);
      }
    }
    
    // Light source
    const light = new THREE.PointLight(0xffffff, 1.2, 15);
    light.position.set(0, -dimensions.height * 0.2, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    
    group.add(fixture, light);
    return group;
  }

  private createBed(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();

    // Mattress
    const mattressGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.3, dimensions.depth);
    const mattressMaterial = this.createMaterial(color, 'fabric', 'soft');
    const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattress.position.y = dimensions.height * 0.4;
    mattress.castShadow = true;
    mattress.receiveShadow = true;

    // Bed frame
    const frameGeometry = new THREE.BoxGeometry(dimensions.width * 1.1, dimensions.height * 0.2, dimensions.depth * 1.1);
    const frameMaterial = this.createMaterial(this.darkenColor(color), material, texture);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = dimensions.height * 0.2;
    frame.castShadow = true;
    frame.receiveShadow = true;

    // Headboard
    const headboardGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.8, dimensions.depth * 0.1);
    const headboardMaterial = this.createMaterial(color, material, texture);
    const headboard = new THREE.Mesh(headboardGeometry, headboardMaterial);
    headboard.position.set(0, dimensions.height * 0.6, -dimensions.depth * 0.55);
    headboard.castShadow = true;
    headboard.receiveShadow = true;

    group.add(mattress, frame, headboard);
    return group;
  }

  private createBookshelf(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();

    // Main structure
    const backGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth * 0.1);
    const backMaterial = this.createMaterial(color, material, texture);
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.z = -dimensions.depth * 0.45;
    back.castShadow = true;
    back.receiveShadow = true;

    // Shelves
    const shelfGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height * 0.05, dimensions.depth);
    const shelfMaterial = this.createMaterial(color, material, texture);

    const numShelves = Math.floor(dimensions.height / 0.4) + 1;
    for (let i = 0; i < numShelves; i++) {
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.position.y = -dimensions.height * 0.5 + (i * dimensions.height / (numShelves - 1));
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      group.add(shelf);
    }

    // Side panels
    const sideGeometry = new THREE.BoxGeometry(dimensions.width * 0.05, dimensions.height, dimensions.depth);
    const sideMaterial = this.createMaterial(color, material, texture);

    const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
    leftSide.position.x = -dimensions.width * 0.475;
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;

    const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
    rightSide.position.x = dimensions.width * 0.475;
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;

    group.add(back, leftSide, rightSide);
    return group;
  }

  private createTVStand(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const group = new THREE.Group();

    // Main cabinet
    const cabinetGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
    const cabinetMaterial = this.createMaterial(color, material, texture);
    const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
    cabinet.position.y = dimensions.height * 0.5;
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, dimensions.height * 0.3);
    const legMaterial = this.createMaterial(this.darkenColor(color), material, texture);

    const legPositions = [
      [-dimensions.width * 0.4, dimensions.height * 0.15, -dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.15, -dimensions.depth * 0.4],
      [-dimensions.width * 0.4, dimensions.height * 0.15, dimensions.depth * 0.4],
      [dimensions.width * 0.4, dimensions.height * 0.15, dimensions.depth * 0.4]
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      leg.receiveShadow = true;
      group.add(leg);
    });

    group.add(cabinet);
    return group;
  }

  private createGenericObject(
    dimensions: { width: number; height: number; depth: number },
    color: string,
    material: string,
    texture?: string
  ): THREE.Object3D {
    const geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
    const materialObj = this.createMaterial(color, material, texture);
    const mesh = new THREE.Mesh(geometry, materialObj);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private createMaterial(color: string, materialType: string, texture?: string): THREE.Material {
    const cacheKey = `${color}_${materialType}_${texture}`;

    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }

    let material: THREE.Material;
    const colorValue = new THREE.Color(color);

    switch (materialType.toLowerCase()) {
      case 'fabric':
        material = new THREE.MeshLambertMaterial({
          color: colorValue,
          roughness: 0.8,
          metalness: 0.1
        });
        break;
      case 'wood':
        material = new THREE.MeshLambertMaterial({
          color: colorValue,
          roughness: 0.7,
          metalness: 0.0
        });
        break;
      case 'metal':
        material = new THREE.MeshPhongMaterial({
          color: colorValue,
          shininess: 100,
          specular: 0x222222
        });
        break;
      case 'glass':
        material = new THREE.MeshPhongMaterial({
          color: colorValue,
          transparent: true,
          opacity: 0.8,
          shininess: 100
        });
        break;
      case 'ceramic':
        material = new THREE.MeshPhongMaterial({
          color: colorValue,
          shininess: 80,
          specular: 0x111111
        });
        break;
      case 'crystal':
        material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          shininess: 100,
          specular: 0xffffff
        });
        break;
      default:
        material = new THREE.MeshLambertMaterial({ color: colorValue });
    }

    this.materialCache.set(cacheKey, material);
    return material;
  }

  private extractMaterials(object: THREE.Object3D): THREE.Material[] {
    const materials: THREE.Material[] = [];

    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          materials.push(...child.material);
        } else {
          materials.push(child.material);
        }
      }
    });

    return materials;
  }

  private darkenColor(color: string): string {
    const colorObj = new THREE.Color(color);
    colorObj.multiplyScalar(0.7);
    return `#${colorObj.getHexString()}`;
  }

  private lightenColor(color: string): string {
    const colorObj = new THREE.Color(color);
    colorObj.lerp(new THREE.Color(0xffffff), 0.3);
    return `#${colorObj.getHexString()}`;
  }

  dispose(): void {
    this.materialCache.forEach(material => {
      material.dispose();
    });
    this.materialCache.clear();
  }
}
