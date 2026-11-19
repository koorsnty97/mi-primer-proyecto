const COLORS=['#ff7a59','#7fd1b9','#f2c14e','#f4f1ec'];
const $=s=>document.querySelector(s);

/* ---------- Intérprete de expresiones (sin eval) ---------- */
const FN={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,abs:Math.abs,sqrt:Math.sqrt,exp:Math.exp,ln:Math.log,log:Math.log10,log2:Math.log2,floor:Math.floor,ceil:Math.ceil,round:Math.round,sign:Math.sign,min:Math.min,max:Math.max,pow:Math.pow,
  sec:a=>1/Math.cos(a),csc:a=>1/Math.sin(a),cot:a=>1/Math.tan(a),
  sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,asinh:Math.asinh,acosh:Math.acosh,atanh:Math.atanh,
  atan2:Math.atan2,hypot:Math.hypot,cbrt:Math.cbrt,trunc:Math.trunc,
  rad:a=>a*Math.PI/180,deg:a=>a*180/Math.PI,
  clamp:(a,lo,hi)=>Math.min(hi,Math.max(lo,a)),step:(a,b)=>a>=b?1:0,
  /* ondas: periodo 2π, igual que sin */
  square:a=>Math.sin(a)>=0?1:-1,
  saw:a=>{const p=a/(2*Math.PI);return 2*(p-Math.floor(p+.5))},
  tri:a=>2/Math.PI*Math.asin(Math.sin(a)),
  pulse:(a,d)=>{const p=a/(2*Math.PI);return p-Math.floor(p)<d?1:-1},
  sinc:a=>a===0?1:Math.sin(a)/a,
  noise:a=>{const s=Math.sin(a*12.9898)*43758.5453;return 2*(s-Math.floor(s))-1},
  frac:a=>a-Math.floor(a),mod:(a,b)=>((a%b)+b)%b,if:(c,a,b)=>c?a:b,
  pick:(i,...v)=>v.length?v[((Math.floor(i)%v.length)+v.length)%v.length]:NaN};
const gamma=z=>{if(z<.5)return Math.PI/(Math.sin(Math.PI*z)*gamma(1-z));z-=1;
  const c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  let a=c[0];const t=z+7.5;for(let i=1;i<9;i++)a+=c[i]/(z+i);
  return Math.sqrt(2*Math.PI)*Math.pow(t,z+.5)*Math.exp(-t)*a};
const fact=n=>{if(Number.isInteger(n)&&n>=0&&n<171){let r=1;for(let i=2;i<=n;i++)r*=i;return r}return gamma(n+1)};
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a};
const erf=x=>{const s=Math.sign(x);x=Math.abs(x);const t=1/(1+.3275911*x);
  return s*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x))};
Object.assign(FN,{
  logb:(a,b)=>Math.log(a)/Math.log(b),
  log:(a,b)=>b===undefined?Math.log10(a):Math.log(a)/Math.log(b),
  round:(a,n=0)=>{const p=10**n;return Math.round(a*p)/p},
  root:(a,n)=>a<0&&n%2===1?-Math.pow(-a,1/n):Math.pow(a,1/n),
  exp2:a=>2**a,expm1:Math.expm1,log1p:Math.log1p,sgn:Math.sign,
  fact,gamma,erf,gcd,lcm:(a,b)=>a&&b?Math.abs(a*b)/gcd(a,b):0,
  ncr:(n,k)=>k<0||k>n?0:Math.round(fact(n)/(fact(k)*fact(n-k))),
  npr:(n,k)=>k<0||k>n?0:Math.round(fact(n)/fact(n-k)),
  fib:n=>Math.round(Math.pow((1+Math.sqrt(5))/2,n)/Math.sqrt(5)),
  isprime:n=>{if(n<2||n!==Math.floor(n))return 0;for(let i=2;i*i<=n;i++)if(n%i===0)return 0;return 1},
  acot:a=>Math.atan(1/a),asec:a=>Math.acos(1/a),acsc:a=>Math.asin(1/a),
  sech:a=>1/Math.cosh(a),csch:a=>1/Math.sinh(a),coth:a=>1/Math.tanh(a),
  sind:a=>Math.sin(a*Math.PI/180),cosd:a=>Math.cos(a*Math.PI/180),tand:a=>Math.tan(a*Math.PI/180),
  gauss:a=>Math.exp(-a*a),sigmoid:a=>1/(1+Math.exp(-a)),relu:a=>Math.max(0,a),heaviside:a=>a>=0?1:0,
  smoothstep:(a,lo,hi)=>{const t=Math.min(1,Math.max(0,(a-lo)/(hi-lo)));return t*t*(3-2*t)},
  lerp:(a,b,t)=>a+(b-a)*t,
  avg:(...v)=>v.reduce((p,q)=>p+q,0)/v.length,
  and:(a,b)=>a&&b?1:0,or:(a,b)=>a||b?1:0,not:a=>a?0:1,
  /* ayudas musicales (con 12 semitonos por unidad y nota base 60) */
  semi:a=>a/12,                      /* semitonos → unidades de y */
  hz:f=>Math.log2(f/261.6256)        /* frecuencia en Hz → y */
});
const CONST={pi:Math.PI,tau:2*Math.PI,e:Math.E,phi:(1+Math.sqrt(5))/2,sqrt2:Math.SQRT2,ln2:Math.LN2,ln10:Math.LN10,inf:Infinity,rest:NaN};

function compile(src){
  const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹';
  src=src.replace(/[−–—]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/\*\*/g,'^').replace(/π/g,'pi')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,m=>'^'+[...m].map(c=>SUP.indexOf(c)).join(''))
    .replace(/√\s*(\d+\.?\d*|[A-Za-z]\w*)/g,'sqrt($1)').replace(/√/g,'sqrt')
    .replace(/(^|[^A-Za-z_\d.])e-(\d*\.?\d+)(x?)/gi,(m,p,n,v)=>p+'e^(-'+n+(v?'*x':'')+')') /* e-0.2x → e^(-0.2x) */
    .replace(/(^|[^A-Za-z_\d.])([xt])(\d+)/gi,'$1$2^$3'); /* x2 → x^2 */
  let dv=null; /* prefijo: y=, f(x)=, y(x)=, g(t)=, h(u)= … */
  src=src.replace(/^\s*[A-Za-z]\w*\s*(?:\(\s*([A-Za-z])\s*\))?\s*=(?!=)/,(m,a)=>{dv=a;return''});
  const VARS=new Set(['x','t']);if(dv)VARS.add(dv.toLowerCase());
  const re=/\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)|([A-Za-z_]+\d*)|(<=|>=|==|!=|[-+*\/%^(),<>!]))/y,T=[];
  const known=s=>s in FN||s in CONST||VARS.has(s);
  function splitId(id){ /* xsin → x, sin · sinx → sin, x · cos2 → cos, 2 */
    if(known(id))return[{id}];
    const L=id.replace(/\d+$/,''),D=id.slice(L.length),out=[];let s=L;
    while(s){let k=s.length;while(k>0&&!known(s.slice(0,k)))k--;
      if(!k)throw Error('No conozco «'+L+'»'+(/y/.test(L)?' (la variable es x; y es el resultado)':''));out.push({id:s.slice(0,k)});s=s.slice(k)}
    if(D)out.push({n:+D});return out}
  while(re.lastIndex<src.length){
    if(/^\s*$/.test(src.slice(re.lastIndex)))break;
    const p=re.lastIndex,m=re.exec(src);
    if(!m)throw Error('Carácter no válido cerca de «'+src.slice(p,p+3).trim()+'»');
    if(m[1]!==undefined)T.push({n:+m[1]});else if(m[2])T.push(...splitId(m[2].toLowerCase()));else T.push({op:m[3]});
  }
  let i=0;const isOp=o=>T[i]&&T[i].op===o;
  const CMP={'<':(a,b)=>a<b,'>':(a,b)=>a>b,'<=':(a,b)=>a<=b,'>=':(a,b)=>a>=b,'==':(a,b)=>a===b,'!=':(a,b)=>a!==b};
  function cmp(){let a=add();const t=T[i];
    if(t&&CMP[t.op]){i++;const b=add(),l=a,f=CMP[t.op];a=x=>f(l(x),b(x))?1:0}
    return a}
  function add(){let a=mul();
    while(isOp('+')||isOp('-')){const o=T[i++].op,b=mul(),l=a;a=o==='+'?x=>l(x)+b(x):x=>l(x)-b(x)}
    return a}
  function mul(){let a=un();
    for(;;){const t=T[i];if(!t)break;let o='*';
      if(t.op==='*'||t.op==='/'||t.op==='%'){o=t.op;i++}
      else if(!(t.n!==undefined||t.id||t.op==='('))break; /* multiplicación implícita: 2x, 3(x+1) */
      const b=un(),l=a;
      a=o==='*'?x=>l(x)*b(x):o==='/'?x=>l(x)/b(x):x=>{const q=b(x);return((l(x)%q)+q)%q};}
    return a}
  function un(){
    if(isOp('-')){i++;const a=un();return x=>-a(x)}
    if(isOp('+')){i++;return un()}
    const a=post(pr());
    if(isOp('^')){i++;const b=un();return x=>Math.pow(a(x),b(x))}
    return a}
  function post(a){while(isOp('!')){i++;const l=a;a=x=>fact(l(x))}return a}
  function item(){const a=post(pr());if(isOp('^')){i++;const b=un();return x=>Math.pow(a(x),b(x))}return a}
  function arg(){ /* argumento sin paréntesis: números y variables pegados, p. ej. 2x en cos2x */
    if(isOp('-')){i++;const a=arg();return x=>-a(x)}
    let a=item();
    while(T[i]&&(T[i].n!==undefined||(T[i].id&&!(T[i].id in FN))||T[i].op==='(')){const b=item(),l=a;a=x=>l(x)*b(x)}
    return a}
  function pr(){const t=T[i++];
    if(!t)throw Error('Expresión incompleta');
    if(t.n!==undefined)return()=>t.n;
    if(t.op==='('){const a=cmp();if(!isOp(')'))throw Error('Falta «)»');i++;return a}
    if(t.id){
      if(t.id in FN&&isOp('(')){i++;const args=[];
        if(!isOp(')')){do{args.push(cmp())}while(isOp(',')&&++i)}
        if(!isOp(')'))throw Error('Falta «)»');i++;
        const f=FN[t.id];return x=>f(...args.map(g=>g(x)))}
      if(t.id in FN){const a=arg(),f=FN[t.id];return x=>f(a(x))} /* sin3x → sin(3x) */
      if(VARS.has(t.id))return x=>x;
      if(t.id in CONST){const v=CONST[t.id];return()=>v}
      throw Error('No conozco «'+t.id+'»')}
    throw Error('Símbolo inesperado «'+t.op+'»')}
  const f=cmp();
  if(i<T.length)throw Error('Sobra «'+(T[i].op||T[i].id||T[i].n)+'»');
  return f}

/* ---------- Lista de funciones ---------- */
const list=$('#list');let exprs=[],fns=[];
function build(){
  list.innerHTML='';
  exprs.forEach((s,i)=>{
    const r=document.createElement('div');
    r.innerHTML=`<div class="fn"><span class="dot" style="background:${COLORS[i]}"></span><input spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Función ${i+1}"><button title="Quitar">✕</button></div><div class="err"></div>`;
    const inp=r.querySelector('input');inp.value=s;
    inp.oninput=()=>{exprs[i]=inp.value;compileAll();draw()};
    r.querySelector('button').onclick=()=>{exprs.splice(i,1);if(!exprs.length)exprs.push('');build();draw()};
    list.append(r)});
  $('#add').hidden=exprs.length>=4;compileAll()}
function compileAll(){
  fns=[];
  [...list.children].forEach((r,i)=>{
    const e=r.querySelector('.err');e.textContent='';let f=null;
    if(exprs[i].trim()){try{f=compile(exprs[i])}catch(er){e.textContent=er.message}}
    fns[i]=f})}
$('#add').onclick=()=>{exprs.push('');build()};

/* ---------- Gráfica ---------- */
const cv=$('#cv'),g=cv.getContext('2d');let cursor=0;
const cfg=()=>({dur:+$('#dur').value||8,x0:+$('#x0').value,x1:+$('#x1').value||1,y0:+$('#y0').value,y1:+$('#y1').value||1,base:+$('#base').value,st:+$('#st').value,wave:$('#wave').value,vol:+$('#vol').value,q:$('#q').checked});
function size(){const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;cv.width=r.width*d;cv.height=r.height*d;draw()}
function nice(span){const raw=span/6,p=10**Math.floor(Math.log10(raw)),n=raw/p;return(n<1.5?1:n<3.5?2:n<7.5?5:10)*p}
function draw(frac=cursor){
  const c=cfg(),W=cv.width,H=cv.height,d=devicePixelRatio||1;
  const X=x=>(x-c.x0)/(c.x1-c.x0)*W,Y=y=>Math.max(-1e5,Math.min(1e5,H-(y-c.y0)/(c.y1-c.y0)*H));
  const line=(a,b,c2,d2)=>{g.beginPath();g.moveTo(a,b);g.lineTo(c2,d2);g.stroke()};
  g.clearRect(0,0,W,H);g.font=11*d+'px system-ui';g.lineWidth=d;g.strokeStyle='#241f1c';g.fillStyle='#6f6963';
  let s=nice(c.x1-c.x0);
  for(let x=Math.ceil(c.x0/s)*s;x<=c.x1;x+=s){line(X(x),0,X(x),H);g.fillText(+x.toFixed(6),X(x)+3*d,H-4*d)}
  s=nice(c.y1-c.y0);
  for(let y=Math.ceil(c.y0/s)*s;y<=c.y1;y+=s){line(0,Y(y),W,Y(y));g.fillText(+y.toFixed(6),4*d,Y(y)-3*d)}
  g.strokeStyle='#8a847d';
  if(c.y0<0&&c.y1>0)line(0,Y(0),W,Y(0));
  if(c.x0<0&&c.x1>0)line(X(0),0,X(0),H);
  fns.forEach((f,i)=>{if(!f)return;
    g.strokeStyle=COLORS[i];g.lineWidth=2.2*d;g.beginPath();let pen=false;
    for(let px=0;px<=W;px+=d){const y=f(c.x0+px/W*(c.x1-c.x0));
      if(!isFinite(y)){pen=false;continue}
      pen?g.lineTo(px,Y(y)):g.moveTo(px,Y(y));pen=true}
    g.stroke()});
  const px=frac*W,xv=c.x0+frac*(c.x1-c.x0);
  g.strokeStyle='#ffffff55';g.lineWidth=d;line(px,0,px,H);
  fns.forEach((f,i)=>{if(!f)return;const y=f(xv);if(!isFinite(y))return;
    g.fillStyle=COLORS[i];g.beginPath();g.arc(px,Y(y),6*d,0,7);g.fill()})}

/* ---------- Audio ---------- */
let ctx,src,t0=0,dur=8,playing=false;
const midiHz=m=>440*2**((m-69)/12);
function synth(sr){
  const c=cfg(),act=fns.filter(Boolean);if(!act.length)return null;
  const n=Math.floor(c.dur*sr),out=new Float32Array(n),CR=400,k=1-Math.exp(-1/(0.004*sr));
  const ph=act.map(()=>0),env=act.map(()=>0),fr=act.map(()=>0),gt=act.map(()=>0);
  const amp=c.vol/Math.pow(act.length,.6);let last=-1;
  for(let s=0;s<n;s++){
    const kk=Math.floor(s/sr*CR);
    if(kk!==last){last=kk;const x=c.x0+(kk/CR/c.dur)*(c.x1-c.x0);
      act.forEach((f,v)=>{const y=f(x);let m=c.base+y*c.st;if(c.q)m=Math.round(m);
        const hz=midiHz(m),ok=isFinite(y)&&hz>20&&hz<12000;gt[v]=ok?1:0;if(ok)fr[v]=hz})}
    let sum=0;
    for(let v=0;v<act.length;v++){
      env[v]+=(gt[v]-env[v])*k;ph[v]+=fr[v]/sr;ph[v]-=Math.floor(ph[v]);const p=ph[v];
      const w=c.wave==='sine'?Math.sin(6.2831853*p):c.wave==='square'?(p<.5?.6:-.6):c.wave==='saw'?(2*p-1)*.6:(4*Math.abs(p-.5)-1)*.9;
      sum+=w*env[v]}
    out[s]=Math.tanh(sum*amp)}
  return out}
function stop(){
  if(src){const s=src;src=null;s.onended=null;try{s.stop()}catch{}}
  playing=false;$('#play').textContent='▶ Reproducir'}
function play(){
  stop();ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();
  if(ctx.state==='suspended')ctx.resume();
  const data=synth(ctx.sampleRate);if(!data)return;
  const c=cfg(),buf=ctx.createBuffer(1,data.length,ctx.sampleRate);buf.copyToChannel(data,0);
  const me=src=ctx.createBufferSource();me.buffer=buf;me.connect(ctx.destination);
  const off=cursor>=.999?0:cursor*c.dur;dur=c.dur;t0=ctx.currentTime-off;me.start(0,off);
  playing=true;$('#play').textContent='■ Detener';
  me.onended=()=>{if(src===me){stop();cursor=0;draw()}}}
(function loop(){if(playing){cursor=Math.min(1,(ctx.currentTime-t0)/dur);draw()}requestAnimationFrame(loop)})();

$('#play').onclick=()=>playing?stop():play();
$('#rew').onclick=()=>{stop();cursor=0;draw()};
cv.onpointerdown=e=>{const r=cv.getBoundingClientRect();cursor=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));playing?play():draw()};
document.querySelectorAll('details input,details select').forEach(e=>e.addEventListener('input',()=>draw()));
addEventListener('resize',size);

/* ---------- Ejemplos ---------- */
const OM='pick(floor(2*x),4,4,5,7,7,5,4,2,0,0,2,4,4,2,2)/12';
const P={
  'Seno suave':{f:['0.5*sin(x)'],x1:8,dur:8},
  'Vibrato':{f:['x/16+0.05*sin(40*x)'],x1:8,dur:8},
  'Onda cuadrada':{f:['0.3*square(x)'],x1:25,dur:8},
  'Onda triangular':{f:['0.5*tri(2*x)'],x1:25,dur:8},
  'Fourier (cuadrada)':{f:['0.5*(sin(x)+sin(3*x)/3+sin(5*x)/5+sin(7*x)/7)'],x1:25,dur:8},
  'Seno amortiguado':{f:['exp(-x/3)*sin(6*x)'],x1:8,dur:8},
  'Escala mayor':{f:['pick(floor(x),0,2,4,5,7,9,11,12)/12'],x1:8,dur:8,q:1},
  'Arpegio':{f:['pick(floor(4*x),0,4,7,12,7,4)/12'],x1:6,dur:6,q:1},
  'Melodía':{f:[OM],x1:7.5,dur:7.5,q:1},
  'Dos voces':{f:[OM,'(pick(floor(x/2),0,-5,-3,-5)-12)/12'],x1:7.5,dur:7.5,q:1}};
function preset(k){
  const p=P[k];stop();cursor=0;exprs=[...p.f];
  $('#x0').value=0;$('#x1').value=p.x1;$('#dur').value=p.dur;$('#q').checked=!!p.q;
  build();draw()}
Object.keys(P).forEach(k=>{const b=document.createElement('button');b.textContent=k;b.onclick=()=>preset(k);$('#chips').append(b)});
preset('Melodía');size();
