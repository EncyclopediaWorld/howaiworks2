import { $, createCanvas, addHint, addControls, sigmoid } from '../lib/shared.js'

export function mountStyle(containerId = 'demo-style') {
  const __id = containerId || 'demo-style';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Adjust style sliders to control generation at different scales — coarse (pose) vs fine (texture).');
let coarse={shape:.5,pose:.5},fine={color:.5,texture:.5,detail:.5};
function generate(co,fi){let grid=[];for(let i=0;i<8;i++)for(let j=0;j<8;j++){
let v=sigmoid(Math.sin(i*co.shape*3+j*co.pose*2)*2+Math.cos(i*fi.color*4-j*fi.texture*3)*.8+fi.detail*Math.sin(i*j*.5));
grid.push(v)}return grid}
function draw(){ctx.clearRect(0,0,750,300);
// Mapping network
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,10,155,120,8);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='600 10px Fira Code';ctx.fillText('Mapping Network',25,30);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('z (random) → w (style)',25,48);
ctx.fillText('8 FC layers',25,62);ctx.fillText('w controls EACH layer',25,76);
ctx.fillText('of the generator',25,90);
ctx.fillStyle='#ffd166';ctx.font='500 8px Fira Code';ctx.fillText('→ Disentangled styles!',25,110);
// Coarse controls
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(185,10,170,120,8);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='600 10px Fira Code';ctx.fillText('Coarse Styles (4×4→8×8)',195,30);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
ctx.fillText('Shape: '+coarse.shape.toFixed(2),195,52);
ctx.fillStyle='#111120';ctx.fillRect(195,56,140,8);ctx.fillStyle='#ff6b6b';ctx.fillRect(195,56,140*coarse.shape,8);
ctx.fillStyle='#7d7a8c';ctx.fillText('Pose: '+coarse.pose.toFixed(2),195,80);
ctx.fillStyle='#111120';ctx.fillRect(195,84,140,8);ctx.fillStyle='#ff6b6b';ctx.fillRect(195,84,140*coarse.pose,8);
// Fine controls
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(370,10,170,120,8);ctx.fill();
ctx.fillStyle='#4ecdc4';ctx.font='600 10px Fira Code';ctx.fillText('Fine Styles (64×64→1024)',380,30);
['color','texture','detail'].forEach((k,i)=>{let v=fine[k];let y=46+i*28;
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText(k+': '+v.toFixed(2),380,y);
ctx.fillStyle='#111120';ctx.fillRect(380,y+4,140,8);ctx.fillStyle='#4ecdc4';ctx.fillRect(380,y+4,140*v,8)});
// Generated image
let gx=560,gy=10;ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('Generated:',gx,gy+14);
let grid=generate(coarse,fine);let cs=20;
for(let i=0;i<8;i++)for(let j=0;j<8;j++){let v=grid[i*8+j];
let r=Math.floor(v*180+75),g=Math.floor((1-v)*120+80),b=Math.floor(v*100+100);
ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.fillRect(gx+j*cs,gy+20+i*cs,cs-1,cs-1)}
// Style mixing explanation
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,140,720,70,10);ctx.fill();
ctx.fillStyle='#f472b6';ctx.font='700 11px Fira Code';ctx.fillText('StyleGAN: Style-Based Generator Architecture',25,160);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
ctx.fillText('Coarse layers (low resolution): control pose, face shape, hair style',25,180);
ctx.fillText('Fine layers (high resolution): control color, texture, micro-features like freckles',25,196);
// AdaIN
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,220,720,72,10);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='600 10px Fira Code';ctx.fillText('AdaIN (Adaptive Instance Normalization):',25,240);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('At each layer: normalize activations, then scale & shift using style vector w.',25,258);
ctx.fillText('Style Mixing: use different w vectors at different layers → mix coarse features of one face with fine features of another!',25,276);
ctx.fillStyle='#ffd166';ctx.font='500 8px Fira Code';ctx.fillText('This separation of concerns was revolutionary for controllable image generation.',25,290)}
const ctrl=addControls(el);
ctrl.innerHTML='<label>Shape</label><input type="range" min="0" max="100" value="50" class="slider" id="sg-shape"><label>Pose</label><input type="range" min="0" max="100" value="50" class="slider" id="sg-pose"><label>Color</label><input type="range" min="0" max="100" value="50" class="slider" id="sg-color"><label>Texture</label><input type="range" min="0" max="100" value="50" class="slider" id="sg-tex">';
$('sg-shape').oninput=e=>{coarse.shape=e.target.value/100;draw()};
$('sg-pose').oninput=e=>{coarse.pose=e.target.value/100;draw()};
$('sg-color').oninput=e=>{fine.color=e.target.value/100;draw()};
$('sg-tex').oninput=e=>{fine.texture=e.target.value/100;draw()};
draw()
  return () => {
    try {
      if (typeof c !== 'undefined' && c) {
        c.onclick = null;
        c.oncontextmenu = null;
      }
      if (typeof tmr !== 'undefined' && tmr) clearInterval(tmr);
      if (typeof animId !== 'undefined' && animId) cancelAnimationFrame(animId);
      if (typeof el !== 'undefined' && el) el.innerHTML = '';
    } catch (e) {}
  };
}
