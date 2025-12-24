document.addEventListener('DOMContentLoaded', () => { 
  const draggables = document.querySelectorAll('.draggable'); 
  // Zones 
  const fingerZones = document.querySelectorAll('.finger-zone'); 
  const wristZone = document.querySelector('.wrist-zone'); 
  const neckZone = document.querySelector('.neck-zone'); 
  const earZone = document.querySelector('.ear-zone'); 
  // Return trays 
  const rings = document.getElementById('rings'); 
  const bracelets = document.getElementById('bracelets'); 
  const neckAccessories = document.getElementById('neck-accessories'); 
  const earringsArea = document.getElementById('earrings-area'); 
  // Base hand image + rotate buttons 
  const handImg = document.getElementById('hand'); 
  const rotateLeftBtn = document.getElementById('rotate-left'); 
  const rotateRightBtn = document.getElementById('rotate-right'); 
  let rotation = 0; 
  // Hamburger Menu 
  const hamburger = document.querySelector('.hamburger'); 
  const mainMenu = document.querySelector('.main-menu'); 

hamburger.addEventListener('click', () => { 
hamburger.classList.toggle('active'); 
mainMenu.classList.toggle('active'); 
}); 

document.querySelectorAll('.main-menu a').forEach(link => { 
 link.addEventListener('click', () => { 
hamburger.classList.remove('active'); 
mainMenu.classList.remove('active'); 
}); 
}); 

// Helpers 
 const clearWearState = (el) => { 
   el.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear'); 
   el.style.position = ''; 
   el.style.left = ''; 
   el.style.top = ''; 
   el.style.zIndex = ''; 
   el.style.removeProperty('--sj-rot'); 
   el.style.removeProperty('--sj-scale'); 
   el.style.removeProperty('--sj-dx'); 
   el.style.removeProperty('--sj-dy'); 
 }; 

 const setFitVarsFromZone = (el, zone) => { 
 // rotation/scale from HTML attributes 
 const rot = zone?.dataset?.rotate ?? '0'; 
 const scale = zone?.dataset?.scale ?? '1'; 

 el.style.setProperty('--sj-rot', `${rot}deg`); 
 el.style.setProperty('--sj-scale', `${scale}`); 

 // Small per-type nudges (you will tweak these numbers later) 
 const type = el.dataset.type || ''; 
 // default 
 let dx = 0, dy = 0; 

 if (type === 'earring') { dx = -4; dy = 4; } 
 if (type === 'necklace') { dx = 0; dy = 10; } 
 if (type === 'ring') { dx = 0; dy = 2; } 
 if (type === 'bracelet') { dx = 0; dy = 6; } 

 el.style.setProperty('--sj-dx', `${dx}px`); 
 el.style.setProperty('--sj-dy', `${dy}px`); 
 }; 

const getZoneCenterInDropZone = (zone, dropZone) => { 
const z = zone.getBoundingClientRect(); 
const d = dropZone.getBoundingClientRect(); 
const x = (z.left + z.right) / 2 - d.left; 
const y = (z.top + z.bottom) / 2 - d.top; 
return { x, y }; 
}; 

const placeOnZone = (draggable, zone, dropZone, wearClass) => { 
// Put jewelry inside the dropZone (same coordinate system) 
dropZone.appendChild(draggable); 

const { x, y } = getZoneCenterInDropZone(zone, dropZone); 

clearWearState(draggable); 
draggable.classList.add(wearClass); 

draggable.style.position = 'absolute'; 
 draggable.style.left = `${x}px`; 
 draggable.style.top = `${y}px`; 

setFitVarsFromZone(draggable, zone); 
}; 

const returnToTray = (draggable, tray) => { 
tray.appendChild(draggable); 
draggable.classList.remove('dragging'); 
clearWearState(draggable); 
draggable.style.position = 'static'; 
draggable.style.transform = 'none'; }; 

// Desktop drag 
draggables.forEach(draggable => { 
draggable.addEventListener('dragstart', (e) => { 
draggable.classList.add('dragging'); 
e.dataTransfer.setData('text/plain', ''); 

// hide ghost 
const img = new Image(); 
img.src = 'transparent.png'; 
e.dataTransfer.setDragImage(img, 0, 0); 
}); 

draggable.addEventListener('dragend', () => { 
draggable.classList.remove('dragging'); 
}); 
}); 

const enableDrop = (el) => { 
el.addEventListener('dragover', (e) => { 
e.preventDefault(); 
e.dataTransfer.dropEffect = 'move'; 
}); 
}; 

// Drop handlers 
fingerZones.forEach(zone => { 
enableDrop(zone); 
zone.addEventListener('drop', (e) => { 
e.preventDefault(); 
const draggable = document.querySelector('.draggable.dragging'); 
if (!draggable) return; 

const handDrop = document.getElementById('hand-drop'); 
placeOnZone(draggable, zone, handDrop, 'on-finger'); 
}); 
}); 

enableDrop(wristZone); 
wristZone.addEventListener('drop', (e) => { 
e.preventDefault(); 
const draggable = document.querySelector('.draggable.dragging'); 
if (!draggable) return; 

const handDrop = document.getElementById('hand-drop'); 
placeOnZone(draggable, wristZone, handDrop, 'on-wrist'); 
}); 

enableDrop(neckZone); 
neckZone.addEventListener('drop', (e) => { 
e.preventDefault(); 
const draggable = document.querySelector('.draggable.dragging'); 
if (!draggable) return; 

const neckDrop = document.getElementById('neck-drop'); 
placeOnZone(draggable, neckZone, neckDrop, 'on-neck'); 
}); 

enableDrop(earZone); 
earZone.addEventListener('drop', (e) => { 
e.preventDefault(); 
const draggable = document.querySelector('.draggable.dragging'); 
if (!draggable) return; 

const earDrop = document.getElementById('ear-drop'); 
placeOnZone(draggable, earZone, earDrop, 'on-ear');
}); 

// Return trays 
[rings, bracelets, neckAccessories, earringsArea].forEach(tray => { 
enableDrop(tray); 
tray.addEventListener('drop', (e) => { 
e.preventDefault(); 
const draggable = document.querySelector('.draggable.dragging'); 
if (!draggable) return; 
returnToTray(draggable, tray); 
}); 
}); 

// Mobile touch (simple + reliable) 
let active = null; 
let offsetX = 0; 
let offsetY = 0;

 window.addEventListener('touchmove', (e) => { 
if (active) e.preventDefault(); 
}, { passive: false }); 

const getValidTarget = (node) => { 
let cur = node; 
while (cur && cur !== document.body) { 
if ( 
cur.classList?.contains('finger-zone') || 
cur.classList?.contains('wrist-zone') || 
cur.classList?.contains('neck-zone') || 
cur.classList?.contains('ear-zone') || 
cur === rings || cur === bracelets || cur === neckAccessories || 
cur === earringsArea ) 
return cur; 
cur = cur.parentElement; 
} 
return null; 
};

 draggables.forEach(draggable => { 
draggable.addEventListener('touchstart', (e) => { 
const t = e.touches[0]; 
active = draggable; 
active.classList.add('dragging'); 

const r = active.getBoundingClientRect();
 offsetX = t.clientX - r.left; 
offsetY = t.clientY - r.top; 

active.style.position = 'fixed'; 
 active.style.left = `${t.clientX - offsetX}px`; 
 active.style.top = `${t.clientY - offsetY}px`; 
active.style.zIndex = '1000'; 
}, { passive: false }); 

draggable.addEventListener('touchmove', (e) => { 
if (!active) return; 
const t = e.touches[0]; 
 active.style.left = `${t.clientX - offsetX}px`; 
 active.style.top = `${t.clientY - offsetY}px`;
}, { passive: false }); 

draggable.addEventListener('touchend', (e) => { 
if (!active) return; 

const t = e.changedTouches[0]; 
const raw = document.elementFromPoint(t.clientX, t.clientY); 
const target = getValidTarget(raw); 

const handDrop = document.getElementById('hand-drop'); 
const neckDrop = document.getElementById('neck-drop'); 
const earDrop = document.getElementById('ear-drop'); 

if (target?.classList?.contains('finger-zone')) { 
placeOnZone(active, target, handDrop, 'on-finger'); 
} else if (target?.classList?.contains('wrist-zone')) { 
placeOnZone(active, wristZone, handDrop, 'on-wrist'); 
} else if (target?.classList?.contains('neck-zone')) { 
placeOnZone(active, neckZone, neckDrop, 'on-neck'); 
} else if (target?.classList?.contains('ear-zone')) { 
placeOnZone(active, earZone, earDrop, 'on-ear'); 
} else if (target === rings || target === bracelets || target === 
neckAccessories || target === earringsArea) { 
returnToTray(active, target);
 } else { 
// fallback: return to correct tray based on type 
const type = active.dataset.type; 
if (type === 'ring') returnToTray(active, rings); 
else if (type === 'bracelet') returnToTray(active, bracelets); 
else if (type === 'necklace') returnToTray(active, neckAccessories); 
else if (type === 'earring') returnToTray(active, earringsArea); 
else returnToTray(active, rings); 
} 

active = null; }, 
{ passive: false }); 
}); 

// Rotate buttons (keep Beni behavior: rotate only the hand image) 
rotateLeftBtn.addEventListener('click', () => { 
  rotation -= 15; 
  handImg.style.transform = `rotate(${rotation}deg)`; 
}); 

rotateRightBtn.addEventListener('click', () => {
  rotation += 15; 
  handImg.style.transform = `rotate(${rotation}deg)`; 
}); 
});
