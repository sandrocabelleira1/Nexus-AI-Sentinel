"use client"

import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { useEffect, useRef } from 'react';

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

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

function generateNoiseTexture(size = 256): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  function hash(x: number, y: number, s: number): number {
    let n = x * 374761393 + y * 668265263 + s * 1274126177;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function noise(px: number, py: number, freq: number, seed: number): number {
    const fx = (px / size) * freq, fy = (py / size) * freq;
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const tx = fx - ix, ty = fy - iy;
    const w = freq | 0;
    const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);
    const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);
    const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
    const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
    return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0, amp = 0.4, totalAmp = 0;
      for (let o = 0; o < 8; o++) {
        const f = 32 * (1 << o);
        v += amp * noise(x, y, f, o * 31);
        totalAmp += amp; amp *= 0.65;
      }
      v = Math.max(0, Math.min(1, (v / totalAmp - 0.5) * 2.2 + 0.5));
      const val = Math.round(v * 255);
      const i = (y * size + x) * 4;
      data[i] = data[i+1] = data[i+2] = val; data[i+3] = 255;
    }
  }
  return data;
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0, 1); }
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform sampler2D uNoiseTexture;
uniform float uPupilSize;
uniform float uIrisWidth;
uniform float uGlowIntensity;
uniform float uIntensity;
uniform float uScale;
uniform float uNoiseScale;
uniform vec2 uMouse;
uniform float uPupilFollow;
uniform float uFlameSpeed;
uniform vec3 uEyeColor;
uniform vec3 uBgColor;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
  uv /= uScale;
  float ft = uTime * uFlameSpeed;
  float polarRadius = length(uv) * 2.0;
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
  vec2 polarUv = vec2(polarRadius, polarAngle);
  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
  float distanceMask = 1.0 - length(uv);
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);
  innerRing = (innerRing * distanceMask - 0.2) / 0.28 + noiseA.r - 0.5;
  innerRing = clamp(innerRing * 1.3, 0.0, 1.0);
  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
  outerRing = (outerRing * distanceMask - 0.1) / 0.38 + noiseC.r - 0.5;
  outerRing = clamp(outerRing * 1.3, 0.0, 1.0);
  innerRing += outerRing;
  float innerEye = (distanceMask - 0.2) * noiseB.r * 2.0;
  vec2 pupilUv = uv - uMouse * uPupilFollow * 0.12;
  float pupil = clamp((1.0 - length(pupilUv * vec2(9.0, 2.3))) * uPupilSize, 0.0, 1.0) / 0.35;
  float outerEyeGlow = pow(clamp(1.0 - length(uv * vec2(0.5, 1.5)) + 0.5 + noiseC.r - 0.5, 0.0, 1.0), 2.0);
  outerEyeGlow = clamp(outerEyeGlow + distanceMask, 0.0, 1.0) * uGlowIntensity * pow(1.0 - distanceMask, 2.0) * 2.5;
  vec3 color = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow) - pupil, 0.0, 3.0) + uBgColor;
  gl_FragColor = vec4(color, 1.0);
}
`;

export function EvilEye({
  eyeColor = '#2563eb',
  intensity = 1.5,
  pupilSize = 0.6,
  irisWidth = 0.25,
  glowIntensity = 0.35,
  scale = 0.8,
  noiseScale = 1.0,
  pupilFollow = 1.0,
  flameSpeed = 1.0,
  backgroundColor = '#000000'
}: EvilEyeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    } catch (e) {
      console.warn("WebGL context for EvilEye could not be created.");
      return;
    }
    
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    rendererRef.current = renderer;

    const noiseData = generateNoiseTexture(256);
    const noiseTexture = new Texture(gl, {
      image: noiseData, width: 256, height: 256,
      generateMipmaps: false, flipY: false,
    });
    noiseTexture.minFilter = gl.LINEAR;
    noiseTexture.magFilter = gl.LINEAR;
    noiseTexture.wrapS = noiseTexture.wrapT = gl.REPEAT;

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uNoiseTexture: { value: noiseTexture },
        uPupilSize: { value: pupilSize },
        uIrisWidth: { value: irisWidth },
        uGlowIntensity: { value: glowIntensity },
        uIntensity: { value: intensity },
        uScale: { value: scale },
        uNoiseScale: { value: noiseScale },
        uMouse: { value: [0, 0] },
        uPupilFollow: { value: pupilFollow },
        uFlameSpeed: { value: flameSpeed },
        uEyeColor: { value: hexToVec3(eyeColor) },
        uBgColor: { value: hexToVec3(backgroundColor) }
      }
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    container.appendChild(gl.canvas);

    let frameId: number;
    const update = (time: number) => {
      if (!rendererRef.current) return;
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.05;
      program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];
      program.uniforms.uTime.value = time * 0.001;
      renderer.render({ scene: mesh });
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);

    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onMouseLeave = () => { mouseRef.current.tx = mouseRef.current.ty = 0; };
    const resize = () => {
      if (!rendererRef.current || !container) return;
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', resize);
    resize();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (programRef.current) {
      const p = programRef.current;
      p.uniforms.uPupilSize.value = pupilSize;
      p.uniforms.uIrisWidth.value = irisWidth;
      p.uniforms.uIntensity.value = intensity;
      p.uniforms.uGlowIntensity.value = glowIntensity;
      p.uniforms.uScale.value = scale;
      p.uniforms.uNoiseScale.value = noiseScale;
      p.uniforms.uPupilFollow.value = pupilFollow;
      p.uniforms.uFlameSpeed.value = flameSpeed;
      p.uniforms.uEyeColor.value = hexToVec3(eyeColor);
      p.uniforms.uBgColor.value = hexToVec3(backgroundColor);
    }
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor]);

  return <div ref={containerRef} className="w-full h-full" />;
}
