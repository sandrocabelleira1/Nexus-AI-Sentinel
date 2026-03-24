"use client"

import React, { useRef, useEffect } from 'react';
import { Renderer, Camera, Transform, Mesh, Program, Color, Vec2, Plane } from 'ogl';

/**
 * Componente EvilEye v3.0 - High Fidelity WebGL (OGL).
 * Simula o Olho de Vidro do Nexus AI com efeitos de chama e energia procedural.
 */

interface EvilEyeProps {
  eyeColor?: string;
  intensity?: number;
  pupilSize?: number;
  irisWidth?: number;
  glowIntensity?: number;
  scale?: number;
  noiseScale?: number;
  pupilFollow?: number;
  flameSpeed?: number;
  backgroundColor?: string;
}

export function EvilEye({
  eyeColor = "#0e13a0",
  intensity = 1.5,
  pupilSize = 0.6,
  irisWidth = 0.25,
  glowIntensity = 0.35,
  scale = 0.8,
  noiseScale = 1.0,
  pupilFollow = 1.0,
  flameSpeed = 1.0,
  backgroundColor = "#060010"
}: EvilEyeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef(new Vec2(0, 0));
  const targetMouse = useRef(new Vec2(0, 0));

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = new Renderer({ dpr: window.devicePixelRatio, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 5);

    const scene = new Transform();

    // Shader de Fragmento Avançado (Efeito de Chama/Nebulosa)
    const vertex = `
      attribute vec3 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragment = `
      precision highp float;
      uniform vec2 uMouse;
      uniform float uTime;
      uniform vec3 uEyeColor;
      uniform float uIntensity;
      uniform float uPupilSize;
      uniform float uIrisWidth;
      uniform float uGlowIntensity;
      uniform float uNoiseScale;
      uniform float uFlameSpeed;
      varying vec2 vUv;

      // Funções de ruído para o efeito de chama
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        p.x *= 1.8; // Aspect Ratio do Olho

        // Distorção por ruído (Chamas)
        float n = snoise(p * uNoiseScale + uTime * uFlameSpeed);
        float d = length(p + n * 0.15);
        
        // Máscara do Olho
        float eyeMask = smoothstep(0.85, 0.75, d);

        // Movimento da pupila
        vec2 pupilPos = uMouse * 0.35;
        float distToPupil = length(p - pupilPos);

        // Iris & Pupila
        float iris = smoothstep(uIrisWidth + 0.2, uIrisWidth, distToPupil);
        float pupil = smoothstep(uPupilSize * 0.3, uPupilSize * 0.25, distToPupil);

        // Cores Procedurais
        vec3 color = uEyeColor * uIntensity;
        vec3 flameColor = mix(color, vec3(1.0), n * 0.5 + 0.5);
        
        vec3 finalColor = mix(vec3(0.0), flameColor, iris);
        finalColor = mix(finalColor, vec3(0.0), pupil);
        
        // Brilho Externo (Glow)
        float glow = exp(-d * 2.0) * uGlowIntensity;
        finalColor += color * glow;

        gl_FragColor = vec4(finalColor, eyeMask * 0.9);
      }
    `;

    const color = new Color(eyeColor);
    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uMouse: { value: mouse.current },
        uTime: { value: 0 },
        uEyeColor: { value: new Float32Array([color.r, color.g, color.b]) },
        uIntensity: { value: intensity },
        uPupilSize: { value: pupilSize },
        uIrisWidth: { value: irisWidth },
        uGlowIntensity: { value: glowIntensity },
        uNoiseScale: { value: noiseScale },
        uFlameSpeed: { value: flameSpeed },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.scale.set(scale, scale, 1);
    mesh.setParent(scene);

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    }

    window.addEventListener('resize', resize, false);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * -2 + 1
      );
    };

    window.addEventListener('mousemove', handleMouseMove);

    let request: number;
    const update = (t: number) => {
      request = requestAnimationFrame(update);
      mouse.current.lerp(targetMouse.current, 0.08 * pupilFollow);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene, camera });
    };
    request = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(request);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor + '22' }}
      >
        <div ref={containerRef} className="w-full h-full max-w-[1400px] max-h-[800px]" />
        
        {/* Anéis de Varredura CSS */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] h-[80%] rounded-full border border-primary/5 animate-[spin_60s_linear_infinite] opacity-20" />
          <div className="w-[60%] h-[60%] rounded-full border border-primary/10 animate-[spin_40s_linear_reverse_infinite] opacity-10" />
        </div>
      </div>
    </div>
  );
}
