// GLSL for the background landscape, ported verbatim from the v2 design file.
// Strokes are laid in two layers; each stroke takes the color of the scene at its center.
export const LANDSCAPE_FS = `precision highp float;
uniform vec2 uRes,uMouse,uPar,uSun;uniform float uBead,uSeed,uDim,uStars;uniform vec3 cTop,cLow,cSun,cHill,cWater;
const float H=-.06;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 hash2(vec2 p){return vec2(hash(p),hash(p+17.3));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}
float n1(float x){return noise(vec2(x,uSeed*3.7));}
vec3 sky(vec2 c,float h){
  float t=clamp((c.y-h)/.62,0.,1.);
  vec3 col=mix(cLow,cTop,pow(t,.75));
  float n=fbm(c*vec2(1.4,4.2)+vec2(uSeed+uPar.x*.05,uSeed));
  col=mix(col,mix(cLow,vec3(1.),.35),smoothstep(.54,.86,n)*.48*(1.-.8*uStars)*(.3+.7*t));
  float d=length(c-uSun);
  col+=cSun*exp(-d*5.5)*.5*(1.-uStars);
  col=mix(col,cSun*1.1,smoothstep(.062,.05,d)*(1.-uStars));
  vec2 mo=vec2(.40,.30);float dm=length(c-mo);
  col+=vec3(.55,.62,.75)*exp(-dm*9.)*.35*uStars;
  col=mix(col,vec3(.95,.92,.80),smoothstep(.046,.036,dm)*uStars);
  col+=step(.9925,hash(floor(c*44.)+uSeed))*uStars*smoothstep(.04,.3,t)*vec3(1.,.95,.8);
  float r1=h+.02+.21*n1(c.x*1.25+3.+uPar.x*.04);
  float r2=h-.004+.12*n1(c.x*2.3+9.+uPar.x*.09);
  if(c.y<r1)col=mix(cHill,cLow,.5);
  if(c.y<r2)col=mix(cHill,cLow,.18);
  return col;}
vec3 scene(vec2 c){
  float h=H+uPar.y*.02;vec3 col;
  if(c.y>h)col=sky(c,h);
  else{
    float dep=h-c.y;
    float wob=(noise(vec2(c.x*2.5+uSeed,c.y*38.))-.5)*(.03+dep*.24);
    col=sky(vec2(c.x+wob,h+dep*.9),h);
    col=mix(col,cWater,.30+dep*.55);
    float lx=mix(uSun.x,.40,uStars);
    float g=exp(-abs(c.x-lx+wob*3.)*(8.-dep*7.))*smoothstep(.38,.72,noise(vec2(c.x*6.,c.y*70.)));
    col+=mix(cSun,vec3(.8,.82,.78),uStars)*g*.5;
  }
  float bank=-.41+.07*n1(c.x*1.1+20.)+.03*n1(c.x*5.+4.)-c.x*.03+uPar.y*.05;
  float reed=bank+.11*pow(noise(vec2(c.x*70.+uPar.x*2.,1.)),3.)*step(.5,n1(c.x*3.+2.));
  if(c.y<reed)col=mix(cHill*.5,cWater*.45,.25);
  if(c.y<bank)col=mix(cHill*.42,cWater*.5,.35);
  return col;}
float sAng(vec2 c){if(c.y<H)return (noise(c*6.)-.5)*.3;return (noise(c*2.+uSeed)-.5)*1.7+.3;}
vec4 lay(vec2 p,float sz,float sd,vec2 asp){
  vec2 id=floor(p/sz);float best=-1.,br=0.;vec2 bc=vec2(0.),bl=vec2(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
    vec2 cid=id+vec2(float(i),float(j));vec2 r=hash2(cid+sd);
    vec2 ctr=(cid+.5+(r-.5)*.85)*sz;float a=sAng(ctr)+(r.y-.5)*.5;vec2 dir=vec2(cos(a),sin(a));vec2 d=p-ctr;
    vec2 l=vec2(dot(d,dir),dot(d,vec2(-dir.y,dir.x)))/(sz*asp);
    float e=dot(l,l)+(noise(p*150.+sd)-.5)*.5;float pr=hash(cid*1.31+sd+.5);
    if(e<1.&&pr>best){best=pr;bc=ctr;bl=l;br=r.x;}
  }
  if(best<0.)return vec4(0.);
  vec3 col=scene(bc);col*=.88+.24*br;col*=1.+.11*bl.y;col+=(noise(vec2(bl.x*2.5,bl.y*13.)+bc*40.)-.5)*.12;
  return vec4(col,1.);}
vec3 paint(vec2 p){vec4 a=lay(p,.024,3.,vec2(1.,.42));if(a.a>0.)return a.rgb;vec4 b=lay(p,.052,9.,vec2(1.1,.72));if(b.a>0.)return b.rgb;return scene(p);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 m=(uMouse-.5*uRes)/uRes.y;
  vec3 col;float R=uBead;vec2 dd=(p-m)/max(R,.0001);float l=length(dd);
  if(R>0.&&l<1.){
    float z=sqrt(1.-l*l);
    col=paint(m+dd*R*mix(.3,1.,l*l*l))*1.1;
    vec3 n=normalize(vec3(dd,z));
    col+=pow(max(dot(n,normalize(vec3(-.45,.6,.66))),0.),60.)*.9;
    col=mix(col,vec3(1.),pow(1.-z,4.)*.28);
    col*=smoothstep(1.,.985,l)*.25+.75;
  }else{
    col=paint(p);
    if(R>0.)col*=1.-.38*smoothstep(1.5,.95,length((p-m-vec2(.03,-.05))/R));
  }
  col*=.965+.035*sin(gl_FragCoord.x*1.7)*sin(gl_FragCoord.y*1.7);
  col+=(hash(gl_FragCoord.xy)-.5)*.03;
  vec2 v=uv-.5;col*=uDim*(1.-.5*dot(v,v));
  gl_FragColor=vec4(col,1.);}`;
