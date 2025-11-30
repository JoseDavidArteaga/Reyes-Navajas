import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeSceneService {

  createStatueScene(container: HTMLElement): Promise<{ 
    scene: THREE.Scene, 
    camera: THREE.PerspectiveCamera, 
    renderer: THREE.WebGLRenderer,
    statue: THREE.Group,
    animate: () => void 
  }> {
    return new Promise((resolve, reject) => {
      // Crear la escena
      const scene = new THREE.Scene();
      scene.background = null; // Fondo transparente para que se vea como overlay

      // Crear la cámara con un campo de visión más amplio para fondo
      const camera = new THREE.PerspectiveCamera(
        60, // Campo de visión más amplio
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 3, 8); // Mover la cámara más atrás y más abajo para aumentar el espacio
      camera.lookAt(0, 2, 0); // Apuntar hacia el centro para crear más espacio arriba

      // Crear el renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x000000, 0); // Fondo completamente transparente
      container.appendChild(renderer.domElement);

      // Agregar iluminación
      this.addLighting(scene);

      // Cargar el modelo GLB de la estatua
      this.loadStatueModel(scene).then((statue) => {
        // Aumentar el tamaño de la estatua en un 80%
        statue.scale.set(3.5, 3.5, 3.5);
        // Posicionar la estatua más abajo para crear espacio con el header
        statue.position.set(0, -1, 0);
        
        // Función de animación
        const animate = () => {
          requestAnimationFrame(animate);
          
          // Rotar la estatua
          statue.rotation.y += 0.01;
          
          renderer.render(scene, camera);
        };

        // Manejar redimensionamiento
        const handleResize = () => {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        
        window.addEventListener('resize', handleResize);

        resolve({ scene, camera, renderer, statue, animate });
      }).catch(reject);
    });
  }

  private loadStatueModel(scene: THREE.Scene): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const group = new THREE.Group();
      
      loader.load(
        '/assets/3DModels/estatua.glb',
        (gltf) => {
          const model = gltf.scene;
          
          // Aplicar material dorado a todos los meshes del modelo
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Crear material dorado con reflejos
              const goldMaterial = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                metalness: 0.8,
                roughness: 0.2,
                envMapIntensity: 1.5
              });
              
              child.material = goldMaterial;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          // Escalar y posicionar el modelo si es necesario
          model.scale.setScalar(1); // Ajusta la escala según sea necesario
          model.position.set(0, 0, 0);
          
          group.add(model);
          scene.add(group);
          
          resolve(group);
        },
        (progress) => {
          console.log('Progreso de carga:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error cargando el modelo GLB:', error);
          
          // Fallback: crear estatua procedural si falla la carga
          console.log('Usando estatua procedural como fallback...');
          const fallbackStatue = this.createProceduralStatue();
          scene.add(fallbackStatue);
          resolve(fallbackStatue);
        }
      );
    });
  }

  private createProceduralStatue(): THREE.Group {
    const group = new THREE.Group();

    // Material dorado con reflejos
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.5
    });

    // Base de la estatua
    const baseGeometry = new THREE.CylinderGeometry(1.2, 1.4, 0.3, 16);
    const base = new THREE.Mesh(baseGeometry, goldMaterial);
    base.position.y = 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(0.8, 1, 0.4, 12);
    const pedestal = new THREE.Mesh(pedestalGeometry, goldMaterial);
    pedestal.position.y = 0.5;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    // Cuerpo de la estatua
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.8, 12);
    const body = new THREE.Mesh(bodyGeometry, goldMaterial);
    body.position.y = 1.6;
    body.castShadow = true;
    group.add(body);

    // Cabeza
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const head = new THREE.Mesh(headGeometry, goldMaterial);
    head.position.y = 2.8;
    head.castShadow = true;
    group.add(head);

    // Brazos
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.12, 1.2, 8);
    
    const leftArm = new THREE.Mesh(armGeometry, goldMaterial);
    leftArm.position.set(-0.7, 2, 0);
    leftArm.rotation.z = -0.3;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, goldMaterial);
    rightArm.position.set(0.7, 2, 0);
    rightArm.rotation.z = 0.3;
    rightArm.castShadow = true;
    group.add(rightArm);

    // Corona o detalle en la cabeza
    const crownGeometry = new THREE.CylinderGeometry(0.38, 0.35, 0.2, 16);
    const crown = new THREE.Mesh(crownGeometry, goldMaterial);
    crown.position.y = 3.1;
    crown.castShadow = true;
    group.add(crown);

    // Detalles decorativos en la base
    for (let i = 0; i < 8; i++) {
      const detailGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      const detail = new THREE.Mesh(detailGeometry, goldMaterial);
      const angle = (i / 8) * Math.PI * 2;
      detail.position.set(
        Math.cos(angle) * 1.1,
        0.3,
        Math.sin(angle) * 1.1
      );
      detail.castShadow = true;
      group.add(detail);
    }

    // Aumentar el tamaño de la estatua en un 80%
    group.scale.set(1.8, 1.8, 1.8);
    // Posicionar la estatua más abajo para crear espacio con el header
    group.position.set(0, -1.5, 0);

    return group;
  }

  private addLighting(scene: THREE.Scene): void {
    // Luz ambiental más suave para fondo
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Luz direccional principal más tenue
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024; // Reducir calidad de sombras para performance
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Luz de relleno dorada más sutil
    const fillLight = new THREE.DirectionalLight(0xffd700, 0.3);
    fillLight.position.set(-5, 10, -5);
    scene.add(fillLight);

    // Luz puntual para realces más tenue
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(0, 8, 3);
    pointLight.castShadow = false; // Desactivar sombras para performance
    scene.add(pointLight);

    // Crear environment map para reflejos
    const envMapTexture = this.createEnvironmentMap();
    scene.environment = envMapTexture;
  }

  private createEnvironmentMap(): THREE.CubeTexture {
    // Crear un environment map simple para los reflejos
    const loader = new THREE.CubeTextureLoader();
    const urls = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    ];
    
    return loader.load(urls);
  }
}