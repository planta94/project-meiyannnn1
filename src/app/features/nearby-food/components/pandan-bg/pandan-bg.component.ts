import { Component, ElementRef, OnInit, OnDestroy, ViewChild, NgZone, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-pandan-bg',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #bgCanvas class="pandan-bg-canvas"></canvas>`,
  styleUrls: ['./pandan-bg.component.scss']
})
export class PandanBgComponent implements OnInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ngZone = inject(NgZone);
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private leaves: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number; z: number }; floatSpeed: number; initialY: number; offset: number }[] = [];
  private particles!: THREE.Points;
  private animationFrameId?: number;

  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  constructor() {}

  ngOnInit() {
    this.initThree();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xe8f5e9, 0.035);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.z = 12;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x81c784, 1.2);
    dirLight1.position.set(5, 10, 7);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x277a62, 0.8);
    dirLight2.position.set(-5, -5, 5);
    this.scene.add(dirLight2);

    // Create 3D Pandan Leaves
    this.createPandanLeaves();

    // Create Floating Mint Particles
    this.createFloatingParticles();

    // Start Animation loop outside Angular Zone for optimal 60fps performance
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private createPandanLeaves() {
    // 3D Pandan Leaf shape curve
    const shape = new THREE.Shape();
    shape.moveTo(0, -1.8);
    shape.quadraticCurveTo(0.45, -0.6, 0.35, 0.8);
    shape.quadraticCurveTo(0.18, 1.8, 0, 2.4);
    shape.quadraticCurveTo(-0.18, 1.8, -0.35, 0.8);
    shape.quadraticCurveTo(-0.45, -0.6, 0, -1.8);

    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 2,
      bevelSize: 0.03,
      bevelThickness: 0.02
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Color palette for pandan leaves
    const colors = [0x2e7d32, 0x1b5e20, 0x388e3c, 0x43a047, 0x277a62];

    const leafCount = 18;
    for (let i = 0; i < leafCount; i++) {
      const color = colors[i % colors.length];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.15,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random initial placement across screen volume
      const scale = 0.5 + Math.random() * 0.8;
      mesh.scale.set(scale, scale, scale);

      mesh.position.x = (Math.random() - 0.5) * 22;
      mesh.position.y = (Math.random() - 0.5) * 16;
      mesh.position.z = (Math.random() - 0.5) * 12 - 2;

      mesh.rotation.x = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.z = Math.random() * Math.PI * 2;

      this.scene.add(mesh);

      this.leaves.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.006
        },
        floatSpeed: 0.003 + Math.random() * 0.005,
        initialY: mesh.position.y,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  private createFloatingParticles() {
    const particleCount = 56;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material with glowing green tone
    const material = new THREE.PointsMaterial({
      color: 0x81c784,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private animate() {
    const time = Date.now() * 0.001;

    // Smooth mouse lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Camera slight parallax movement
    this.camera.position.x = this.mouseX * 1.2;
    this.camera.position.y = -this.mouseY * 1.2;
    this.camera.lookAt(this.scene.position);

    // Animate leaves
    this.leaves.forEach(item => {
      item.mesh.rotation.x += item.rotSpeed.x;
      item.mesh.rotation.y += item.rotSpeed.y;
      item.mesh.rotation.z += item.rotSpeed.z;

      // Floating wave up and down
      item.mesh.position.y += Math.sin(time + item.offset) * 0.004;
      item.mesh.position.x += Math.cos(time + item.offset) * 0.002;
    });

    // Animate floating particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes['position'].array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += 0.008; // float upward
        if (positions[i * 3 + 1] > 10) {
          positions[i * 3 + 1] = -10; // wrap around
        }
      }
      this.particles.geometry.attributes['position'].needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
