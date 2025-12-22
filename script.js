document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll(".draggable");
  const dropTargets = document.querySelectorAll(".drop-target");
  const returnZones = document.querySelectorAll(".return-zone");

  const hand = document.getElementById("hand");
  const rotateLeftBtn = document.getElementById("rotate-left");
  const rotateRightBtn = document.getElementById("rotate-right");
  let rotation = 0;

  // Hamburger Menu
  const hamburger = document.querySelector(".hamburger");
  const mainMenu = document.querySelector(".main-menu");

  if (hamburger && mainMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mainMenu.classList.toggle("active");
    });

    document.querySelectorAll(".main-menu a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mainMenu.classList.remove("active");
      });
    });
  }

  // ---- DRAG & DROP (desktop + mobile polyfill) ----
  let draggedEl = null;

  draggables.forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      draggedEl = el;
      el.classList.add("dragging");

      // Required for Firefox / some browsers
      e.dataTransfer.setData("text/plain", el.alt || "item");

      // Optional: hide default ghost image if you have transparent.png
      // If you don't have transparent.png, comment these 2 lines.
      const transparentImage = new Image();
      transparentImage.src = "transparent.png";
      e.dataTransfer.setDragImage(transparentImage, 0, 0);
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
    });
  });

  function placeOnTarget(target, el) {
    // Move into the target box
    target.appendChild(el);

    el.classList.add("placed");
    el.style.position = "absolute";

    // target placement defaults
    const tx = Number(target.dataset.x ?? 50);
    const ty = Number(target.dataset.y ?? 50);
    const tScale = Number(target.dataset.scale ?? 1);
    const tRot = Number(target.dataset.rot ?? 0);

    // per-item fine-tune (optional)
    const ox = Number(el.dataset.ox ?? 0);   // px
    const oy = Number(el.dataset.oy ?? 0);   // px
    const iScale = Number(el.dataset.s ?? 1);
    const iRot = Number(el.dataset.r ?? 0);

    // Put the jewelry inside the zone at % position
    el.style.left = `${tx}%`;
    el.style.top = `${ty}%`;

    // Combine transforms: center -> offsets -> scale -> rotate
    const finalScale = tScale * iScale;
    const finalRot = tRot + iRot;

    el.style.transform = `translate(-50%, -50%) translate(${ox}px, ${oy}px) scale(${finalScale}) rotate(${finalRot}deg)`;
    el.style.zIndex = "25";
  }

  function returnToZone(zone, el) {
    zone.appendChild(el);

    el.classList.remove("placed");
    el.style.position = "static";
    el.style.left = "";
    el.style.top = "";
    el.style.transform = "none";
    el.style.zIndex = "";
  }

  // Drop targets (hand/neck/ear zones)
  dropTargets.forEach((target) => {
    target.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    target.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedEl) return;
      placeOnTarget(target, draggedEl);
    });
  });

  // Return zones (rings/bracelets/neck-accessories/earrings-area)
  returnZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedEl) return;
      returnToZone(zone, draggedEl);
    });
  });

  // ---- ROTATION (buttons) ----
  if (rotateLeftBtn && rotateRightBtn && hand) {
    rotateLeftBtn.addEventListener("click", () => {
      rotation -= 15;
      hand.style.transform = `rotate(${rotation}deg)`;
    });

    rotateRightBtn.addEventListener("click", () => {
      rotation += 15;
      hand.style.transform = `rotate(${rotation}deg)`;
    });
  }
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