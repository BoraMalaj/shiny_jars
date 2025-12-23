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

  // ---- FRONT/BACK TOGGLE LOGIC ----
  const applyHandRotation = () => {
    // Keep Beni behavior: rotate only the hand image element
    handImg.style.transform = `rotate(${rotation}deg)`;
  };

  const setView = (imgEl, view) => {
    const front = imgEl.dataset.front;
    const back = imgEl.dataset.back;
    imgEl.dataset.view = view;
    imgEl.src = (view === 'front') ? front : back;

    // If switching hand, re-apply rotation so it doesn't reset
    if (imgEl.id === 'hand') applyHandRotation();
  };

  document.querySelectorAll('.toggle-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const imgEl = document.getElementById(id);
      if (!imgEl) return;

      const current = imgEl.dataset.view || 'front';
      const next = (current === 'front') ? 'back' : 'front';
      setView(imgEl, next);

      // Button label shows the action (what you'll switch TO)
      btn.textContent = (next === 'front') ? 'Back' : 'Front';
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
    const rot = zone?.dataset?.rotate ?? '0';
    const scale = zone?.dataset?.scale ?? '1';

    el.style.setProperty('--sj-rot', `${rot}deg`);
    el.style.setProperty('--sj-scale', `${scale}`);

    const type = el.dataset.type || '';
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
    dropZone.appendChild(draggable);

    const { x, y } = getZoneCenterInDropZone(zone, dropZone);

    clearWearState(draggable);
    draggable.classList.add(wearClass);

    draggable.style.position = 'absolute';
    draggable.style.left = `${x}px`;
    draggable.style.top = `${y}px`;
    draggable.style.zIndex = '30';

    setFitVarsFromZone(draggable, zone);
  };

  const returnToTray = (draggable, tray) => {
    tray.appendChild(draggable);
    draggable.classList.remove('dragging');
    clearWearState(draggable);
    draggable.style.position = 'static';
    draggable.style.transform = 'none';
  };

  // ---- Desktop drag ----
  // Use an inline 1x1 transparent PNG (NO FILE NEEDED)
  const transparentDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFgwJ/lhJp9QAAAABJRU5ErkJggg==';

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
      draggable.classList.add('dragging');
      e.dataTransfer.setData('text/plain', '');

      const img = new Image();
      img.src = transparentDataUrl;
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

  // ---- Mobile touch ----
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
        cur === rings || cur === bracelets || cur === neckAccessories || cur === earringsArea
      ) return cur;
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
      const earDrop  = document.getElementById('ear-drop');

      if (target?.classList?.contains('finger-zone')) {
        placeOnZone(active, target, handDrop, 'on-finger');
      } else if (target?.classList?.contains('wrist-zone')) {
        placeOnZone(active, wristZone, handDrop, 'on-wrist');
      } else if (target?.classList?.contains('neck-zone')) {
        placeOnZone(active, neckZone, neckDrop, 'on-neck');
      } else if (target?.classList?.contains('ear-zone')) {
        placeOnZone(active, earZone, earDrop, 'on-ear');
      } else if (target === rings || target === bracelets || target === neckAccessories || target === earringsArea) {
        returnToTray(active, target);
      } else {
        const type = active.dataset.type;
        if (type === 'ring') returnToTray(active, rings);
        else if (type === 'bracelet') returnToTray(active, bracelets);
        else if (type === 'necklace') returnToTray(active, neckAccessories);
        else if (type === 'earring') returnToTray(active, earringsArea);
        else returnToTray(active, rings);
      }

      active = null;
    }, { passive: false });
  });

  // Rotate buttons
  rotateLeftBtn.addEventListener('click', () => {
    rotation -= 15;
    applyHandRotation();
  });

  rotateRightBtn.addEventListener('click', () => {
    rotation += 15;
    applyHandRotation();
  });
});






// document.addEventListener('DOMContentLoaded', () => {
//     const draggables = document.querySelectorAll('.draggable');
//     const fingerZones = document.querySelectorAll('.finger-zone');
//     const wristZone = document.querySelector('.wrist-zone');
//     const neckZone = document.querySelector('.neck-zone');
//     const earZone = document.querySelector('.ear-zone');
//     const rings = document.getElementById('rings');
//     const bracelets = document.getElementById('bracelets');
//     const neckAccessories = document.getElementById('neck-accessories');
//     const earringsArea = document.getElementById('earrings-area');
//     const hand = document.getElementById('hand');
//     const rotateLeftBtn = document.getElementById('rotate-left');
//     const rotateRightBtn = document.getElementById('rotate-right');
//     let rotation = 0;

//     // Hamburger Menu Logic
//     const hamburger = document.querySelector('.hamburger');
//     const mainMenu = document.querySelector('.main-menu');

//     hamburger.addEventListener('click', () => {
//         hamburger.classList.toggle('active');
//         mainMenu.classList.toggle('active');
//     });

//       const menuLinks = document.querySelectorAll('.main-menu a');
//     menuLinks.forEach(link => {
//         link.addEventListener('click', () => {
//             hamburger.classList.remove('active');
//             mainMenu.classList.remove('active');
//         });
//     });

//     // Prevent default touchmove behavior to ensure drag works on iOS
//     window.addEventListener('touchmove', (e) => {}, { passive: false });

//     // Drag-and-Drop Logic
//     draggables.forEach(draggable => {
//         // Desktop drag events
//         draggable.addEventListener('dragstart', (e) => {
//             console.log('Drag start on desktop');
//             draggable.classList.add('dragging');
//             e.dataTransfer.setData('text/plain', '');
//         });

//         draggable.addEventListener('dragend', () => {
//             console.log('Drag end on desktop');
//             draggable.classList.remove('dragging');
//         });

//         // Mobile touch events
//         let touchStartX = 0;
//         let touchStartY = 0;

//         draggable.addEventListener('touchstart', (e) => {
//             console.log('Touch start on mobile');
//             e.preventDefault();
//             draggable.classList.add('dragging');
//             const touch = e.touches[0];
//             touchStartX = touch.clientX - (draggable.offsetLeft || 0);
//             touchStartY = touch.clientY - (draggable.offsetTop || 0);
//             draggable.style.position = 'absolute';
//             draggable.style.zIndex = 1000;
//         });

//         draggable.addEventListener('touchmove', (e) => {
//             console.log('Touch move on mobile');
//             e.preventDefault();
//             const touch = e.touches[0];
//             const newX = touch.clientX - touchStartX;
//             const newY = touch.clientY - touchStartY;
//             draggable.style.left = `${newX}px`;
//             draggable.style.top = `${newY}px`;
//         }, { passive: false });

//         draggable.addEventListener('touchend', (e) => {
//             console.log('Touch end on mobile');
//             draggable.classList.remove('dragging');
//             const touch = e.changedTouches[0];
//             const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

//             let dropped = false;
//             const allZones = [...fingerZones, wristZone, neckZone, earZone, rings, bracelets, neckAccessories, earringsArea];
//             allZones.forEach(zone => {
//                 const rect = zone.getBoundingClientRect();
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('drop'));
//                     dropped = true;
//                 }
//             });

//             if (!dropped) {
//                 const originalContainer = draggable.closest('#rings') || draggable.closest('#bracelets') || 
//                                         draggable.closest('#neck-accessories') || draggable.closest('#earrings-area');
//                 if (originalContainer) {
//                     originalContainer.appendChild(draggable);
//                     draggable.style.position = 'static';
//                     draggable.style.transform = 'none';
//                     draggable.style.zIndex = '';
//                     draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 }
//             }
//         });
//     });

//     const handleDrop = (zone, className, returnContainer) => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             console.log(`Dropped in zone: ${zone.className}`);
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'absolute';
//                 draggable.style.zIndex = '';

//                 // Custom positioning for ear-zone
//                 if (zone.classList.contains('ear-zone')) {
//                     draggable.style.left = '50%';
//                     draggable.style.top = '50%';
//                     // Adjust the transform to fine-tune the position
//                     draggable.style.transform = 'translate(-50%, -50%) scale(0.8)';
//                 } else {
//                     // Default positioning for other zones
//                     draggable.style.left = '50%';
//                     draggable.style.top = '50%';
//                     draggable.style.transform = className === 'on-finger' || className === 'on-ear' 
//                         ? 'translate(-50%, -50%) scale(0.8) rotate(15deg)' 
//                         : className === 'on-wrist' 
//                         ? 'translate(-50%, -50%) scale(0.9) rotate(0deg)' 
//                         : 'translate(-50%, -50%) scale(0.9) rotate(0deg)';
//                 }

//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 draggable.classList.add(className);
//             }
//         });
//     };

//     fingerZones.forEach(zone => handleDrop(zone, 'on-finger', rings));
//     handleDrop(wristZone, 'on-wrist', bracelets);
//     handleDrop(neckZone, 'on-neck', neckAccessories);
//     handleDrop(earZone, 'on-ear', earringsArea);

//     const returnZones = [rings, bracelets, neckAccessories, earringsArea];
//     returnZones.forEach(zone => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             console.log(`Returned to zone: ${zone.id}`);
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'static';
//                 draggable.style.transform = 'none';
//                 draggable.style.zIndex = '';
//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//             }
//         });
//     });

//     rotateLeftBtn.addEventListener('click', () => {
//         rotation -= 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });

//     rotateRightBtn.addEventListener('click', () => {
//         rotation += 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });
// });









// document.addEventListener('DOMContentLoaded', () => {
//     const draggables = document.querySelectorAll('.draggable');
//     const fingerZones = document.querySelectorAll('.finger-zone');
//     const wristZone = document.querySelector('.wrist-zone');
//     const neckZone = document.querySelector('.neck-zone');
//     const earZone = document.querySelector('.ear-zone');
//     const rings = document.getElementById('rings');
//     const bracelets = document.getElementById('bracelets');
//     const neckAccessories = document.getElementById('neck-accessories');
//     const earringsArea = document.getElementById('earrings-area');
//     const hand = document.getElementById('hand');
//     const rotateLeftBtn = document.getElementById('rotate-left');
//     const rotateRightBtn = document.getElementById('rotate-right');
//     let rotation = 0;

//     // Hamburger Menu Logic
//     const hamburger = document.querySelector('.hamburger');
//     const mainMenu = document.querySelector('.main-menu');

//     hamburger.addEventListener('click', () => {
//         hamburger.classList.toggle('active');
//         mainMenu.classList.toggle('active');
//     });

//     const menuLinks = document.querySelectorAll('.main-menu a');
//     menuLinks.forEach(link => {
//         link.addEventListener('click', () => {
//             hamburger.classList.remove('active');
//             mainMenu.classList.remove('active');
//         });
//     });

//     // Prevent default touchmove behavior to ensure drag works on iOS
//     window.addEventListener('touchmove', (e) => {}, { passive: false });

//     // Drag-and-Drop Logic
//     draggables.forEach(draggable => {
//         // Desktop drag events
//         draggable.addEventListener('dragstart', (e) => {
//             console.log('Drag start on desktop');
//             draggable.classList.add('dragging');
//             e.dataTransfer.setData('text/plain', '');
//         });

//         draggable.addEventListener('dragend', () => {
//             console.log('Drag end on desktop');
//             draggable.classList.remove('dragging');
//         });

//         // Mobile touch events
//         let touchStartX = 0;
//         let touchStartY = 0;

//         draggable.addEventListener('touchstart', (e) => {
//             console.log('Touch start on mobile');
//             e.preventDefault();
//             draggable.classList.add('dragging');
//             const touch = e.touches[0];
//             touchStartX = touch.clientX - (draggable.offsetLeft || 0);
//             touchStartY = touch.clientY - (draggable.offsetTop || 0);
//             draggable.style.position = 'absolute';
//             draggable.style.zIndex = 1000; // Bring to front while dragging
//         });

//         draggable.addEventListener('touchmove', (e) => {
//             console.log('Touch move on mobile');
//             e.preventDefault();
//             const touch = e.touches[0];
//             const newX = touch.clientX - touchStartX;
//             const newY = touch.clientY - touchStartY;
//             draggable.style.left = `${newX}px`;
//             draggable.style.top = `${newY}px`;
//         }, { passive: false });

//         draggable.addEventListener('touchend', (e) => {
//             console.log('Touch end on mobile');
//             draggable.classList.remove('dragging');
//             const touch = e.changedTouches[0];
//             const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

//             // Check if the drop target is a valid drop zone
//             let dropped = false;
//             const allZones = [...fingerZones, wristZone, neckZone, earZone, rings, bracelets, neckAccessories, earringsArea];
//             allZones.forEach(zone => {
//                 const rect = zone.getBoundingClientRect();
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('drop'));
//                     dropped = true;
//                 }
//             });

//             // If not dropped in a valid zone, return to original container
//             if (!dropped) {
//                 const originalContainer = draggable.closest('#rings') || draggable.closest('#bracelets') || 
//                                         draggable.closest('#neck-accessories') || draggable.closest('#earrings-area');
//                 if (originalContainer) {
//                     originalContainer.appendChild(draggable);
//                     draggable.style.position = 'static';
//                     draggable.style.transform = 'none';
//                     draggable.style.zIndex = '';
//                     draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 }
//             }
//         });
//     });

//     const handleDrop = (zone, className, returnContainer) => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             console.log(`Dropped in zone: ${zone.className}`);
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'absolute';
//                 draggable.style.left = '50%';
//                 draggable.style.top = '50%';
//                 draggable.style.zIndex = '';
//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 draggable.classList.add(className);
//             }
//         });

//         // Touch events are now handled in the touchend listener above, so we don't need separate touchmove/touchend here
//     };

//     fingerZones.forEach(zone => handleDrop(zone, 'on-finger', rings));
//     handleDrop(wristZone, 'on-wrist', bracelets);
//     handleDrop(neckZone, 'on-neck', neckAccessories);
//     handleDrop(earZone, 'on-ear', earringsArea);

//     const returnZones = [rings, bracelets, neckAccessories, earringsArea];
//     returnZones.forEach(zone => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             console.log(`Returned to zone: ${zone.id}`);
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'static';
//                 draggable.style.transform = 'none';
//                 draggable.style.zIndex = '';
//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//             }
//         });
//     });

//     rotateLeftBtn.addEventListener('click', () => {
//         rotation -= 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });

//     rotateRightBtn.addEventListener('click', () => {
//         rotation += 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });
// });









// document.addEventListener('DOMContentLoaded', () => {
//     const draggables = document.querySelectorAll('.draggable');
//     const fingerZones = document.querySelectorAll('.finger-zone');
//     const wristZone = document.querySelector('.wrist-zone');
//     const neckZone = document.querySelector('.neck-zone');
//     const earZone = document.querySelector('.ear-zone');
//     const rings = document.getElementById('rings');
//     const bracelets = document.getElementById('bracelets');
//     const neckAccessories = document.getElementById('neck-accessories');
//     const earringsArea = document.getElementById('earrings-area');
//     const hand = document.getElementById('hand');
//     const rotateLeftBtn = document.getElementById('rotate-left');
//     const rotateRightBtn = document.getElementById('rotate-right');
//     let rotation = 0;

//     // Hamburger Menu Logic
//     const hamburger = document.querySelector('.hamburger');
//     const mainMenu = document.querySelector('.main-menu');

//     hamburger.addEventListener('click', () => {
//         hamburger.classList.toggle('active');
//         mainMenu.classList.toggle('active');
//     });

//     const menuLinks = document.querySelectorAll('.main-menu a');
//     menuLinks.forEach(link => {
//         link.addEventListener('click', () => {
//             hamburger.classList.remove('active');
//             mainMenu.classList.remove('active');
//         });
//     });

//     // Prevent default touchmove behavior to ensure drag works on iOS
//     window.addEventListener('touchmove', (e) => {}, { passive: false });

//     // Drag-and-Drop Logic
//     draggables.forEach(draggable => {
//         draggable.addEventListener('dragstart', (e) => {
//             draggable.classList.add('dragging');
//             e.dataTransfer.setData('text/plain', '');
//         });

//         draggable.addEventListener('dragend', () => {
//             draggable.classList.remove('dragging');
//         });

//         draggable.addEventListener('touchstart', (e) => {
//             draggable.classList.add('dragging');
//             e.preventDefault();
//         });

//         draggable.addEventListener('touchend', () => {
//             draggable.classList.remove('dragging');
//         });
//     });

//     const handleDrop = (zone, className, returnContainer) => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'absolute';
//                 draggable.style.left = '50%';
//                 draggable.style.top = '50%';
//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 draggable.classList.add(className);
//             }
//         });

//         zone.addEventListener('touchmove', (e) => {
//             e.preventDefault();
//             const touch = e.touches[0];
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('dragover'));
//                 }
//             }
//         }, { passive: false });

//         zone.addEventListener('touchend', (e) => {
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 const touch = e.changedTouches[0];
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('drop'));
//                 } else {
//                     returnContainer.appendChild(draggable);
//                     draggable.style.position = 'static';
//                     draggable.style.transform = 'none';
//                     draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 }
//             }
//         });
//     };

//     fingerZones.forEach(zone => handleDrop(zone, 'on-finger', rings));
//     handleDrop(wristZone, 'on-wrist', bracelets);
//     handleDrop(neckZone, 'on-neck', neckAccessories);
//     handleDrop(earZone, 'on-ear', earringsArea);

//     const returnZones = [rings, bracelets, neckAccessories, earringsArea];
//     returnZones.forEach(zone => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'static';
//                 draggable.style.transform = 'none';
//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//             }
//         });

//         zone.addEventListener('touchmove', (e) => {
//             e.preventDefault();
//             const touch = e.touches[0];
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('dragover'));
//                 }
//             }
//         }, { passive: false });

//         zone.addEventListener('touchend', (e) => {
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 const touch = e.changedTouches[0];
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('drop'));
//                 }
//             }
//         });
//     });

//     rotateLeftBtn.addEventListener('click', () => {
//         rotation -= 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });

//     rotateRightBtn.addEventListener('click', () => {
//         rotation += 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });
// });









// document.addEventListener('DOMContentLoaded', () => {
//     const draggables = document.querySelectorAll('.draggable');
//     const fingerZones = document.querySelectorAll('.finger-zone');
//     const wristZone = document.querySelector('.wrist-zone');
//     const neckZone = document.querySelector('.neck-zone');
//     const earZone = document.querySelector('.ear-zone');
//     const rings = document.getElementById('rings');
//     const bracelets = document.getElementById('bracelets');
//     const neckAccessories = document.getElementById('neck-accessories');
//     const earringsArea = document.getElementById('earrings-area');
//     const hand = document.getElementById('hand');
//     const rotateLeftBtn = document.getElementById('rotate-left');
//     const rotateRightBtn = document.getElementById('rotate-right');
//     let rotation = 0;

//     // Hamburger Menu Logic
//     const hamburger = document.querySelector('.hamburger');
//     const mainMenu = document.querySelector('.main-menu');

//     hamburger.addEventListener('click', () => {
//         hamburger.classList.toggle('active');
//         mainMenu.classList.toggle('active');
//     });

//     const menuLinks = document.querySelectorAll('.main-menu a');
//     menuLinks.forEach(link => {
//         link.addEventListener('click', () => {
//             hamburger.classList.remove('active');
//             mainMenu.classList.remove('active');
//         });
//     });

//     // Existing Drag-and-Drop Logic
//     draggables.forEach(draggable => {
//         draggable.addEventListener('dragstart', (e) => {
//             draggable.classList.add('dragging');
//             e.dataTransfer.setData('text/plain', '');
//         });

//         draggable.addEventListener('dragend', () => {
//             draggable.classList.remove('dragging');
//         });

//         draggable.addEventListener('touchstart', (e) => {
//             draggable.classList.add('dragging');
//             e.preventDefault();
//         });

//         draggable.addEventListener('touchend', () => {
//             draggable.classList.remove('dragging');
//         });
//     });

//     const handleDrop = (zone, className, returnContainer) => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'absolute';
//                 draggable.style.left = '50%';
//                 draggable.style.top = '50%';
//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 draggable.classList.add(className);
//             }
//         });

//         zone.addEventListener('touchmove', (e) => {
//             e.preventDefault();
//             const touch = e.touches[0];
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('dragover'));
//                 }
//             }
//         });

//         zone.addEventListener('touchend', (e) => {
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 const touch = e.changedTouches[0];
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('drop'));
//                 } else {
//                     returnContainer.appendChild(draggable);
//                     draggable.style.position = 'static';
//                     draggable.style.transform = 'none';
//                     draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//                 }
//             }
//         });
//     };

//     fingerZones.forEach(zone => handleDrop(zone, 'on-finger', rings));
//     handleDrop(wristZone, 'on-wrist', bracelets);
//     handleDrop(neckZone, 'on-neck', neckAccessories);
//     handleDrop(earZone, 'on-ear', earringsArea);

//     const returnZones = [rings, bracelets, neckAccessories, earringsArea];
//     returnZones.forEach(zone => {
//         zone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             e.dataTransfer.dropEffect = 'move';
//         });

//         zone.addEventListener('drop', (e) => {
//             e.preventDefault();
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 zone.appendChild(draggable);
//                 draggable.style.position = 'static';
//                 draggable.style.transform = 'none';
//                 draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
//             }
//         });

//         zone.addEventListener('touchmove', (e) => {
//             e.preventDefault();
//             const touch = e.touches[0];
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('dragover'));
//                 }
//             }
//         });

//         zone.addEventListener('touchend', (e) => {
//             const draggable = document.querySelector('.dragging');
//             if (draggable) {
//                 const rect = zone.getBoundingClientRect();
//                 const touch = e.changedTouches[0];
//                 if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
//                     touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
//                     zone.dispatchEvent(new Event('drop'));
//                 }
//             }
//         });
//     });

//     rotateLeftBtn.addEventListener('click', () => {
//         rotation -= 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });

//     rotateRightBtn.addEventListener('click', () => {
//         rotation += 15;
//         hand.style.transform = `rotate(${rotation}deg)`;
//     });
// });