"use client";

import { useEffect, useRef } from "react";

export function HalftoneBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);

    // Render below native DPR: this is a deliberately soft background and the
    // lower buffer avoids spending a full GPU frame budget on decoration.
    function resize() {
      if (!canvas) return;
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      gl?.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();

    // Vertex Shader
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // Fragment Shader (Halftone Flow - Solar Theme)
    const fsSource = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;

        mat2 rot(float a) {
            float s = sin(a), c = cos(a);
            return mat2(c, -s, s, c);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 p = uv * 2.0 - 1.0;
            p.x *= u_resolution.x / u_resolution.y;

            vec2 flow_uv = p;
            float time = u_time * 0.4;
            
            for(float i = 1.0; i < 4.0; i++) {
                flow_uv *= rot(time * 0.1);
                flow_uv.x += sin(flow_uv.y * 2.0 * i + time) * 0.5;
                flow_uv.y += cos(flow_uv.x * 1.5 * i - time * 0.8) * 0.5;
            }

            float intensity = sin(flow_uv.x * 2.0 + flow_uv.y * 3.0) * 0.5 + 0.5;
            
            // Solar Theme Colors
            vec3 col_dark = vec3(0.05, 0.0, 0.0);
            vec3 col_red = vec3(0.9, 0.2, 0.05); // vibrant orange-red
            vec3 col_bright = vec3(1.0, 0.8, 0.2); // sun yellow
            
            vec3 fluid_color = mix(col_dark, col_red, smoothstep(0.2, 0.6, intensity));
            fluid_color = mix(fluid_color, col_bright, smoothstep(0.7, 1.0, intensity));

            float gridSize = 6.0; 
            vec2 grid_uv = gl_FragCoord.xy / gridSize;
            vec2 cell_uv = fract(grid_uv) - 0.5;
            
            float dist = length(cell_uv);
            float radius = intensity * 0.45; 
            float dot_mask = smoothstep(radius, radius - 0.1, dist);
            
            vec3 final_color = mix(vec3(0.0), fluid_color, dot_mask);
            final_color += fluid_color * 0.15; // base glow

            gl_FragColor = vec4(final_color, 1.0);
        }
    `;

    function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positions = new Float32Array([
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    const startTime = Date.now();
    let animationFrameId: number | undefined;
    let lastFrame = 0;

    function render(now = 0) {
      if (!gl || !canvas) return;
      if (document.visibilityState !== "visible") {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      // Decorative motion is intentionally capped at 30fps. The shader time
      // stays continuous, so the visual remains fluid without a 60fps loop.
      if (!reducedMotion && now - lastFrame < 33) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (Date.now() - startTime) / 1000.0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reducedMotion) animationFrameId = requestAnimationFrame(render);
    }
    render(performance.now());

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-20" />;
}
