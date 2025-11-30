import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, ThreeSceneService, RazorSceneService } from '../../core';
import * as THREE from 'three';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statueContainer', { static: false }) statueContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('razorContainer', { static: false }) razorContainer!: ElementRef<HTMLDivElement>;
  
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private animationId: number | null = null;
  private animateFunction: (() => void) | null = null;
  
  // Variables para la navaja
  private razorScene: THREE.Scene | null = null;
  private razorCamera: THREE.PerspectiveCamera | null = null;
  private razorRenderer: THREE.WebGLRenderer | null = null;
  private razorAnimateFunction: (() => void) | null = null;

  constructor(
    public authService: AuthService,
    private threeSceneService: ThreeSceneService,
    private razorSceneService: RazorSceneService
  ) {}

  servicios = [
    {
      id: '1',
      nombre: 'Corte Clásico',
      descripcion: 'Corte tradicional con tijera y máquina, técnicas clásicas de barbería',
      precio: 25000,
      duracion: 45,
      icon: '✂️'
    },
    {
      id: '2',
      nombre: 'Corte Moderno',
      descripcion: 'Estilos actuales y degradados, tendencias de moda',
      precio: 30000,
      duracion: 50,
      icon: '💇‍♂️'
    },
    {
      id: '3',
      nombre: 'Afeitado Clásico',
      descripcion: 'Afeitado tradicional con navaja y toalla caliente',
      precio: 20000,
      duracion: 45,
      icon: '🪒'
    },
    {
      id: '4',
      nombre: 'Corte y Barba',
      descripcion: 'Servicio completo: corte de cabello + arreglo de barba',
      precio: 35000,
      duracion: 60,
      icon: '🧔'
    },
    {
      id: '5',
      nombre: 'Arreglo de Barba',
      descripcion: 'Perfilado y arreglo profesional de barba',
      precio: 15000,
      duracion: 30,
      icon: '✨'
    },
    {
      id: '6',
      nombre: 'Tratamiento Capilar',
      descripcion: 'Cuidado especializado para tu cabello',
      precio: 40000,
      duracion: 60,
      icon: '🧴'
    }
  ];

  caracteristicas = [
    {
      titulo: 'Profesionales',
      descripcion: 'Barberos certificados con años de experiencia',
      icon: '👨‍💼'
    },
    {
      titulo: 'Tecnología',
      descripcion: 'Sistema de reservas online y cola virtual',
      icon: '📱'
    },
    {
      titulo: 'Calidad',
      descripcion: 'Productos premium y técnicas especializadas',
      icon: '⭐'
    },
    {
      titulo: 'Ambiente',
      descripcion: 'Espacio cómodo y relajante para nuestros clientes',
      icon: '🏠'
    }
  ];

  ngOnInit(): void {
    // Inicialización del componente
  }

  ngAfterViewInit(): void {
    this.initializeStatue();
    // Agregar un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initializeRazor();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar recursos de Three.js
    this.cleanupThreeJs();
  }

  private initializeStatue(): void {
    if (this.statueContainer?.nativeElement) {
      this.threeSceneService.createStatueScene(
        this.statueContainer.nativeElement
      ).then((sceneData) => {
        this.scene = sceneData.scene;
        this.camera = sceneData.camera;
        this.renderer = sceneData.renderer;
        this.animateFunction = sceneData.animate;
        
        // Iniciar animación
        this.animateFunction();
      }).catch((error) => {
        console.error('Error inicializando la escena 3D:', error);
      });
    }
  }

  private initializeRazor(): void {
    console.log('Inicializando navaja, container:', this.razorContainer?.nativeElement);
    if (this.razorContainer?.nativeElement) {
      const container = this.razorContainer.nativeElement;
      console.log('Container encontrado - dimensiones:', {
        width: container.clientWidth,
        height: container.clientHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        style: window.getComputedStyle(container)
      });
      
      this.razorSceneService.createRazorScene(
        this.razorContainer.nativeElement
      ).then((sceneData) => {
        console.log('Escena de navaja creada exitosamente:', sceneData);
        this.razorScene = sceneData.scene;
        this.razorCamera = sceneData.camera;
        this.razorRenderer = sceneData.renderer;
        this.razorAnimateFunction = sceneData.animate;
        
        // Iniciar animación
        this.razorAnimateFunction();
        console.log('Animación de navaja iniciada');
      }).catch(error => {
        console.error('Error inicializando la escena de la navaja:', error);
      });
    } else {
      console.error('Container de navaja no encontrado');
    }
  }

  private cleanupThreeJs(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.razorRenderer) {
      this.razorRenderer.dispose();
    }
    
    if (this.scene) {
      this.scene.clear();
    }
    
    if (this.razorScene) {
      this.razorScene.clear();
    }
  }
}
