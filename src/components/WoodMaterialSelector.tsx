import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
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
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [modalMaterial, setModalMaterial] = useState<Material | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [confirmedMaterial, setConfirmedMaterial] = useState<Material | null>(null);

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

    // Create material objects
    const objects: CSS3DObject[] = [];
    const radius = 200
    ;

    materials.forEach((material, index) => {
      // Create DOM element container
      const element = document.createElement('div');
      element.style.width = '128px';
      element.style.height = '160px';
      element.style.pointerEvents = 'auto';
      element.style.cursor = 'pointer';
      element.id = `material-${material.id}`;
      
      // Add click handler directly to the DOM element
      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Clicked on material:', material.name);
        setModalMaterial(material);
        setIsModalOpen(true);
      });

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

      scene.add(objectCSS);
      objects.push(objectCSS);
    });

    objectsRef.current = objects;

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

      objectsRef.current.forEach((obj) => {
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
    setModalMaterial(material);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalMaterial(null);
  };

  const handleMaterialConfirm = (material: Material) => {
    setConfirmedMaterial(material);
    setSelectedMaterial(material.id);
    console.log('Confirmed material:', material.name);
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
        <div className="bg-black/70 text-white rounded-lg p-3 text-sm">
          <p>🖱️ Clic-glisser: Rotation</p>
          <p>🔍 Molette: Zoom</p>
          <p>👆 Clic: Sélection</p>
        </div>
      </div>
    </div>
  );
};

export default WoodMaterialSelector;