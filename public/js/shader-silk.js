// ============================================================================
// VELORA // PROJECT: CAESAR - AMBIENT 3D BACKGROUND SHADERS
// WebGL Liquid Burgundy Silk & Orbital Halo Shader (#6D001A / #000000)
// ============================================================================

function initCaesarSilkShader(canvasId, isSpotlight = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  function resize() {
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    const height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    renderer.setSize(width, height, false);
  }
  resize();

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(canvas.width, canvas.height) },
    uIsSpotlight: { value: isSpotlight ? 1.0 : 0.0 },
    uColorObsidian: { value: new THREE.Color('#000000') },
    uColorBurgundy: { value: new THREE.Color('#6D001A') },
    uColorPeak: { value: new THREE.Color('#9E0027') },
    uColorGlow: { value: new THREE.Color('#A80029') }
  };

  const fragmentShader = `
    precision mediump float;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uIsSpotlight;
    uniform vec3 uColorObsidian;
    uniform vec3 uColorBurgundy;
    uniform vec3 uColorPeak;
    uniform vec3 uColorGlow;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec2 mouseOffset = (uv - uMouse) * 0.35;
      float dist = length(mouseOffset);

      // Liquid silk domain folding
      float wave1 = sin(uv.x * 5.5 + uTime * 0.7 - uv.y * 3.2) * 0.5 + 0.5;
      float wave2 = cos(uv.y * 6.0 - uTime * 0.5 + sin(uv.x * 4.0 + uTime)) * 0.5 + 0.5;
      float silkFold = pow(wave1 * wave2, 1.65);

      float specular = smoothstep(0.58, 0.88, silkFold) * (1.0 - smoothstep(0.0, 0.85, dist));
      vec3 baseMix = mix(uColorObsidian, uColorBurgundy, silkFold * 0.82);
      vec3 finalColor = mix(baseMix, uColorPeak, specular * 0.65);

      // If Spotlight Banner mode: add orbital burgundy eclipse glow and floating micro embers
      if (uIsSpotlight > 0.5) {
        vec2 center = vec2(0.55, 0.5);
        float ringDist = length(uv - center);
        float ringThickness = 0.28;
        float ring = smoothstep(0.08, 0.0, abs(ringDist - ringThickness));
        
        // Embers
        float emberNoise = sin(uv.x * 40.0 + uTime * 1.5) * cos(uv.y * 35.0 - uTime * 1.2);
        float embers = smoothstep(0.85, 0.98, emberNoise) * 0.4;
        
        finalColor += uColorGlow * (ring * 0.75 + embers);
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  // Pointer smoothing via GSAP quickTo if gsap available
  let xTo, yTo;
  if (typeof gsap !== 'undefined') {
    xTo = gsap.quickTo(uniforms.uMouse.value, 'x', { duration: 0.8, ease: 'power2.out' });
    yTo = gsap.quickTo(uniforms.uMouse.value, 'y', { duration: 0.8, ease: 'power2.out' });
  }

  window.addEventListener('pointermove', (e) => {
    const normX = e.clientX / window.innerWidth;
    const normY = 1.0 - (e.clientY / window.innerHeight);
    if (xTo && yTo) {
      xTo(normX);
      yTo(normY);
    } else {
      uniforms.uMouse.value.set(normX, normY);
    }
  });

  window.addEventListener('resize', () => {
    resize();
    uniforms.uResolution.value.set(canvas.width, canvas.height);
  });

  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  function render() {
    if (isVisible && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      uniforms.uTime.value += 0.012;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  }
  render();
}

window.initCaesarSilkShader = initCaesarSilkShader;

