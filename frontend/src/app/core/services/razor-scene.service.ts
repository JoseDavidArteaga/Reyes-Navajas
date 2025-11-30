import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Injectable({
  providedIn: 'root'
})
export class RazorSceneService {

  async createRazorScene(container: HTMLElement): Promise<{ 
    scene: THREE.Scene, 
    camera: THREE.PerspectiveCamera, 
    renderer: THREE.WebGLRenderer,
    razor: THREE.Group,
    animate: () => void 
  }> {
    return new Promise((resolve, reject) => {
      // Crear la escena
      const scene = new THREE.Scene();
      scene.background = null; // Fondo transparente

      // Crear la cámara
      const aspectRatio = container.clientWidth / container.clientHeight;
      console.log('Dimensiones del contenedor:', container.clientWidth, 'x', container.clientHeight, 'ratio:', aspectRatio);
      
      const camera = new THREE.PerspectiveCamera(
        75, // Campo de visión más amplio
        aspectRatio,
        0.1,
        1000
      );
      camera.position.set(0, 0, 3); // Posición más centrada y cercana
      camera.lookAt(0, 0, 0);
      
      console.log('Cámara configurada en posición:', camera.position);

      // Crear el renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      });
      const width = container.clientWidth;
      const height = container.clientHeight;
      console.log('Configurando renderer con dimensiones:', width, 'x', height);
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x000000, 0); // Fondo completamente transparente
      
      // Asegurar que el canvas sea visible
      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      
      container.appendChild(canvas);
      console.log('Canvas agregado al contenedor:', canvas, container);

      // Agregar iluminación
      this.addLighting(scene);

      // Cargar el modelo GLB de la navaja
      this.loadRazorModel(scene).then((razor) => {
        // Configurar el tamaño y posición de la navaja
        razor.scale.set(1.5, 1.5, 1.5); // Escala moderada pero visible
        razor.position.set(0, 0, 0);
        razor.rotation.set(0.2, 0, 0.1); // Rotación inicial para mejor vista
        
        console.log('Navaja configurada - escala:', razor.scale, 'posición:', razor.position);
        
        // Función de animación con rotación continua suave
        const animate = () => {
          requestAnimationFrame(animate);
          
          // Verificar dimensiones del contenedor
          const currentWidth = container.clientWidth;
          const currentHeight = container.clientHeight;
          
          if (currentWidth !== renderer.domElement.width || currentHeight !== renderer.domElement.height) {
            console.log('Redimensionando renderer:', currentWidth, 'x', currentHeight);
            renderer.setSize(currentWidth, currentHeight);
            camera.aspect = currentWidth / currentHeight;
            camera.updateProjectionMatrix();
          }
          
          // Rotación continua en múltiples ejes para un efecto más dinámico
          razor.rotation.y += 0.01; // Rotación principal en Y
          razor.rotation.x += 0.003; // Rotación lenta en X
          razor.rotation.z += 0.005; // Rotación lenta en Z
          
          // Movimiento sutil de flotación
          razor.position.y = Math.sin(Date.now() * 0.001) * 0.1;
          
          renderer.render(scene, camera);
        };

        // Manejar redimensionamiento
        const handleResize = () => {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        
        window.addEventListener('resize', handleResize);

        resolve({ scene, camera, renderer, razor, animate });
      }).catch(reject);
    });
  }

  private async loadRazorModel(scene: THREE.Scene): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      console.log('Intentando cargar modelo de navaja PBR...');
      // Intentar cargar primero el modelo PBR, luego el shaded como respaldo
      loader.load(
        '/assets/3DModels/navaja_pbr.glb',
        (gltf) => {
          console.log('Modelo navaja PBR cargado exitosamente:', gltf);
          const model = gltf.scene;
          
          // Preservar materiales originales del modelo GLB
          console.log('Preservando materiales originales del modelo GLB...');
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              console.log('Material encontrado:', child.material);
              // No modificar los materiales del GLB, ya tienen texturas
            }
          });
          
          scene.add(model);
          resolve(model);
        },
        (progress) => {
          console.log('Cargando navaja PBR:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.warn('Error cargando navaja PBR, intentando modelo shaded:', error);
          
          // Respaldo: intentar cargar el modelo shaded
          loader.load(
            '/assets/3DModels/navaja_shaded.glb',
            (gltf) => {
              console.log('Modelo navaja shaded cargado exitosamente:', gltf);
              const model = gltf.scene;
              
              // Preservar materiales originales del modelo GLB
              console.log('Preservando materiales originales del modelo shaded...');
              scene.add(model);
              resolve(model);
            },
            undefined,
            (error2) => {
              console.error('Error cargando ambos modelos de navaja:', error2);
              console.log('Creando navaja procedural como respaldo...');
              // Crear navaja procedural como último recurso
              const proceduralRazor = this.createProceduralRazor();
              scene.add(proceduralRazor);
              resolve(proceduralRazor);
            }
          );
        }
      );
    });
  }

  private applyRazorMaterials(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Material metálico para la navaja
        const metalMaterial = new THREE.MeshStandardMaterial({
          color: 0xc0c0c0, // Color plateado
          metalness: 0.9,
          roughness: 0.1,
          envMapIntensity: 1.0
        });
        
        // Material para el mango (más oscuro)
        const handleMaterial = new THREE.MeshStandardMaterial({
          color: 0x2c1810, // Marrón oscuro para el mango
          metalness: 0.2,
          roughness: 0.8
        });
        
        // Aplicar materiales basado en el nombre o posición
        if (child.name.toLowerCase().includes('handle') || 
            child.name.toLowerCase().includes('mango')) {
          child.material = handleMaterial;
        } else {
          child.material = metalMaterial;
        }
        
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  private createProceduralRazor(): THREE.Group {
    const group = new THREE.Group();

    // Material metálico para la hoja - más brillante
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Blanco brillante
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x222222 // Un poco de emisión para hacerlo más visible
    });

    // Material para el mango - color más llamativo
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600, // Naranja brillante para test
      metalness: 0.2,
      roughness: 0.8,
      emissive: 0x110000
    });

    // Hoja de la navaja (más grande para mejor visibilidad)
    const bladeGeometry = new THREE.BoxGeometry(0.5, 0.2, 4); // Aún más grande
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0, 0, 0);
    blade.castShadow = true;
    group.add(blade);

    // Filo de la navaja
    const edgeGeometry = new THREE.BoxGeometry(0.1, 0.05, 4);
    const edge = new THREE.Mesh(edgeGeometry, bladeMaterial);
    edge.position.set(0.3, 0, 0);
    edge.castShadow = true;
    group.add(edge);

    // Mango
    const handleGeometry = new THREE.CylinderGeometry(0.3, 0.25, 3, 8);
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 0, -3);
    handle.rotation.x = Math.PI / 2;
    handle.castShadow = true;
    group.add(handle);

    // Guardia
    const guardGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.3);
    const guard = new THREE.Mesh(guardGeometry, bladeMaterial);
    guard.position.set(0, 0, -0.8);
    guard.castShadow = true;
    group.add(guard);

    console.log('Navaja procedural creada con colores brillantes:', group);
    return group;
  }

  private addLighting(scene: THREE.Scene): void {
    // Luz ambiental más intensa
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);

    // Luz direccional principal más intensa
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Luz de relleno más intensa
    const fillLight = new THREE.DirectionalLight(0x8080ff, 0.8);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // Luz puntual para brillos más intensa
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 20);
    pointLight.position.set(2, 3, 2);
    scene.add(pointLight);
    
    // Luz adicional desde arriba
    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);
    
    console.log('Iluminación configurada con mayor intensidad');
  }
}