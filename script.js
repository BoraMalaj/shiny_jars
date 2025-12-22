document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll(".draggable");

  const fingerZones = document.querySelectorAll(".finger-zone");
  const wristZone = document.querySelector(".wrist-zone");
  const neckZone = document.querySelector(".neck-zone");
  const earZone = document.querySelector(".ear-zone");

  const rings = document.getElementById("rings");
  const bracelets = document.getElementById("bracelets");
  const neckAccessories = document.getElementById("neck-accessories");
  const earringsArea = document.getElementById("earrings-area");

  const handImg = document.getElementById("hand");
  const rotateLeftBtn = document.getElementById("rotate-left");
  const rotateRightBtn = document.getElementById("rotate-right");
  let rotation = 0;

  // MENU
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

  // ✅ ROTATE buttons working
  rotateLeftBtn.addEventListener("click", () => {
    rotation -= 15;
    handImg.style.transform = `rotate(${rotation}deg)`;
  });

  rotateRightBtn.addEventListener("click", () => {
    rotation += 15;
    handImg.style.transform = `rotate(${rotation}deg)`;
  });

  // --- Helpers ---
  function clearPlacedClasses(el) {
    el.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");
  }

  // This makes items "fit" nicer when placed
  function applyFit(el, fitClass) {
    clearPlacedClasses(el);
    el.classList.add(fitClass);

    // position inside its zone
    el.style.position = "absolute";
    el.style.left = "50%";
    el.style.top = "50%";
    el.style.zIndex = "40";

    // default transforms by type (you can adjust small degrees here)
    if (fitClass === "on-finger") {
      el.style.transform = "translate(-50%, -50%) rotate(12deg)";
    } else if (fitClass === "on-wrist") {
      el.style.transform = "translate(-50%, -50%) rotate(0deg)";
    } else if (fitClass === "on-neck") {
      el.style.transform = "translate(-50%, -50%) rotate(0deg)";
    } else if (fitClass === "on-ear") {
      // earrings often look better slightly smaller and centered
      el.style.transform = "translate(-50%, -50%) rotate(0deg)";
    }
  }

  function resetToTray(el) {
    el.style.position = "static";
    el.style.left = "";
    el.style.top = "";
    el.style.transform = "none";
    el.style.zIndex = "";
    clearPlacedClasses(el);
  }

  // --- Drag logic ---
  draggables.forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      el.classList.add("dragging");
      // needed for Firefox
      e.dataTransfer.setData("text/plain", "drag");
      e.dataTransfer.effectAllowed = "move";

      // hide the default ghost image (optional but nice)
      const img = new Image();
      img.src = "transparent.png";
      e.dataTransfer.setDragImage(img, 0, 0);
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
    });
  });

  function enableDrop(targetEl, fitClass) {
    targetEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    targetEl.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".draggable.dragging");
      if (!dragging) return;

      // append into zone so it sits exactly inside the yellow box
      targetEl.appendChild(dragging);
      applyFit(dragging, fitClass);
      dragging.classList.remove("dragging");
    });
  }

  // Drop onto hand zones
  fingerZones.forEach((zone) => enableDrop(zone, "on-finger"));
  enableDrop(wristZone, "on-wrist");

  // Drop onto neck/ear zones
  enableDrop(neckZone, "on-neck");
  enableDrop(earZone, "on-ear");

  // Return to trays (swap back)
  [rings, bracelets, neckAccessories, earringsArea].forEach((tray) => {
    tray.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    tray.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".draggable.dragging");
      if (!dragging) return;

      tray.appendChild(dragging);
      resetToTray(dragging);
      dragging.classList.remove("dragging");
    });
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