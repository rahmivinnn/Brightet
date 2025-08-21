import React, { useRef, useEffect, useState } from 'react';
import { Product } from '../types';
import * as THREE from 'three';

interface BasicRoomTestProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const BasicRoomTest: React.FC<BasicRoomTestProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [roomType, setRoomType] = useState<'dining' | 'living' | 'bedroom'>('dining');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'evening' | 'night'>('day');

  console.log('BasicRoomTest render:', { product: product?.name, isOpen });

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(800, 600);
    renderer.setClearColor(0x87CEEB);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Create room
    createRoom(scene, roomType);

    // Add product
    addProduct(scene, product);

    // Lighting based on time
    addLighting(scene, timeOfDay);

    // Camera position
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    // Mouse controls
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      targetX = mouseX * 2;
      targetY = mouseY * 2;
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth camera movement
      camera.position.x += (targetX * 10 - camera.position.x) * 0.05;
      camera.position.y += (targetY * 5 + 6 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Rotate chandelier if it's a chandelier
      if (product.category === 'Chandeliers') {
        const chandelier = scene.getObjectByName('product');
        if (chandelier) {
          chandelier.rotation.y += 0.01;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, product, roomType, timeOfDay]);

  const createRoom = (scene: THREE.Scene, type: string) => {
    // Realistic hardwood floor with texture
    const floorGeometry = new THREE.PlaneGeometry(20, 20, 10, 10);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: type === 'dining' ? 0x8B7355 : type === 'living' ? 0xA0826D : 0xD2B48C,
      shininess: 30,
      specular: 0x111111
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add floor planks detail
    for (let i = 0; i < 10; i++) {
      const plankGeometry = new THREE.PlaneGeometry(20, 0.05);
      const plankMaterial = new THREE.MeshPhongMaterial({
        color: type === 'dining' ? 0x654321 : type === 'living' ? 0x8B6914 : 0xA0826D,
        shininess: 20
      });
      const plank = new THREE.Mesh(plankGeometry, plankMaterial);
      plank.rotation.x = -Math.PI / 2;
      plank.position.set(0, -1.99, -9 + (i * 2));
      scene.add(plank);
    }

    // Realistic walls with baseboards
    const wallMaterial = new THREE.MeshPhongMaterial({
      color: type === 'dining' ? 0xF5F5DC : type === 'living' ? 0xF0F0F0 : 0xE6E6FA,
      shininess: 10
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), wallMaterial);
    backWall.position.set(0, 4, -10);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 4, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Add baseboards
    const baseboardMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 50 });

    // Back wall baseboard
    const backBaseboard = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 0.1), baseboardMaterial);
    backBaseboard.position.set(0, -1.85, -9.95);
    backBaseboard.castShadow = true;
    scene.add(backBaseboard);

    // Left wall baseboard
    const leftBaseboard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 20), baseboardMaterial);
    leftBaseboard.position.set(-9.95, -1.85, 0);
    leftBaseboard.castShadow = true;
    scene.add(leftBaseboard);

    // Crown molding on ceiling
    const crownMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFF0, shininess: 60 });
    const backCrown = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 0.2), crownMaterial);
    backCrown.position.set(0, 9.9, -9.9);
    backCrown.castShadow = true;
    scene.add(backCrown);

    // Ceiling with subtle texture
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20, 5, 5);
    const ceilingMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      shininess: 5
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 10;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Add realistic furniture based on room type
    if (type === 'dining') {
      createDiningRoomFurniture(scene);
    } else if (type === 'living') {
      createLivingRoomFurniture(scene);
    } else if (type === 'bedroom') {
      createBedroomFurniture(scene);
    }
  };

  // Create realistic dining room furniture
  const createDiningRoomFurniture = (scene: THREE.Scene) => {
    // Elegant dining table with wood grain
    const tableTopGeometry = new THREE.BoxGeometry(4.5, 0.12, 2.5);
    const tableMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      shininess: 80,
      specular: 0x222222
    });
    const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
    tableTop.position.set(0, -1.44, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    scene.add(tableTop);

    // Ornate table legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 12);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x654321, shininess: 60 });
    const legPositions = [[-1.8, -1.9, -1.0], [1.8, -1.9, -1.0], [-1.8, -1.9, 1.0], [1.8, -1.9, 1.0]];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      scene.add(leg);

      // Decorative leg caps
      const capGeometry = new THREE.SphereGeometry(0.12, 8, 6);
      const cap = new THREE.Mesh(capGeometry, legMaterial);
      cap.position.set(pos[0], pos[1] + 0.6, pos[2]);
      cap.castShadow = true;
      scene.add(cap);
    });

    // Dining chairs
    const chairPositions = [
      [-2.8, 0], [2.8, 0], [0, -3.2], [0, 3.2],
      [-1.4, -3.2], [1.4, -3.2]
    ];

    chairPositions.forEach(([x, z]) => {
      createDiningChair(scene, x, z);
    });

    // Sideboard/buffet
    const sideboardGeometry = new THREE.BoxGeometry(3, 1.5, 0.8);
    const sideboardMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      shininess: 70
    });
    const sideboard = new THREE.Mesh(sideboardGeometry, sideboardMaterial);
    sideboard.position.set(-6, -1.25, -8);
    sideboard.castShadow = true;
    sideboard.receiveShadow = true;
    scene.add(sideboard);

    // Decorative vase on sideboard
    const vaseGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 12);
    const vaseMaterial = new THREE.MeshPhongMaterial({
      color: 0x4169E1,
      shininess: 100
    });
    const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
    vase.position.set(-6, -0.2, -8);
    vase.castShadow = true;
    scene.add(vase);
  };

  // Create realistic dining chair
  const createDiningChair = (scene: THREE.Scene, x: number, z: number) => {
    const chairGroup = new THREE.Group();

    // Chair seat
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.5);
    const chairMaterial = new THREE.MeshPhongMaterial({
      color: 0x4A4A4A,
      shininess: 40
    });
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.y = 0.4;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Chair back
    const backGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.08);
    const back = new THREE.Mesh(backGeometry, chairMaterial);
    back.position.set(0, 0.8, -0.21);
    back.castShadow = true;
    chairGroup.add(back);

    // Chair legs
    const legGeometry = new THREE.CylinderGeometry(0.025, 0.035, 0.8, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 });
    const legPositions = [[-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2]];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      chairGroup.add(leg);
    });

    chairGroup.position.set(x, -1.5, z);
    scene.add(chairGroup);
  };

  // Create living room furniture
  const createLivingRoomFurniture = (scene: THREE.Scene) => {
    // Sectional sofa
    const sofaGeometry = new THREE.BoxGeometry(4.5, 1.2, 2);
    const sofaMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B7D6B,
      shininess: 20
    });
    const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
    sofa.position.set(-2, -1.4, 3);
    sofa.castShadow = true;
    sofa.receiveShadow = true;
    scene.add(sofa);

    // Sofa cushions
    for (let i = 0; i < 3; i++) {
      const cushionGeometry = new THREE.BoxGeometry(1.3, 0.3, 1.8);
      const cushionMaterial = new THREE.MeshPhongMaterial({
        color: 0x9B8B7A,
        shininess: 15
      });
      const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
      cushion.position.set(-2 + (i - 1) * 1.4, -0.65, 3);
      cushion.castShadow = true;
      scene.add(cushion);
    }

    // Coffee table
    const tableGeometry = new THREE.BoxGeometry(2.5, 0.1, 1.2);
    const tableMaterial = new THREE.MeshPhongMaterial({
      color: 0x654321,
      shininess: 90
    });
    const coffeeTable = new THREE.Mesh(tableGeometry, tableMaterial);
    coffeeTable.position.set(-2, -1.45, 0.5);
    coffeeTable.castShadow = true;
    coffeeTable.receiveShadow = true;
    scene.add(coffeeTable);

    // Coffee table legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x4A4A4A, shininess: 50 });
    const legPositions = [[-1, -1.7, 0.3], [1, -1.7, 0.3], [-1, -1.7, 0.7], [1, -1.7, 0.7]];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0] - 2, pos[1], pos[2]);
      leg.castShadow = true;
      scene.add(leg);
    });

    // TV stand
    const tvStandGeometry = new THREE.BoxGeometry(3.5, 0.8, 0.6);
    const tvStandMaterial = new THREE.MeshPhongMaterial({
      color: 0x2F2F2F,
      shininess: 60
    });
    const tvStand = new THREE.Mesh(tvStandGeometry, tvStandMaterial);
    tvStand.position.set(0, -1.6, -8.5);
    tvStand.castShadow = true;
    tvStand.receiveShadow = true;
    scene.add(tvStand);

    // Decorative items
    const lampGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.4, 8);
    const lampMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513, shininess: 70 });
    const decorLamp = new THREE.Mesh(lampGeometry, lampMaterial);
    decorLamp.position.set(-3, -1.05, 0.5);
    decorLamp.castShadow = true;
    scene.add(decorLamp);
  };

  // Create bedroom furniture
  const createBedroomFurniture = (scene: THREE.Scene) => {
    // Bed frame
    const bedFrameGeometry = new THREE.BoxGeometry(4, 0.3, 6);
    const bedMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      shininess: 50
    });
    const bedFrame = new THREE.Mesh(bedFrameGeometry, bedMaterial);
    bedFrame.position.set(-3, -1.65, -2);
    bedFrame.castShadow = true;
    bedFrame.receiveShadow = true;
    scene.add(bedFrame);

    // Mattress
    const mattressGeometry = new THREE.BoxGeometry(3.8, 0.4, 5.8);
    const mattressMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFFFF0,
      shininess: 10
    });
    const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattress.position.set(-3, -1.3, -2);
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    scene.add(mattress);

    // Pillows
    for (let i = 0; i < 2; i++) {
      const pillowGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.6);
      const pillowMaterial = new THREE.MeshPhongMaterial({
        color: 0xE6E6FA,
        shininess: 5
      });
      const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
      pillow.position.set(-3 + (i - 0.5) * 1, -1.0, -4.5);
      pillow.castShadow = true;
      scene.add(pillow);
    }

    // Nightstand
    const nightstandGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.8);
    const nightstandMaterial = new THREE.MeshPhongMaterial({
      color: 0x654321,
      shininess: 70
    });
    const nightstand = new THREE.Mesh(nightstandGeometry, nightstandMaterial);
    nightstand.position.set(-6.5, -1.25, -2);
    nightstand.castShadow = true;
    nightstand.receiveShadow = true;
    scene.add(nightstand);

    // Nightstand drawer handle
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, shininess: 100 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(-5.9, -1, -2);
    handle.rotation.z = Math.PI / 2;
    handle.castShadow = true;
    scene.add(handle);

    // Dresser
    const dresserGeometry = new THREE.BoxGeometry(2.5, 1.8, 0.8);
    const dresser = new THREE.Mesh(dresserGeometry, nightstandMaterial);
    dresser.position.set(2, -1.1, -8.5);
    dresser.castShadow = true;
    dresser.receiveShadow = true;
    scene.add(dresser);
  };

  const addProduct = (scene: THREE.Scene, product: Product) => {
    const productGroup = new THREE.Group();
    productGroup.name = 'product';

    if (product.category === 'Chandeliers') {
      // Create realistic chandelier based on product name
      if (product.name.includes('Crystal') || product.name.includes('Empire')) {
        createEmpireCrystalChandelier(productGroup, product);
      } else if (product.name.includes('Modern') || product.name.includes('LED')) {
        createModernLEDChandelier(productGroup, product);
      } else if (product.name.includes('Flush Mount')) {
        createFlushMountChandelier(productGroup, product);
      } else {
        createClassicChandelier(productGroup, product);
      }

      productGroup.position.set(0, 8, 0);

      // Add realistic lighting
      const mainLight = new THREE.PointLight(0xfff8dc, 2.0, 15);
      mainLight.position.set(0, 8, 0);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      scene.add(mainLight);

      // Add ambient glow
      const glowLight = new THREE.PointLight(0xfff8dc, 0.8, 25);
      glowLight.position.set(0, 8, 0);
      scene.add(glowLight);

    } else if (product.category === 'Table Lamps') {
      createRealisticTableLamp(productGroup, product);
      productGroup.position.set(-2, -1, 0);

      // Add warm table lamp light
      const lampLight = new THREE.PointLight(0xfff0dc, 1.2, 8);
      lampLight.position.set(-2, -0.2, 0);
      lampLight.castShadow = true;
      scene.add(lampLight);

    } else if (product.category === 'Wall Lights') {
      createWallSconce(productGroup, product);
      productGroup.position.set(-9, 2, -5);

      // Add wall light
      const wallLight = new THREE.PointLight(0xfff8dc, 1.0, 10);
      wallLight.position.set(-9, 2, -5);
      wallLight.castShadow = true;
      scene.add(wallLight);

    } else if (product.category === 'Pendant Lights') {
      createPendantLight(productGroup, product);
      productGroup.position.set(2, 6, 2);

      // Add pendant light
      const pendantLight = new THREE.PointLight(0xfff8dc, 1.5, 12);
      pendantLight.position.set(2, 6, 2);
      pendantLight.castShadow = true;
      scene.add(pendantLight);
    }

    scene.add(productGroup);
  };

  // Create Empire Crystal Chandelier
  const createEmpireCrystalChandelier = (group: THREE.Group, product: Product) => {
    // Main frame - ornate gold/brass structure
    const frameGeometry = new THREE.CylinderGeometry(0.8, 1.2, 1.5, 12);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Gold') ? 0xB8860B : 0xCD7F32,
      shininess: 150,
      specular: 0x444444
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    group.add(frame);

    // Ornate top canopy
    const canopyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.3, 16);
    const canopy = new THREE.Mesh(canopyGeometry, frameMaterial);
    canopy.position.y = 1.0;
    canopy.castShadow = true;
    group.add(canopy);

    // Crystal strands - multiple tiers
    for (let tier = 0; tier < 3; tier++) {
      const tierRadius = 0.6 + (tier * 0.3);
      const tierHeight = -0.3 - (tier * 0.4);
      const crystalsInTier = 16 + (tier * 4);

      for (let i = 0; i < crystalsInTier; i++) {
        const angle = (i / crystalsInTier) * Math.PI * 2;

        // Crystal drops - teardrop shape
        const crystalGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        crystalGeometry.scale(1, 1.5, 1); // Make teardrop

        const crystalMaterial = new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.9,
          shininess: 200,
          specular: 0xFFFFFF,
          refractionRatio: 0.98
        });

        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(
          Math.cos(angle) * tierRadius,
          tierHeight + Math.sin(i * 0.3) * 0.1,
          Math.sin(angle) * tierRadius
        );
        crystal.castShadow = true;
        crystal.receiveShadow = true;
        group.add(crystal);

        // Crystal connecting chains
        const chainGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.2, 4);
        const chainMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, shininess: 100 });
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        chain.position.set(
          Math.cos(angle) * tierRadius,
          tierHeight + 0.1,
          Math.sin(angle) * tierRadius
        );
        group.add(chain);
      }
    }

    // Central crystal finial
    const finialGeometry = new THREE.SphereGeometry(0.15, 12, 8);
    const finial = new THREE.Mesh(finialGeometry, new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.95,
      shininess: 200,
      specular: 0xFFFFFF
    }));
    finial.position.y = -1.2;
    finial.castShadow = true;
    group.add(finial);
  };

  // Create Modern LED Chandelier
  const createModernLEDChandelier = (group: THREE.Group, product: Product) => {
    // Sleek metal frame
    const frameGeometry = new THREE.RingGeometry(0.8, 1.0, 16);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Black') ? 0x2F2F2F : 0xC0C0C0,
      shininess: 100
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    group.add(frame);

    // LED strips
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const ledGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.3);
      const ledMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        emissive: 0x444444,
        shininess: 200
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(
        Math.cos(angle) * 0.9,
        0,
        Math.sin(angle) * 0.9
      );
      led.rotation.y = angle;
      led.castShadow = true;
      group.add(led);
    }

    // Central hub
    const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const hub = new THREE.Mesh(hubGeometry, frameMaterial);
    hub.castShadow = true;
    group.add(hub);
  };

  // Create Flush Mount Chandelier
  const createFlushMountChandelier = (group: THREE.Group, product: Product) => {
    // Main dome
    const domeGeometry = new THREE.SphereGeometry(0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Gold') ? 0xFFD700 : 0xF5F5DC,
      shininess: 80,
      transparent: true,
      opacity: 0.9
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.castShadow = true;
    dome.receiveShadow = true;
    group.add(dome);

    // Decorative rim
    const rimGeometry = new THREE.TorusGeometry(0.8, 0.05, 8, 16);
    const rimMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Gold') ? 0xB8860B : 0xC0C0C0,
      shininess: 150
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.castShadow = true;
    group.add(rim);

    // Crystal accents
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const crystalGeometry = new THREE.OctahedronGeometry(0.06);
      const crystal = new THREE.Mesh(crystalGeometry, new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8,
        shininess: 200
      }));
      crystal.position.set(
        Math.cos(angle) * 0.7,
        -0.2,
        Math.sin(angle) * 0.7
      );
      crystal.castShadow = true;
      group.add(crystal);
    }
  };

  // Create Classic Chandelier
  const createClassicChandelier = (group: THREE.Group, product: Product) => {
    // Main body with ornate details
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.0, 12);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Gold') ? 0xFFD700 : 0xC0C0C0,
      shininess: 120
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);

    // Candle arms
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;

      // Arm
      const armGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.6, 8);
      const arm = new THREE.Mesh(armGeometry, bodyMaterial);
      arm.position.set(Math.cos(angle) * 0.4, 0.2, Math.sin(angle) * 0.4);
      arm.rotation.z = Math.PI / 6;
      arm.rotation.y = angle;
      arm.castShadow = true;
      group.add(arm);

      // Candle holder
      const holderGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.1, 8);
      const holder = new THREE.Mesh(holderGeometry, bodyMaterial);
      holder.position.set(Math.cos(angle) * 0.7, 0.4, Math.sin(angle) * 0.7);
      holder.castShadow = true;
      group.add(holder);

      // Flame simulation
      const flameGeometry = new THREE.SphereGeometry(0.03, 6, 4);
      const flameMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFA500,
        transparent: true,
        opacity: 0.8
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(Math.cos(angle) * 0.7, 0.5, Math.sin(angle) * 0.7);
      flame.scale.y = 1.5;
      group.add(flame);
    }
  };

  // Create Realistic Table Lamp
  const createRealisticTableLamp = (group: THREE.Group, product: Product) => {
    // Weighted base with texture
    const baseGeometry = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 16);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Brass') ? 0xB8860B :
             product.name.includes('Chrome') ? 0xC0C0C0 : 0x8B4513,
      shininess: 100,
      bumpScale: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Lamp stem
    const stemGeometry = new THREE.CylinderGeometry(0.03, 0.04, 1.2, 12);
    const stem = new THREE.Mesh(stemGeometry, baseMaterial);
    stem.position.y = 1.0;
    stem.castShadow = true;
    group.add(stem);

    // Lamp shade - fabric texture
    const shadeGeometry = new THREE.ConeGeometry(0.5, 0.6, 16, 1, true);
    const shadeMaterial = new THREE.MeshLambertMaterial({
      color: product.name.includes('White') ? 0xFFFAF0 :
             product.name.includes('Black') ? 0x2F2F2F : 0xF5DEB3,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.position.y = 1.8;
    shade.castShadow = true;
    shade.receiveShadow = true;
    group.add(shade);

    // Inner shade for light diffusion
    const innerShadeGeometry = new THREE.ConeGeometry(0.45, 0.55, 16);
    const innerShadeMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFF0,
      transparent: true,
      opacity: 0.3
    });
    const innerShade = new THREE.Mesh(innerShadeGeometry, innerShadeMaterial);
    innerShade.position.y = 1.8;
    group.add(innerShade);

    // Decorative finial
    const finialGeometry = new THREE.SphereGeometry(0.04, 8, 6);
    const finial = new THREE.Mesh(finialGeometry, baseMaterial);
    finial.position.y = 2.2;
    finial.castShadow = true;
    group.add(finial);
  };

  // Create Wall Sconce
  const createWallSconce = (group: THREE.Group, product: Product) => {
    // Wall mount plate
    const plateGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
    const plateMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Gold') ? 0xFFD700 : 0xC0C0C0,
      shininess: 120
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.rotation.x = Math.PI / 2;
    plate.position.z = 0.1;
    plate.castShadow = true;
    group.add(plate);

    // Sconce arm
    const armGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8);
    const arm = new THREE.Mesh(armGeometry, plateMaterial);
    arm.position.set(0, 0, 0.3);
    arm.rotation.x = Math.PI / 2;
    arm.castShadow = true;
    group.add(arm);

    // Glass shade
    const shadeGeometry = new THREE.SphereGeometry(0.25, 12, 8);
    const shadeMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFFFF0,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.position.set(0, 0, 0.5);
    shade.castShadow = true;
    shade.receiveShadow = true;
    group.add(shade);
  };

  // Create Pendant Light
  const createPendantLight = (group: THREE.Group, product: Product) => {
    // Suspension cord
    const cordGeometry = new THREE.CylinderGeometry(0.01, 0.01, 2.0, 6);
    const cordMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const cord = new THREE.Mesh(cordGeometry, cordMaterial);
    cord.position.y = 1.0;
    group.add(cord);

    // Pendant shade
    const shadeGeometry = new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const shadeMaterial = new THREE.MeshPhongMaterial({
      color: product.name.includes('Copper') ? 0xB87333 :
             product.name.includes('Black') ? 0x2F2F2F : 0xC0C0C0,
      shininess: 100
    });
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.castShadow = true;
    shade.receiveShadow = true;
    group.add(shade);

    // Inner reflector
    const reflectorGeometry = new THREE.SphereGeometry(0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const reflectorMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.BackSide
    });
    const reflector = new THREE.Mesh(reflectorGeometry, reflectorMaterial);
    group.add(reflector);
  };

  const addLighting = (scene: THREE.Scene, time: string) => {
    // Remove existing lights
    const lightsToRemove = scene.children.filter(child => child instanceof THREE.Light && child.type !== 'PointLight');
    lightsToRemove.forEach(light => scene.remove(light));

    // Ambient light
    const ambientIntensity = time === 'day' ? 0.6 : time === 'evening' ? 0.4 : 0.2;
    const ambientLight = new THREE.AmbientLight(0x404040, ambientIntensity);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalIntensity = time === 'day' ? 1.0 : time === 'evening' ? 0.6 : 0.3;
    const directionalLight = new THREE.DirectionalLight(0xffffff, directionalIntensity);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-gray-600">3D Room Preview - ${product.price}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1">
          {/* Controls Panel */}
          <div className="w-64 p-4 border-r border-gray-200 bg-gray-50">
            <div className="space-y-4">
              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="dining">Dining Room</option>
                  <option value="living">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                </select>
              </div>

              {/* Time of Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Day
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['day', 'evening', 'night'] as const).map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeOfDay(time)}
                      className={`p-2 text-xs rounded capitalize ${
                        timeOfDay === time
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Product Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Category:</span> {product.category}</p>
                  <p><span className="font-medium">Brand:</span> {product.brand}</p>
                  <p><span className="font-medium">Price:</span> ${product.price}</p>
                  <p><span className="font-medium">Rating:</span> ⭐ {product.rating}/5</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Controls</h3>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>• Move mouse to rotate view</p>
                  <p>• Try different rooms & lighting</p>
                  <p>• Chandelier rotates automatically</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="flex-1 relative">
            <div
              ref={mountRef}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicRoomTest;
