document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // Elements
  // -------------------------
  const draggables = document.querySelectorAll(".draggable");

  const fingerZones = document.querySelectorAll(".finger-zone");
  const wristZone = document.querySelector(".wrist-zone");
  const neckZone = document.querySelector(".neck-zone");
  const earZone = document.querySelector(".ear-zone");

  const rings = document.getElementById("rings");
  const bracelets = document.getElementById("bracelets");
  const neckAccessories = document.getElementById("neck-accessories");
  const earringsArea = document.getElementById("earrings-area");

  const hand = document.getElementById("hand");
  const rotateLeftBtn = document.getElementById("rotate-left");
  const rotateRightBtn = document.getElementById("rotate-right");

  // Safety checks (prevents JS from crashing)
  if (!hand || !rotateLeftBtn || !rotateRightBtn) {
    console.warn("Hand or rotate buttons not found. Check IDs in game.html.");
  }

  // -------------------------
  // Hamburger Menu
  // -------------------------
  const hamburger = document.querySelector(".hamburger");
  const mainMenu = document.querySelector(".main-menu");

  if (hamburger && mainMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mainMenu.classList.toggle("active");
    });

    document.querySelectorAll(".main-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mainMenu.classList.remove("active");
      });
    });
  }

  // -------------------------
  // Rotation buttons
  // -------------------------
  let rotation = 0;

  if (rotateLeftBtn && hand) {
    rotateLeftBtn.addEventListener("click", () => {
      rotation -= 15;
      hand.style.transform = `rotate(${rotation}deg)`;
    });
  }

  if (rotateRightBtn && hand) {
    rotateRightBtn.addEventListener("click", () => {
      rotation += 15;
      hand.style.transform = `rotate(${rotation}deg)`;
    });
  }

  // -------------------------
  // Helpers
  // -------------------------
  const returnZones = [rings, bracelets, neckAccessories, earringsArea].filter(Boolean);
  const dropZones = [
    ...Array.from(fingerZones),
    wristZone,
    neckZone,
    earZone,
    ...returnZones,
  ].filter(Boolean);

  function getZoneFromPoint(x, y) {
    // elementFromPoint returns top-most element under pointer
    const el = document.elementFromPoint(x, y);
    if (!el) return null;

    // If you drop on the hand image, walk up to find a zone parent
    return el.closest(".finger-zone, .wrist-zone, .neck-zone, .ear-zone, #rings, #bracelets, #neck-accessories, #earrings-area");
  }

  function resetToList(draggable) {
    const originId = draggable.dataset.origin;
    const originEl = originId ? document.getElementById(originId) : null;

    if (originEl) originEl.appendChild(draggable);

    draggable.style.position = "static";
    draggable.style.left = "";
    draggable.style.top = "";
    draggable.style.transform = "none";
    draggable.style.zIndex = "";
    draggable.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");
  }

  function snapToZone(draggable, zone) {
    // If dropped back to the lists => reset
    if (zone.id === "rings" || zone.id === "bracelets" || zone.id === "neck-accessories" || zone.id === "earrings-area") {
      zone.appendChild(draggable);
      draggable.style.position = "static";
      draggable.style.left = "";
      draggable.style.top = "";
      draggable.style.transform = "none";
      draggable.style.zIndex = "";
      draggable.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");
      return;
    }

    // Dropped on wearable zones => center inside zone
    zone.appendChild(draggable);
    draggable.style.position = "absolute";
    draggable.style.left = "50%";
    draggable.style.top = "50%";
    draggable.style.zIndex = "25";

    draggable.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");

    if (zone.classList.contains("finger-zone")) {
      draggable.classList.add("on-finger");
      draggable.style.transform = "translate(-50%, -50%) scale(0.85) rotate(15deg)";
    } else if (zone.classList.contains("wrist-zone")) {
      draggable.classList.add("on-wrist");
      draggable.style.transform = "translate(-50%, -50%) scale(1.0) rotate(0deg)";
    } else if (zone.classList.contains("neck-zone")) {
      draggable.classList.add("on-neck");
      draggable.style.transform = "translate(-50%, -50%) scale(1.0) rotate(0deg)";
    }  else if (zone.classList.contains("ear-zone")) {
      draggable.classList.add("on-ear");
  // Fine-tuned ear placement
  draggable.style.transform =
    "translate(-45%, -55%) scale(0.65) rotate(-8deg)";
}

  }

  // -------------------------
  // Pointer drag (desktop + mobile)
  // -------------------------
  let activeItem = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let dragging = false;

  draggables.forEach((item) => {
    // Remember original container once
    const origin = item.closest("#rings, #bracelets, #neck-accessories, #earrings-area");
    if (origin && !item.dataset.origin) item.dataset.origin = origin.id;

    // IMPORTANT: pointer events
    item.addEventListener("pointerdown", (e) => {
      // stop page scroll while dragging
      e.preventDefault();

      activeItem = item;
      dragging = true;
      item.classList.add("dragging");

      // Put item on top of everything while moving
      item.style.zIndex = "9999";
      item.style.position = "fixed"; // fixed makes movement easy across page
      item.style.transform = "none";

      // Start positions
      startX = e.clientX;
      startY = e.clientY;

      const rect = item.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;

      // place fixed at its current screen position
      item.style.left = `${startLeft}px`;
      item.style.top = `${startTop}px`;

      item.setPointerCapture(e.pointerId);
    });

    item.addEventListener("pointermove", (e) => {
      if (!dragging || !activeItem) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      activeItem.style.left = `${startLeft + dx}px`;
      activeItem.style.top = `${startTop + dy}px`;
    });

    item.addEventListener("pointerup", (e) => {
      if (!activeItem) return;

      dragging = false;
      activeItem.classList.remove("dragging");

      // Find drop zone under pointer
      const zone = getZoneFromPoint(e.clientX, e.clientY);

      if (zone) {
        // Convert fixed -> absolute inside zone
        activeItem.style.position = "absolute";
        activeItem.style.left = "";
        activeItem.style.top = "";
        activeItem.style.zIndex = "";

        snapToZone(activeItem, zone);
      } else {
        // Not dropped anywhere => go back to original list
        resetToList(activeItem);
      }

      activeItem = null;
    });

    item.addEventListener("pointercancel", () => {
      if (!activeItem) return;
      resetToList(activeItem);
      activeItem = null;
      dragging = false;
    });
  });

  // Prevent default browser drag image behavior (we use pointer drag instead)
  draggables.forEach((img) => {
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });

  // Optional: avoid click “ghost” on mobile after dragging
  document.addEventListener("click", (e) => {
    if (e.target.classList && e.target.classList.contains("draggable")) {
      e.preventDefault();
    }
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