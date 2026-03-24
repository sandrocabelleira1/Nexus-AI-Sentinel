
"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Renderer, Camera, Transform, Mesh, Program, Color, Vec2, Plane } from 'ogl';

/**
 * Componente EvilEye v2.0 - Renderizado com OGL (WebGL).
 * Proporciona uma estética neural de alta fidelidade que simboliza a onisciência do Nexus AI.
 */
export function EvilEye() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef(new Vec2(0, 0));
  const targetMouse = useRef(new Vec2(0, 0));

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = new Renderer({ dpr: 2, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 5);

    const scene = new Transform();

    // Shaders para o Olho Onisciente
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
      varying vec2 vUv;

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        p.x *= 2.0; // Proporção para formato de olho

        // Distância do centro para formato de olho (elipse)
        float d = length(p * vec2(0.5, 1.0));
        float eyeMask = smoothstep(0.8, 0.78, d);

        // Movimento da pupila
        vec2 pupilPos = uMouse * 0.4;
        float pupilDist = length(p - pupilPos);
        
        // Íris
        float iris = smoothstep(0.45, 0.43, pupilDist);
        vec3 irisColor = mix(vec3(0.05, 0.1, 0.2), vec3(0.45, 0.7, 1.0), pupilDist * 2.0);
        
        // Pupila
        float pupil = smoothstep(0.18, 0.16, pupilDist);
        vec3 finalColor = mix(vec3(0.9, 0.9, 1.0), irisColor, iris);
        finalColor = mix(finalColor, vec3(0.0, 0.0, 0.0), pupil);

        // Brilho tático
        float highlight = smoothstep(0.08, 0.0, length(p - pupilPos - vec2(0.08, 0.08)));
        finalColor += highlight * 0.4;

        gl_FragColor = vec4(finalColor, eyeMask * 0.8);
      }
    `;

    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uMouse: { value: mouse.current },
        uTime: { value: 0 },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
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

      // Interpolação suave para o mouse (lerp)
      mouse.current.lerp(targetMouse.current, 0.1);
      program.uniforms.uMouse.value = mouse.current;
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
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-40">
      <div className="relative w-full h-full max-w-[1200px] max-h-[1200px] flex items-center justify-center">
        {/* Anéis Orbitais Externos (CSS para contraste) */}
        <div className="absolute w-[800px] h-[800px] rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-primary/5 animate-[spin_25s_linear_reverse_infinite]" />
        
        {/* Container para o Canvas OGL */}
        <div ref={containerRef} className="w-[600px] h-[400px] flex items-center justify-center" />

        {/* Brilhos de Varredura */}
        <div className="absolute w-full h-[1px] bg-primary/20 blur-xl animate-[bounce_10s_infinite] top-1/2 opacity-30" />
      </div>
    </div>
  );
}
