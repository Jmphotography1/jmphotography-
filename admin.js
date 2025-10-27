
// WARNING: This admin is client-side and for convenience. Not secure for public hosting with sensitive data.
// Change ADMIN_PASSWORD here before deploying.
const ADMIN_PASSWORD = "yourpassword"; // <-- change this in repo to set your password
let processedImages = [];
document.getElementById('loginBtn').addEventListener('click', ()=>{
  const v = document.getElementById('pw').value;
  if(v===ADMIN_PASSWORD){ document.getElementById('login-area').style.display='none'; document.getElementById('admin-panel').style.display='block'; }
  else alert('Incorrect password');
});

function loadPreviewImage(src, name){ const p = document.getElementById('preview'); const d = document.createElement('div'); d.className='card'; d.innerHTML=`<div style="font-size:13px;margin-bottom:6px">${name}</div><img src="${src}" style="max-width:240px">`; p.appendChild(d); }

document.getElementById('processBtn').addEventListener('click', async ()=>{
  const files = document.getElementById('files').files;
  const title = document.getElementById('eventTitle').value.trim();
  const date = document.getElementById('eventDate').value.trim();
  if(!title || !date){ alert('Please add event title and date'); return; }
  if(files.length===0){ alert('Please select files'); return; }
  processedImages = [];
  document.getElementById('preview').innerHTML='';
  const pos = document.getElementById('pos').value;
  const scalePercent = parseInt(document.getElementById('scale').value,10);
  for(const f of files){
    const dataURL = await fileToDataURL(f);
    const out = await applyWatermark(dataURL, pos, scalePercent);
    processedImages.push({name:f.name, dataURL: out});
    loadPreviewImage(out, f.name);
  }
  alert('Processing complete. Use Export ZIP to download images and manifest.');
});

function fileToDataURL(file){ return new Promise((res,rej)=>{ const fr = new FileReader(); fr.onload = ()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file); }); }

async function applyWatermark(dataURL, pos='br', scalePercent=12){
  // create canvas from image
  const img = await loadImage(dataURL);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width; canvas.height = img.height;
  ctx.drawImage(img,0,0);
  // load logo
  const logo = await loadImage('../assets/images/logo.png');
  // scale logo relative to image shorter edge
  const scale = Math.max(1, Math.min(40, scalePercent));
  const logoSize = Math.round((Math.min(img.width,img.height) * scale) / 100);
  const padding = Math.round(logoSize * 0.12);
  let x=0,y=0;
  if(pos==='br'){ x=img.width - logoSize - padding; y=img.height - logoSize - padding; }
  if(pos==='bl'){ x=padding; y=img.height - logoSize - padding; }
  if(pos==='tr'){ x=img.width - logoSize - padding; y=padding; }
  if(pos==='tl'){ x=padding; y=padding; }
  if(pos==='center'){ x=(img.width-logoSize)/2; y=(img.height-logoSize)/2; }
  // draw subtle background circle for contrast
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  const br = Math.round(logoSize*1.08);
  ctx.beginPath(); ctx.arc(x+logoSize/2, y+logoSize/2, br/2, 0, Math.PI*2); ctx.fill();
  ctx.drawImage(logo, x, y, logoSize, logoSize);
  return canvas.toDataURL('image/jpeg', 0.92);
}

function loadImage(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }

// Export ZIP using JSZip (loaded from CDN)
document.getElementById('exportZip').addEventListener('click', async ()=>{
  if(processedImages.length===0){ alert('No processed images to export.'); return; }
  const title = document.getElementById('eventTitle').value.trim();
  const date = document.getElementById('eventDate').value.trim();
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const folder = `galleries/${id}`;
  const manifest = { id:id, title:title, date:date, thumb:`${folder}/thumb.jpg`, images: [] };
  // load JSZip dynamically
  const jszipUrl = 'https://cdn.jsdelivr.net/npm/jszip@3.10.0/dist/jszip.min.js';
  await loadScript(jszipUrl);
  const zip = new JSZip();
  // add images
  for(let i=0;i<processedImages.length;i++){
    const p = processedImages[i];
    const base64 = p.dataURL.split(',')[1];
    const name = `${i+1}.jpg`;
    zip.file(`${folder}/${name}`, base64, {base64:true});
    manifest.images.push(`${folder}/${name}`);
    if(i===0){
      zip.file(`${folder}/thumb.jpg`, base64, {base64:true});
    }
  }
  zip.file(`${folder}/manifest.json`, JSON.stringify(manifest, null, 2));
  zip.file('manifest_for_galleries.json', JSON.stringify(manifest, null, 2));
  const content = await zip.generateAsync({type:'blob'});
  const url = URL.createObjectURL(content);
  const a = document.createElement('a'); a.href=url; a.download=`${id}_gallery.zip`; document.body.appendChild(a); a.click(); a.remove();
  document.getElementById('exportStatus').textContent='ZIP ready — download started.';
});

function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.onload=res; s.onerror=rej; s.src=src; document.head.appendChild(s); }); }
