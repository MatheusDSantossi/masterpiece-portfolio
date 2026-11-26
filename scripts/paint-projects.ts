// Renders each project's painting from its screenshot with ART_FS and saves it to public/paintings/.
// Paintings are rendered here, once, instead of in the visitor's browser: the shader takes
// several seconds of GPU time per painting on integrated graphics and froze the page on first load.
// Run `pnpm paint` after changing a project's screenshot, palette or art direction.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { projects } from "../src/content/projects.ts";
import { ART_HEIGHT, ART_WIDTH, artUniforms, paintingPath, type ArtUniforms } from "../src/lib/paint/art-layout.ts";
import { ART_FS } from "../src/lib/paint/art-shader.ts";

const root = process.cwd();
const only = process.argv.slice(2);
const targets = only.length ? projects.filter((p) => only.includes(p.slug)) : projects;

const dataUrl = (publicPath: string) =>
  `data:image/webp;base64,${readFileSync(join(root, "public", publicPath)).toString("base64")}`;

const browser = await chromium.launch();
const page = await browser.newPage();

for (const project of targets) {
  const src = dataUrl(project.screenshot);
  const size = await page.evaluate(async (s) => {
    const image = new Image();
    image.src = s;
    await image.decode();
    return [image.naturalWidth, image.naturalHeight] as const;
  }, src);
  const uniforms = artUniforms(project, size[0], size[1]);

  const webp = await page.evaluate(
    async ({ s, u, fs, w, h }: { s: string; u: ArtUniforms; fs: string; w: number; h: number }) => {
      const image = new Image();
      image.src = s;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const gl = canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: true });
      if (!gl) throw new Error("WebGL is unavailable");
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("createShader failed");
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      };
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      // Screenshots are not power-of-two sized, so WebGL 1 needs clamping and no mipmaps.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

      const at = (name: string) => gl.getUniformLocation(program, name);
      gl.uniform2f(at("uRes"), w, h);
      gl.uniform1i(at("uTex"), 0);
      gl.uniform2f(at("uScale"), ...u.scale);
      gl.uniform2f(at("uOffset"), ...u.offset);
      gl.uniform1f(at("uExposure"), u.exposure);
      gl.uniform1f(at("uSeed"), u.seed);
      gl.uniform3fv(at("cDark"), u.dark);
      gl.uniform3fv(at("cMid"), u.mid);
      gl.uniform3fv(at("cLight"), u.light);
      gl.viewport(0, 0, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return canvas.toDataURL("image/webp", 0.9);
    },
    { s: src, u: uniforms, fs: ART_FS, w: ART_WIDTH, h: ART_HEIGHT },
  );

  const out = join(root, "public", paintingPath(project.slug));
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, Buffer.from(webp.replace(/^data:image\/webp;base64,/, ""), "base64"));
  process.stdout.write(`painted ${paintingPath(project.slug)}\n`);
}

await browser.close();
