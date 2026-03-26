"use client"

import { useEffect, useRef } from 'react';
import {
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';

import './floating-lines.css';

const vertexShader = `
precision highp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) return baseColor;
  float clampedT = clamp(t, 0.0, 0.9999);
  float scaled = clampedT * float(lineGradientCount - 1);
  int idx = int(floor(scaled));
  float f = fract(scaled);
  int idx2 = min(idx + 1, lineGradientCount - 1);
  vec3 c1 = lineGradient[idx];
  vec3 c2 = lineGradient[idx2];
  return mix(c1, c2, f) * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;
  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius); 
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }
  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;
  if (parallax) baseUv += parallaxOffset;
  vec3 col = vec3(0.0);
  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);
  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  if (enableBottom) {
    for (int i = 0; i < 8; ++i) {
      if (i >= bottomLineCount) break;
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y), 1.5 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.2;
    }
  }
  if (enableMiddle) {
    for (int i = 0; i < 8; ++i) {
      if (i >= middleLineCount) break;
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y), 2.0 + 0.15 * fi, baseUv, mouseUv, interactive);
    }
  }
  if (enableTop) {
    for (int i = 0; i < 8; ++i) {
      if (i >= topLineCount) break;
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y), 1.0 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.1;
    }
  }
  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

type WavePosition = {
  x: number;
  y: number;
  rotate: number;
};

const DEFAULT_GRADIENT = ['#3b82f6', '#8b5cf6', '#d946ef'];
const DEFAULT_WAVES: Array<'top' | 'middle' | 'bottom'> = ['top', 'middle', 'bottom'];
const DEFAULT_LINE_COUNT = [6, 6, 6];
const DEFAULT_LINE_DISTANCE = [5, 5, 5];
const DEFAULT_TOP_WAVE = { x: 10.0, y: 0.5, rotate: -0.4 };
const DEFAULT_MIDDLE_WAVE = { x: 5.0, y: 0.0, rotate: 0.2 };
const DEFAULT_BOTTOM_WAVE = { x: 2.0, y: -0.7, rotate: 0.4 };

type FloatingLinesProps = {
  linesGradient?: string[];
  enabledWaves?: Array<'top' | 'middle' | 'bottom'>;
  lineCount?: number | number[];
  lineDistance?: number | number[];
  topWavePosition?: WavePosition;
  middleWavePosition?: WavePosition;
  bottomWavePosition?: WavePosition;
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
};

function hexToVec3(hex: string): Vector3 {
  let value = hex.trim().startsWith('#') ? hex.trim().slice(1) : hex.trim();
  let r = 255, g = 255, b = 255;
  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }
  return new Vector3(r / 255, g / 255, b / 255);
}

export default function FloatingLines({
  linesGradient = DEFAULT_GRADIENT,
  enabledWaves = DEFAULT_WAVES,
  lineCount = DEFAULT_LINE_COUNT,
  lineDistance = DEFAULT_LINE_DISTANCE,
  topWavePosition = DEFAULT_TOP_WAVE,
  middleWavePosition = DEFAULT_MIDDLE_WAVE,
  bottomWavePosition = DEFAULT_BOTTOM_WAVE,
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = 'screen'
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const mouseRef = useRef(new Vector2(-1000, -1000));
  const targetMouseRef = useRef(new Vector2(-1000, -1000));
  const influenceRef = useRef(0);
  const targetInfluenceRef = useRef(0);
  const parallaxRef = useRef(new Vector2(0, 0));
  const targetParallaxRef = useRef(new Vector2(0, 0));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.warn("WebGL context creation failed.");
      return;
    }
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const material = new ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vector3(renderer.domElement.width, renderer.domElement.height, 1) },
        animationSpeed: { value: animationSpeed },
        enableTop: { value: enabledWaves.includes('top') },
        enableMiddle: { value: enabledWaves.includes('middle') },
        enableBottom: { value: enabledWaves.includes('bottom') },
        topLineCount: { value: Array.isArray(lineCount) ? lineCount[0] || 6 : lineCount },
        middleLineCount: { value: Array.isArray(lineCount) ? lineCount[1] || 6 : lineCount },
        bottomLineCount: { value: Array.isArray(lineCount) ? lineCount[2] || 6 : lineCount },
        topLineDistance: { value: (Array.isArray(lineDistance) ? lineDistance[0] || 5 : lineDistance) * 0.01 },
        middleLineDistance: { value: (Array.isArray(lineDistance) ? lineDistance[1] || 5 : lineDistance) * 0.01 },
        bottomLineDistance: { value: (Array.isArray(lineDistance) ? lineDistance[2] || 5 : lineDistance) * 0.01 },
        topWavePosition: { value: new Vector3(topWavePosition?.x ?? 10.0, topWavePosition?.y ?? 0.5, topWavePosition?.rotate ?? -0.4) },
        middleWavePosition: { value: new Vector3(middleWavePosition?.x ?? 5.0, middleWavePosition?.y ?? 0.0, middleWavePosition?.rotate ?? 0.2) },
        bottomWavePosition: { value: new Vector3(bottomWavePosition?.x ?? 2.0, bottomWavePosition?.y ?? -0.7, bottomWavePosition?.rotate ?? 0.4) },
        iMouse: { value: new Vector2(-1000, -1000) },
        interactive: { value: interactive },
        bendRadius: { value: bendRadius },
        bendStrength: { value: bendStrength },
        bendInfluence: { value: 0 },
        parallax: { value: parallax },
        parallaxStrength: { value: parallaxStrength },
        parallaxOffset: { value: new Vector2(0, 0) },
        lineGradient: { value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)) },
        lineGradientCount: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    materialRef.current = material;

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock();
    let frameId: number;

    const render = () => {
      if (!rendererRef.current) return;
      material.uniforms.iTime.value = clock.getElapsedTime();
      
      if (interactive) {
        mouseRef.current.lerp(targetMouseRef.current, mouseDamping);
        material.uniforms.iMouse.value.copy(mouseRef.current);
        influenceRef.current += (targetInfluenceRef.current - influenceRef.current) * mouseDamping;
        material.uniforms.bendInfluence.value = influenceRef.current;
      }

      if (parallax) {
        parallaxRef.current.lerp(targetParallaxRef.current, mouseDamping);
        material.uniforms.parallaxOffset.value.copy(parallaxRef.current);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: PointerEvent) => {
      if (!rendererRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dpr = renderer.getPixelRatio();
      targetMouseRef.current.set(x * dpr, (rect.height - y) * dpr);
      targetInfluenceRef.current = 1.0;
      if (parallax) {
        const cx = rect.width / 2, cy = rect.height / 2;
        targetParallaxRef.current.set(((x - cx) / rect.width) * parallaxStrength, -((y - cy) / rect.height) * parallaxStrength);
      }
    };
    const handleMouseLeave = () => { targetInfluenceRef.current = 0.0; };

    if (interactive) {
      container.addEventListener('pointermove', handleMouseMove);
      container.addEventListener('pointerleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        container.removeEventListener('pointermove', handleMouseMove);
        container.removeEventListener('pointerleave', handleMouseLeave);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (materialRef.current) {
      const m = materialRef.current;
      m.uniforms.animationSpeed.value = animationSpeed;
      m.uniforms.enableTop.value = enabledWaves.includes('top');
      m.uniforms.enableMiddle.value = enabledWaves.includes('middle');
      m.uniforms.enableBottom.value = enabledWaves.includes('bottom');
      m.uniforms.interactive.value = interactive;
      m.uniforms.parallax.value = parallax;
      m.uniforms.parallaxStrength.value = parallaxStrength;
      
      const tc = Array.isArray(lineCount) ? lineCount[0] || 6 : lineCount;
      const mc = Array.isArray(lineCount) ? lineCount[1] || 6 : lineCount;
      const bc = Array.isArray(lineCount) ? lineCount[2] || 6 : lineCount;
      m.uniforms.topLineCount.value = tc;
      m.uniforms.middleLineCount.value = mc;
      m.uniforms.bottomLineCount.value = bc;

      const td = (Array.isArray(lineDistance) ? lineDistance[0] || 5 : lineDistance) * 0.01;
      const md = (Array.isArray(lineDistance) ? lineDistance[1] || 5 : lineDistance) * 0.01;
      const bd = (Array.isArray(lineDistance) ? lineDistance[2] || 5 : lineDistance) * 0.01;
      m.uniforms.topLineDistance.value = td;
      m.uniforms.middleLineDistance.value = md;
      m.uniforms.bottomLineDistance.value = bd;

      m.uniforms.topWavePosition.value.set(topWavePosition.x, topWavePosition.y, topWavePosition.rotate);
      m.uniforms.middleWavePosition.value.set(middleWavePosition.x, middleWavePosition.y, middleWavePosition.rotate);
      m.uniforms.bottomWavePosition.value.set(bottomWavePosition.x, bottomWavePosition.y, bottomWavePosition.rotate);
      
      if (linesGradient) {
        const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
        m.uniforms.lineGradientCount.value = stops.length;
        stops.forEach((hex, i) => {
          const v = hexToVec3(hex);
          m.uniforms.lineGradient.value[i].set(v.x, v.y, v.z);
        });
      }
    }
  }, [linesGradient, enabledWaves, lineCount, lineDistance, topWavePosition, middleWavePosition, bottomWavePosition, animationSpeed, interactive, parallax, parallaxStrength]);

  return <div ref={containerRef} className="floating-lines-container" style={{ mixBlendMode }} />;
}
