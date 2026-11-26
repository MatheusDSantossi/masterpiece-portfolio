// Paints a project screenshot with the same stroke model as the landscape:
// elliptical strokes in three sizes, each taking the screenshot color at its center
// and oriented along local edges. Fine strokes appear only where there is detail.
// tone() lifts or dims exposure, boosts saturation and pulls colors toward the project palette.
export const ART_FS = `precision highp float;
uniform vec2 uRes;uniform sampler2D uTex;uniform vec2 uScale,uOffset;uniform float uSeed,uExposure;uniform vec3 cDark,cMid,cLight;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 hash2(vec2 p){return vec2(hash(p),hash(p+17.3));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
vec3 src(vec2 c){vec2 uv=vec2(c.x*uRes.y/uRes.x+.5,c.y+.5);return texture2D(uTex,clamp(uv*uScale+uOffset,0.,1.)).rgb;}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
vec2 grad(vec2 c,float e){return vec2(lum(src(c+vec2(e,0.)))-lum(src(c-vec2(e,0.))),lum(src(c+vec2(0.,e)))-lum(src(c-vec2(0.,e))));}
vec3 tone(vec3 c){
  c=uExposure>=1.?c*uExposure/(1.+(uExposure-1.)*c):c*uExposure;
  float l=lum(c);
  c=mix(vec3(l),c,1.3);
  c=c*c*(3.-2.*c);
  vec3 pal=l<.5?mix(cDark,cMid,l*2.):mix(cMid,cLight,l*2.-1.);
  return clamp(mix(c,pal,.34),0.,1.);}
vec4 lay(vec2 p,float sz,float sd,vec2 asp,float need){
  vec2 id=floor(p/sz);float best=-1.,br=0.;vec2 bc=vec2(0.),bl=vec2(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
    vec2 cid=id+vec2(float(i),float(j));vec2 r=hash2(cid+sd);
    vec2 ctr=(cid+.5+(r-.5)*.85)*sz;
    vec2 g=grad(ctr,sz*.7);float gl=length(g);
    if(gl<need)continue;
    float free=(noise(ctr*3.+uSeed)-.5)*1.7+.3;
    float a=mix(free,atan(g.y,g.x)+1.5708,smoothstep(.03,.15,gl))+(r.y-.5)*.35;
    vec2 dir=vec2(cos(a),sin(a));vec2 d=p-ctr;
    vec2 l=vec2(dot(d,dir),dot(d,vec2(-dir.y,dir.x)))/(sz*asp);
    float e=dot(l,l)+(noise(p*150.+sd)-.5)*.5;float pr=hash(cid*1.31+sd+.5);
    if(e<1.&&pr>best){best=pr;bc=ctr;bl=l;br=r.x;}
  }
  if(best<0.)return vec4(0.);
  vec3 col=tone(src(bc));col*=.9+.2*br;col*=1.+.1*bl.y;col+=(noise(vec2(bl.x*2.5,bl.y*13.)+bc*40.)-.5)*.12;
  return vec4(col,1.);}
vec3 paint(vec2 p){
  vec4 a=lay(p,.016,5.,vec2(1.,.42),.06);if(a.a>0.)return a.rgb;
  vec4 b=lay(p,.03,3.,vec2(1.,.42),0.);if(b.a>0.)return b.rgb;
  vec4 c=lay(p,.06,9.,vec2(1.1,.72),0.);if(c.a>0.)return c.rgb;
  return tone(src(p));}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 col=paint(p);
  col*=.965+.035*sin(gl_FragCoord.x*1.7)*sin(gl_FragCoord.y*1.7);
  col+=(hash(gl_FragCoord.xy)-.5)*.03;
  vec2 v=uv-.5;col*=1.05*(1.-.6*dot(v,v));
  gl_FragColor=vec4(col,1.);}`;
