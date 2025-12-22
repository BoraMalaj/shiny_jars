document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll(".draggable");

  const zones = document.querySelectorAll(
    ".finger-zone, .wrist-zone, .neck-zone, .ear-zone"
  );

  const containers = {
    rings: document.getElementById("rings"),
    bracelets: document.getElementById("bracelets"),
    neck: document.getElementById("neck-accessories"),
    earrings: document.getElementById("earrings-area"),
  };

  const handImg = document.getElementById("hand");
  const rotateLeftBtn = document.getElementById("rotate-left");
  const rotateRightBtn = document.getElementById("rotate-right");
  let rotation = 0;

  // -------------------------
  // Helpers
  // -------------------------
  function setDragged(el) {
    document.querySelectorAll(".draggable.dragging").forEach(d => d.classList.remove("dragging"));
    el.classList.add("dragging");
  }

  function clearDragged() {
    document.querySelectorAll(".draggable.dragging").forEach(d => d.classList.remove("dragging"));
  }

  function resetPlacedStyles(el) {
    el.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");
    el.style.position = "static";
    el.style.left = "";
    el.style.top = "";
    el.style.transform = "";
    el.style.zIndex = "";
    el.style.pointerEvents = "";
  }

  function getHomeContainer(el) {
    const alt = (el.alt || "").toLowerCase();
    if (alt.includes("ring")) return containers.rings;
    if (alt.includes("bracelet")) return containers.bracelets;
    if (alt.includes("necklace")) return containers.neck;
    if (alt.includes("earring")) return containers.earrings;
    // fallback
    return containers.rings;
  }

  function classForZone(zone) {
    if (zone.classList.contains("finger-zone")) return "on-finger";
    if (zone.classList.contains("wrist-zone")) return "on-wrist";
    if (zone.classList.contains("neck-zone")) return "on-neck";
    if (zone.classList.contains("ear-zone")) return "on-ear";
    return "";
  }

  function snapToZone(item, zone) {
    // zone’s coordinate system is the drop-zone parent
    const dropZone = zone.closest(".drop-zone");
    if (!dropZone) return;

    // read snap config
    const x = parseFloat(zone.dataset.x || "0");
    const y = parseFloat(zone.dataset.y || "0");
    const scale = parseFloat(zone.dataset.scale || "1");
    const rot = parseFloat(zone.dataset.rot || "0");

    // place item as absolute inside dropZone
    dropZone.appendChild(item);

    item.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");
    const cls = classForZone(zone);
    if (cls) item.classList.add(cls);

    item.style.position = "absolute";
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    item.style.zIndex = "30";
    item.style.pointerEvents = "auto";
    item.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
  }

  // -------------------------
  // Desktop Drag & Drop
  // -------------------------
  draggables.forEach((el) => {
    // store "home" once
    el.dataset.home = el.parentElement?.id || "";

    el.addEventListener("dragstart", (e) => {
      setDragged(el);

      // IMPORTANT: required for Firefox
      e.dataTransfer.setData("text/plain", el.alt || "item");

      // make cursor catch easier (don’t use transparent image)
      // If you want hidden ghost later, we can do it safely.
    });

    el.addEventListener("dragend", () => {
      clearDragged();
    });
  });

  zones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragged = document.querySelector(".draggable.dragging");
      if (!dragged) return;

      snapToZone(dragged, zone);
      clearDragged();
    });
  });

  // return areas (rings/bracelets/neck/earrings)
  Object.values(containers).forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragged = document.querySelector(".draggable.dragging");
      if (!dragged) return;

      container.appendChild(dragged);
      resetPlacedStyles(dragged);
      clearDragged();
    });
  });

  // -------------------------
  // Mobile touch support (simple + stable)
  // -------------------------
  draggables.forEach((el) => {
    let startX = 0, startY = 0;
    let dragging = false;

    el.addEventListener("touchstart", (e) => {
      dragging = true;
      setDragged(el);

      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      startX = touch.clientX - rect.left;
      startY = touch.clientY - rect.top;

      // move to body overlay while dragging
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.pointerEvents = "none";
    }, { passive: false });

    el.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      e.preventDefault();

      const touch = e.touches[0];
      el.style.left = `${touch.clientX - startX}px`;
      el.style.top = `${touch.clientY - startY}px`;
    }, { passive: false });

    el.addEventListener("touchend", (e) => {
      if (!dragging) return;
      dragging = false;

      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      // try zone snap
      const zone = target?.closest?.(".finger-zone, .wrist-zone, .neck-zone, .ear-zone");
      if (zone) {
        // restore pointer events before snap
        el.style.pointerEvents = "auto";
        snapToZone(el, zone);
      } else {
        // try return container
        const returnBox = target?.closest?.("#rings, #bracelets, #neck-accessories, #earrings-area");
        if (returnBox) {
          returnBox.appendChild(el);
          resetPlacedStyles(el);
        } else {
          // go home if dropped nowhere
          const home = document.getElementById(el.dataset.home) || getHomeContainer(el);
          home.appendChild(el);
          resetPlacedStyles(el);
        }
      }

      // clean up fixed positioning if not snapped
      if (el.style.position === "fixed") {
        el.style.position = "static";
        el.style.left = "";
        el.style.top = "";
        el.style.zIndex = "";
        el.style.transform = "";
        el.style.pointerEvents = "";
      }

      clearDragged();
    }, { passive: false });
  });

  // -------------------------
  // Rotate buttons (works)
  // -------------------------
  rotateLeftBtn?.addEventListener("click", () => {
    rotation -= 15;
    handImg.style.transform = `rotate(${rotation}deg)`;
  });

  rotateRightBtn?.addEventListener("click", () => {
    rotation += 15;
    handImg.style.transform = `rotate(${rotation}deg)`;
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