/*
 * Fullscreen raymarched glass. Keep `shapeBase` and `toLocal` in sync with sdf.ts.
 * Quality is set with defines: STEPS (outer march), INNER (march inside the
 * glass to find the exit point), SPECTRAL (dispersion samples).
 */

export const heroVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const heroFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2 uRes;
uniform float uTime;
uniform float uDrift;

uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamFwd;
uniform float uFocal;
uniform float uPixAngle;

uniform vec3 uObjPos;
uniform mat3 uObjInvRot;
uniform float uObjScale;
uniform float uSquash;
uniform float uBound;

uniform float uStretch;
uniform float uTwist;
uniform float uR;
uniform float uA;
uniform float uB;
uniform float uR2;
uniform float uTube2;
uniform float uTilt2;
uniform float uThick;

uniform vec3 uPtrPos;
uniform float uPtrAmp;
uniform float uPtrRad;

uniform vec4 uRip[4];
uniform vec4 uRipAmp;
uniform float uRipK;
uniform float uRipSpeed;
uniform float uRipWidth;
uniform float uRipDecay;

uniform float uLightAngle;
uniform vec3 uBg;
uniform vec3 uKeyCol;
uniform vec3 uStripCol;
uniform vec3 uRimCol;
uniform vec3 uHazeCol;
uniform vec2 uHazePos;
uniform float uHazeR;
uniform float uHazeK;

uniform sampler2D uAtlas;
uniform float uAtlasRows;
uniform float uAtlasAspect;
uniform vec3 uWordLift;
uniform float uWordA;
uniform float uWordB;
uniform float uWordMix;
uniform vec2 uWordCenter;
uniform float uWordH;

uniform float uDiscW;
uniform float uRimW;
uniform float uIrid;
uniform float uColor;
uniform float uWobble;
uniform float uIntro;
uniform float uGlow;

const float IOR = 1.47;
const float DISPERSION = 0.045;
const float PLANE_Z = -4.0;

// Bubble palette (linear), only reached through uColor.
const vec3 VIOLET = vec3(0.32, 0.1, 0.95);
const vec3 CYAN = vec3(0.08, 0.62, 0.95);
const vec3 GLOW_BLUE = vec3(0.06, 0.2, 0.8);

/* ---------------- shape ---------------- */

float sdEllipse(vec2 q, vec2 r) {
  float k0 = length(q / r);
  float k1 = length(q / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-5);
}

float shapeBase(vec3 p) {
  vec3 s = p;
  s.x /= uStretch;
  float ang = uTwist * s.x;
  float c = cos(ang), sn = sin(ang);
  s.yz = mat2(c, sn, -sn, c) * s.yz;

  float d = sdEllipse(vec2(length(s.xz) - uR, s.y), vec2(uA, uB));

  // Second ring: coincides with the first while uTube2/uR2 match it,
  // then separates inward — it emerges instead of fading in.
  float ct = cos(uTilt2), st = sin(uTilt2);
  vec3 t = s;
  t.yz = mat2(ct, st, -st, ct) * t.yz;
  float d2 = length(vec2(length(t.xz) - uR2, t.y)) - uTube2;

  return min(d, d2) * min(uStretch, 1.0);
}

float mapLocal(vec3 p) {
  float d = shapeBase(p);

  // Organic, low-frequency wobble so the bubble breathes; sized to the thickness.
  if (uWobble > 0.0) {
    float t = uDrift;
    float w = sin(p.x * 2.3 + t * 0.7) * sin(p.y * 2.9 - t * 0.55) * sin(p.z * 2.1 + t * 0.62)
            + 0.5 * sin(p.x * 3.7 - p.z * 2.4 + t * 0.9);
    d -= uWobble * uThick * w;
  }

  // Pointer proximity: a soft bulge toward the cursor, sized to the thickness.
  vec3 dp = p - uPtrPos;
  d -= uPtrAmp * exp(-dot(dp, dp) / (uPtrRad * uPtrRad));

  // Ripples: a traveling, decaying wave packet from each of 4 origins.
  for (int i = 0; i < 4; i++) {
    float amp = uRipAmp[i];
    if (amp <= 0.0) continue;
    float age = uTime - uRip[i].w;
    float x = length(p - uRip[i].xyz) - age * uRipSpeed;
    float env = exp(-x * x / (uRipWidth * uRipWidth)) * exp(-age * uRipDecay);
    d -= amp * env * sin(x * uRipK);
  }
  return d;
}

vec3 toLocal(vec3 p) {
  vec3 q = p - uObjPos;
  float sy = 1.0 + uSquash;
  q.y /= sy;
  q.xz *= sqrt(sy);
  return (uObjInvRot * q) / uObjScale;
}

float worldK() {
  float sy = 1.0 + uSquash;
  return uObjScale * min(sy, inversesqrt(sy));
}

float map(vec3 p) {
  return mapLocal(toLocal(p)) * worldK();
}

vec3 calcNormal(vec3 p, float e) {
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * e) +
    k.yyx * map(p + k.yyx * e) +
    k.yxy * map(p + k.yxy * e) +
    k.xxx * map(p + k.xxx * e));
}

/* ---------------- environment ---------------- */

float softbox(vec3 rd, vec3 c, vec3 up, vec2 size, float soft) {
  float z = dot(rd, c);
  if (z <= 0.0) return 0.0;
  vec3 r = normalize(cross(up, c));
  vec3 u = cross(c, r);
  vec2 xy = vec2(dot(rd, r), dot(rd, u)) / z;
  vec2 e = smoothstep(size, size * (1.0 - soft), abs(xy));
  return e.x * e.y;
}

// Dark studio: one broad key softbox, a tall cool strip, a thin rim strip behind.
vec3 studio(vec3 rd) {
  float a = uLightAngle;
  vec3 d = rd;
  d.xz = mat2(cos(a), sin(a), -sin(a), cos(a)) * d.xz;
  vec3 col = mix(uBg * 0.5, uBg * 2.4, smoothstep(-0.5, 0.9, d.y));
  col += uKeyCol * 2.4 * softbox(d, normalize(vec3(-0.45, 0.62, 0.64)), vec3(0.0, 1.0, 0.0), vec2(0.55, 0.32), 0.9);
  col += mix(uStripCol, VIOLET * 2.0, uColor) * 2.2 * softbox(d, normalize(vec3(0.95, 0.05, 0.3)), vec3(0.0, 1.0, 0.0), vec2(0.07, 1.1), 0.6);
  col += mix(uRimCol, CYAN * 1.6, uColor) * 1.6 * softbox(d, normalize(vec3(-0.1, 0.3, -1.0)), vec3(0.0, 1.0, 0.0), vec2(1.3, 0.06), 0.65);
  // A low cyan fill that only exists in bubble color.
  col += CYAN * 1.8 * uColor * softbox(d, normalize(vec3(0.7, -0.55, 0.45)), vec3(0.0, 1.0, 0.0), vec2(0.35, 0.12), 0.7);
  return col;
}

float wordRow(vec2 uv, float row) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  float v = 1.0 - (row + 1.0 - uv.y) / uAtlasRows;
  return texture(uAtlas, vec2(uv.x, v)).r;
}

// The backdrop plane: canvas color, a soft haze behind the object and the
// chapter word. Glass refracts this, so the word bends through it.
vec3 backdrop(vec3 ro, vec3 rd, float lights) {
  vec3 col = uBg;
  if (rd.z < -0.02) {
    vec2 hp = (ro + rd * ((PLANE_Z - ro.z) / rd.z)).xy;
    vec2 dh = (hp - uHazePos) / uHazeR;
    col += uHazeCol * uHazeK * exp(-dot(dh, dh));
    vec2 uv = vec2((hp.x - uWordCenter.x) / (uWordH * uAtlasAspect) + 0.5, (hp.y - uWordCenter.y) / uWordH + 0.5);
    float w = mix(wordRow(uv, uWordA), wordRow(uv, uWordB), uWordMix);
    col += uWordLift * w;
  }
  if (lights > 0.0) col += studio(rd) * lights;
  return col;
}

vec3 spectral(float w) {
  vec3 x = (vec3(w) - vec3(0.85, 0.5, 0.15)) / 0.3;
  return exp(-x * x);
}

/* ---------------- shading ---------------- */

vec3 shade(vec3 p, vec3 rd, float t) {
  float pix = uPixAngle * t;
  float e = max(pix * 0.5, 0.0006 * uObjScale);
  vec3 n = calcNormal(p, e);
  float cosi = clamp(dot(-rd, n), 0.0, 1.0);
  float F = 0.04 + 0.96 * pow(1.0 - cosi, 5.0);

  // Reflection, tinted by thin-film interference at grazing angles only.
  vec3 refl = studio(reflect(rd, n));
  // Thin-film interference: optical path varies with film thickness (swirling) and angle;
  // per-channel wavelengths give the soap-bubble bands.
  vec3 pl0 = toLocal(p);
  float swirl = sin(pl0.y * 3.1 + sin(pl0.x * 2.2 + uDrift * 0.3) * 1.6 + uDrift * 0.2)
              + 0.5 * sin(pl0.z * 4.3 - pl0.y * 1.7 - uDrift * 0.25);
  float thickness = 1.1 + 0.45 * swirl;
  float cosT = sqrt(max(1.0 - (1.0 - cosi * cosi) / (1.33 * 1.33), 0.0));
  vec3 filmCol = 0.5 + 0.5 * cos(6.2831 * thickness * cosT * vec3(1.0, 1.23, 1.48) * 1.6 + 3.1416);
  float edge = (1.0 - cosi) * (1.0 - cosi);
  float filmW = uIrid * mix(edge, 0.12 + 0.88 * edge, uColor);
  refl *= mix(vec3(1.0), 0.3 + filmCol * 1.4, filmW);

  // Refraction in, march inside the SDF to the exit, disperse on the way out.
  vec3 rd1 = refract(rd, n, 1.0 / IOR);
  vec3 q = p - n * e * 3.0;
  float ti = 0.0;
  float maxT = uBound * 2.0;
  for (int i = 0; i < INNER; i++) {
    float d = -map(q + rd1 * ti);
    if (d < e) break;
    ti += max(d * 0.9, e);
    if (ti > maxT) break;
  }
  vec3 pe = q + rd1 * ti;
  vec3 ne = calcNormal(pe, e);

  vec3 acc = vec3(0.0);
  vec3 wsum = vec3(0.0);
  for (int i = 0; i < SPECTRAL; i++) {
    float w = float(i) / float(SPECTRAL - 1);
    float ior = IOR + DISPERSION * (w - 0.5);
    vec3 rd2 = refract(rd1, -ne, ior);
    if (dot(rd2, rd2) < 1e-4) rd2 = reflect(rd1, -ne);
    vec3 sw = spectral(w);
    acc += backdrop(pe, rd2, 0.55) * sw;
    wsum += sw;
  }
  vec3 refr = acc / wsum;
  // Faint navy absorption with path length.
  refr *= exp(-vec3(0.55, 0.42, 0.22) * ti / uObjScale);

  vec3 col = mix(refr, refl, F);

  // Bubble: a rainbow band hugging the silhouette.
  col += filmCol * pow(1.0 - cosi, 3.0) * uColor * 0.42;

  // Colored rim for the rings.
  col += uRimCol * pow(1.0 - cosi, 3.0) * uRimW * 1.4;

  // Emissive striations for the disc, band-limited by the pixel footprint.
  if (uDiscW > 0.001) {
    vec3 pl = toLocal(p);
    float rr = length(pl.xz) / max(uA, 1e-3);
    float F0 = 34.0;
    float foot = pix / (uObjScale * max(uA, 1e-3));
    float aa = 1.0 - smoothstep(0.2, 0.6, F0 * foot);
    float s = 0.5 + 0.5 * cos(6.2831 * (rr * F0 - uDrift * 0.12));
    s = mix(0.31, s * s * s, aa);
    col += uKeyCol * s * uDiscW * smoothstep(0.62, 1.0, rr) * 0.09;
  }
  return col;
}

/* ---------------- post ---------------- */

vec3 filmic(vec3 c) {
  // Identity below 0.6 (the canvas color stays exact), soft shoulder above.
  vec3 s = 0.6 + 0.4 * (1.0 - exp(-(c - 0.6) / 0.4));
  return mix(c, s, step(0.6, c));
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamFwd * uFocal + uCamRight * uv.x + uCamUp * uv.y);

  vec3 col = backdrop(ro, rd, 0.0);

  // Bounding sphere first: most pixels never march.
  vec3 oc = ro - uObjPos;
  float b = dot(oc, rd);
  float h = b * b - (dot(oc, oc) - uBound * uBound);
  if (h > 0.0 && uIntro > 0.001) {
    float sh = sqrt(h);
    float t = max(-b - sh, 0.0);
    float tEnd = -b + sh;
    float rmin = 1e9;
    float tmin = t;
    float dmin = 1e9;
    bool hit = false;
    for (int i = 0; i < STEPS; i++) {
      float d = map(ro + rd * t);
      float pix = uPixAngle * t;
      float r = d / pix;
      if (r < rmin) { rmin = r; tmin = t; }
      dmin = min(dmin, d);
      // Hit threshold scaled to the pixel footprint.
      if (r < 0.25) { hit = true; break; }
      t += d * 0.8;
      if (t > tEnd) break;
    }

    // Tight, quiet glow hugging the silhouette.
    // Fade out well before the bounding sphere so the glow never shows its edge.
    float rayDist = sqrt(max(dot(oc, oc) - b * b, 0.0));
    float glowFade = 1.0 - smoothstep(0.78 * uBound, 0.98 * uBound, rayDist);
    float glowK = uGlow * glowFade * exp(-max(dmin, 0.0) / (0.028 * uObjScale + 0.015));
    col += mix(uHazeCol, GLOW_BLUE * 0.9, uColor) * glowK * (1.0 + uColor * 0.35);

    // Analytic coverage: blend the surface in over one pixel of closest approach.
    float cov = hit ? 1.0 : clamp(1.25 - rmin, 0.0, 1.0);
    if (cov > 0.0) {
      vec3 obj = shade(ro + rd * tmin, rd, tmin);
      col = mix(col, obj, cov * uIntro);
    }
  }

  // Light vignette.
  vec2 v = vUv * 2.0 - 1.0;
  col *= 1.0 - 0.1 * smoothstep(0.6, 1.5, length(v));

  col = toSrgb(filmic(col));
  col += (ign(gl_FragCoord.xy) - 0.5) / 255.0 * 1.5;
  gl_FragColor = vec4(col, 1.0);
}
`
