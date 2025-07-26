import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import MaterialCard from './MaterialCard';
import MaterialModal from './MaterialModal';

interface Material {
  name: string;
  image: string;
  id: string;
}

const materials: Material[] = [
  { id: 'oak', name: 'Chêne', image: 'https://www.canva.com/design/DAGpk0gyHu0/Wf27fDkBifMiP2BDOlKnNg/view' },
  { id: 'walnut', name: 'Noyer', image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'maple', name: 'Érable', image: 'https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'pine', name: 'Pin', image: 'https://images.pexels.com/photos/1267239/pexels-photo-1267239.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'cedar', name: 'Cèdre', image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'birch', name: 'Bouleau', image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'cherry', name: 'Cerisier', image: 'https://images.pexels.com/photos/1108102/pexels-photo-1108102.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'mahogany', name: 'Acajou', image: 'https://images.pexels.com/photos/1108573/pexels-photo-1108573.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'ash', name: 'Frêne', image: 'https://images.pexels.com/photos/1108574/pexels-photo-1108574.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'beech', name: 'Hêtre', image: 'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'teak', name: 'Teck', image: 'https://images.pexels.com/photos/1108103/pexels-photo-1108103.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' },
  { id: 'bamboo', name: 'Bambou', image: 'https://images.pexels.com/photos/1108575/pexels-photo-1108575.jpeg?auto=compress&cs=tinysrgb&w=120&h=100&fit=crop' }
];

const WoodMaterialSelector: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<CSS3DRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const objectsRef = useRef<CSS3DObject[]>([]);
  const invisibleObjectsRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>();
  const mouseRef = useRef<THREE.Vector2>();
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [modalMaterial, setModalMaterial] = useState<Material | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [confirmedMaterial, setConfirmedMaterial] = useState<Material | null>(null);
  const [isAnimatingCard, setIsAnimatingCard] = useState(false);
  const animatingCardRef = useRef<CSS3DObject | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      5000
    );
    camera.position.set(0, 0, 2000);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 800;
    controls.maxDistance = 4000;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Raycaster setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycasterRef.current = raycaster;
    mouseRef.current = mouse;

    // Create material objects
    const objects: CSS3DObject[] = [];
    const invisibleObjects: THREE.Mesh[] = [];
    const radius = 200;

    materials.forEach((material, index) => {
      // Create DOM element container
      const element = document.createElement('div');
      element.style.width = '128px';
      element.style.height = '160px';
      element.style.pointerEvents = 'none';
      element.id = `material-${material.id}`;
      

      // Create CSS3D object
      const objectCSS = new CSS3DObject(element);
      
      // Calculate sphere position
      const total = materials.length;
      const phi = Math.acos(-1 + (2 * index) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      
      // Set initial random position for animation
      objectCSS.position.set(
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000
      );

      // Calculate target position on sphere
      const targetPosition = new THREE.Vector3();
      targetPosition.setFromSphericalCoords(radius, phi, theta);
      
      // Store target position for animation
      (objectCSS as any).targetPosition = targetPosition;
      
      // Calculate rotation to face center
      const lookTarget = targetPosition.clone().multiplyScalar(2);
      const targetRotation = new THREE.Euler();
      const tempObject = new THREE.Object3D();
      tempObject.position.copy(targetPosition);
      tempObject.lookAt(lookTarget);
      targetRotation.copy(tempObject.rotation);
      (objectCSS as any).targetRotation = targetRotation;

      // Create invisible geometry for raycasting
      const geometry = new THREE.PlaneGeometry(128, 160);
      const invisibleMaterial = new THREE.MeshBasicMaterial({ 
        transparent: true, 
        opacity: 0,
        side: THREE.DoubleSide
      });
      const invisibleMesh = new THREE.Mesh(geometry, invisibleMaterial);
      invisibleMesh.position.copy(targetPosition);
      invisibleMesh.lookAt(lookTarget);
      (invisibleMesh as any).materialData = material;
      (invisibleMesh as any).cardIndex = index;
      
      scene.add(invisibleMesh);
      invisibleObjects.push(invisibleMesh);
      scene.add(objectCSS);
      objects.push(objectCSS);
    });

    objectsRef.current = objects;
    invisibleObjectsRef.current = invisibleObjects;

    // Mouse click handler
    const handleClick = (event: MouseEvent) => {
      if (!cameraRef.current || !raycasterRef.current || !mouseRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update the picking ray with the camera and mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      // Calculate objects intersecting the picking ray
      const intersects = raycasterRef.current.intersectObjects(invisibleObjectsRef.current);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object as any;
        const material = clickedObject.materialData;
        
        if (!isAnimatingCard) {
          animateCardToFront(material, clickedObject.cardIndex);
        }
      }
    };

    // Add click event listener
    renderer.domElement.addEventListener('click', handleClick);
    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Start sphere animation
    animateToSphere();
  }, []);

  const animateCardToFront = (material: Material, cardIndex: number) => {
    if (isAnimatingCard) return;
    
    setIsAnimatingCard(true);
    const cardObject = objectsRef.current[cardIndex];
    const invisibleObject = invisibleObjectsRef.current[cardIndex];
    animatingCardRef.current = cardObject;
    
    // Désactiver les contrôles pendant l'animation
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    
    // Position et rotation initiales
    const startPosition = cardObject.position.clone();
    const startRotation = cardObject.rotation.clone();
    const startScale = cardObject.scale.clone();
    
    // Position finale (vers la caméra)
    const endPosition = new THREE.Vector3(0, 0, 800);
    const endRotation = new THREE.Euler(0, 0, 0);
    const endScale = new THREE.Vector3(2, 2, 2);
    
    // Timeline GSAP
    const tl = gsap.timeline({
      onComplete: () => {
        // Afficher le modal après l'animation
        setModalMaterial(material);
        setIsModalOpen(true);
        
        // Masquer la carte pendant que le modal est ouvert
        cardObject.visible = false;
        invisibleObject.visible = false;
      }
    });
    
    // Animation de sortie de la sphère et approche
    tl.to(cardObject.position, {
      duration: 0.8,
      x: endPosition.x,
      y: endPosition.y,
      z: endPosition.z,
      ease: "power2.out"
    })
    .to(cardObject.rotation, {
      duration: 0.8,
      x: endRotation.x,
      y: endRotation.y,
      z: endRotation.z,
      ease: "power2.out"
    }, 0)
    .to(cardObject.scale, {
      duration: 0.8,
      x: endScale.x,
      y: endScale.y,
      z: endScale.z,
      ease: "power2.out"
    }, 0)
    .to(invisibleObject.position, {
      duration: 0.8,
      x: endPosition.x,
      y: endPosition.y,
      z: endPosition.z,
      ease: "power2.out"
    }, 0)
    .to(invisibleObject.rotation, {
      duration: 0.8,
      x: endRotation.x,
      y: endRotation.y,
      z: endRotation.z,
      ease: "power2.out"
    }, 0);
  };

  const resetCardPosition = (cardIndex: number) => {
    const cardObject = objectsRef.current[cardIndex];
    const invisibleObject = invisibleObjectsRef.current[cardIndex];
    const targetPosition = (cardObject as any).targetPosition;
    const targetRotation = (cardObject as any).targetRotation;
    
    // Animation de retour à la position originale
    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimatingCard(false);
        animatingCardRef.current = null;
        
        // Réactiver les contrôles
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    });
    
    // Rendre la carte visible
    cardObject.visible = true;
    invisibleObject.visible = true;
    
    tl.to(cardObject.position, {
      duration: 0.6,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      ease: "power2.inOut"
    })
    .to(cardObject.rotation, {
      duration: 0.6,
      x: targetRotation.x,
      y: targetRotation.y,
      z: targetRotation.z,
      ease: "power2.inOut"
    }, 0)
    .to(cardObject.scale, {
      duration: 0.6,
      x: 1,
      y: 1,
      z: 1,
      ease: "power2.inOut"
    }, 0)
    .to(invisibleObject.position, {
      duration: 0.6,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      ease: "power2.inOut"
    }, 0)
    .to(invisibleObject.rotation, {
      duration: 0.6,
      x: targetRotation.x,
      y: targetRotation.y,
      z: targetRotation.z,
      ease: "power2.inOut"
    }, 0);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalMaterial(null);
    
    // Trouver l'index de la carte animée et la remettre en place
    if (animatingCardRef.current) {
      const cardIndex = objectsRef.current.findIndex(obj => obj === animatingCardRef.current);
      if (cardIndex !== -1) {
        resetCardPosition(cardIndex);
      }
    }
  };

  const handleMaterialConfirm = (material: Material) => {
    setConfirmedMaterial(material);
    setSelectedMaterial(material.id);
    console.log('Confirmed material:', material.name);
    
    // Fermer le modal et remettre la carte en place
    handleModalClose();

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const animateToSphere = () => {
    setIsAnimating(true);
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      objectsRef.current.forEach((obj, index) => {
        const targetPos = (obj as any).targetPosition;
        const targetRot = (obj as any).targetRotation;
        const startPos = (obj as any).startPosition || obj.position.clone();
        const startRot = (obj as any).startRotation || obj.rotation.clone();

        if (progress === 0) {
          (obj as any).startPosition = startPos;
          (obj as any).startRotation = startRot;
        }

        obj.position.lerpVectors(startPos, targetPos, eased);
        obj.rotation.x = startRot.x + (targetRot.x - startRot.x) * eased;
        obj.rotation.y = startRot.y + (targetRot.y - startRot.y) * eased;
        obj.rotation.z = startRot.z + (targetRot.z - startRot.z) * eased;
        
        // Update invisible mesh position and rotation
        if (invisibleObjectsRef.current[index]) {
          invisibleObjectsRef.current[index].position.copy(obj.position);
          invisibleObjectsRef.current[index].rotation.copy(obj.rotation);
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  };

  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const handleMaterialSelect = (material: Material) => {
    // Cette fonction n'est plus utilisée car on utilise le raycasting
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
      {/* 3D Scene Container */}
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* React Portal for Material Cards */}
      {materials.map((material, index) => {
        const element = document.getElementById(`material-${material.id}`);
        if (!element) return null;

        return (
          <div key={material.id}>
            {/* This will be rendered by Three.js CSS3DRenderer */}
            {createPortal(
              <MaterialCard
                name={material.name}
                image={material.image}
                onSelect={() => handleMaterialSelect(material)}
                isSelected={selectedMaterial === material.id}
              />,
              element
            )}
          </div>
        );
      })}

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Sélecteur de Matériaux Bois
          </h1>
          <p className="text-sm text-gray-600">
            {isAnimating 
              ? 'Animation en cours...' 
              : isAnimatingCard
                ? 'Chargement du matériau...'
                : 'Cliquez et faites glisser pour explorer'
            }
          </p>
          {selectedMaterial && (
            <p className="text-sm font-medium text-amber-700 mt-2">
              Matériau confirmé: {confirmedMaterial?.name}
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <MaterialModal
        material={modalMaterial}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleMaterialConfirm}
      />

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className={`bg-black/70 text-white rounded-lg p-3 text-sm transition-opacity duration-300 ${
          isAnimatingCard ? 'opacity-50' : 'opacity-100'
        }`}>
          <p>🖱️ Clic-glisser: Rotation</p>
          <p>🔍 Molette: Zoom</p>
          <p>👆 Clic: Sélection</p>
        </div>
      </div>
    </div>
  );
};

export default WoodMaterialSelector;