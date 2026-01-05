document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll(".draggable");

  // Zones
  const fingerZones = document.querySelectorAll(".finger-zone");
  const wristZone = document.querySelector(".wrist-zone");
  const neckZone = document.querySelector(".neck-zone");
  const earZone = document.querySelector(".ear-zone");

  // Trays (return areas)
  const rings = document.getElementById("rings");
  const bracelets = document.getElementById("bracelets");
  const neckAccessories = document.getElementById("neck-accessories");
  const earringsArea = document.getElementById("earrings-area");

  // Containers (drop-zone wrappers that hold the base image + zones)
  const handContainer = document.querySelector(".hand-container");
  const neckContainer = document.querySelector(".neck-container");
  const earContainer = document.querySelector(".ear-container");

  // Rotate buttons
  const rotateLeftBtn = document.getElementById("rotate-left");
  const rotateRightBtn = document.getElementById("rotate-right");
  let rotation = 0;

  // Hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const mainMenu = document.querySelector(".main-menu");

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mainMenu.classList.toggle("active");
  });

  document.querySelectorAll(".main-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      mainMenu.classList.remove("active");
    });
  });

  // -----------------------------
  // Helpers
  // -----------------------------
  const clearAccessoryState = (el) => {
    el.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");
    el.style.left = "";
    el.style.top = "";
    el.style.position = "";
    el.style.zIndex = "";
  };

  const returnToTray = (draggable, tray) => {
    tray.appendChild(draggable);
    draggable.classList.remove("dragging");
    clearAccessoryState(draggable);
    draggable.style.position = "static";
    draggable.style.transform = "none";
  };

  // Get the center of a zone, but relative to the container (hand/neck/ear)
  const getZoneCenterRelativeToContainer = (zone, container) => {
    const z = zone.getBoundingClientRect();
    const c = container.getBoundingClientRect();

    const centerX = (z.left + z.right) / 2 - c.left;
    const centerY = (z.top + z.bottom) / 2 - c.top;

    return { x: centerX, y: centerY };
  };

  // Snap jewelry perfectly onto the body part
  const placeOnBody = (draggable, zone, container, className) => {
    // IMPORTANT: append to the container, NOT inside the zone
    container.appendChild(draggable);

    const { x, y } = getZoneCenterRelativeToContainer(zone, container);

    draggable.classList.remove("dragging");
    draggable.classList.remove("on-finger", "on-wrist", "on-neck", "on-ear");
    draggable.classList.add(className);

    draggable.style.position = "absolute";
    draggable.style.left = `${x}px`;
    draggable.style.top = `${y}px`;
    draggable.style.zIndex = "25";

    // Let CSS class control rotate/scale via transform.
    // If inline transform remains from mobile dragging, clear it:
    draggable.style.transform = "";
  };

  const isTray = (el) => {
    return (
      el === rings ||
      el === bracelets ||
      el === neckAccessories ||
      el === earringsArea
    );
  };

  const findValidDropTarget = (node) => {
    if (!node) return null;
    // Walk up the DOM until we find a zone or tray
    let cur = node;
    while (cur && cur !== document.body) {
      if (
        cur.classList?.contains("finger-zone") ||
        cur.classList?.contains("wrist-zone") ||
        cur.classList?.contains("neck-zone") ||
        cur.classList?.contains("ear-zone") ||
        isTray(cur)
      ) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  };

  // -----------------------------
  // Desktop drag & drop
  // -----------------------------
  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", (e) => {
      draggable.classList.add("dragging");
      // Needed for Firefox / some browsers
      e.dataTransfer.setData("text/plain", "drag");

      // Hide default ghost image
      const transparentImage = new Image();
      transparentImage.src = "transparent.png";
      e.dataTransfer.setDragImage(transparentImage, 0, 0);
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
    });
  });

  // allow drop
  const enableDrop = (el) => {
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
  };

  // Hand zones -> snap to handContainer
  fingerZones.forEach((zone) => {
    enableDrop(zone);
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggable = document.querySelector(".draggable.dragging");
      if (!draggable) return;
      placeOnBody(draggable, zone, handContainer, "on-finger");
    });
  });

  enableDrop(wristZone);
  wristZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggable = document.querySelector(".draggable.dragging");
    if (!draggable) return;
    placeOnBody(draggable, wristZone, handContainer, "on-wrist");
  });

  enableDrop(neckZone);
  neckZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggable = document.querySelector(".draggable.dragging");
    if (!draggable) return;
    placeOnBody(draggable, neckZone, neckContainer, "on-neck");
  });

  enableDrop(earZone);
  earZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggable = document.querySelector(".draggable.dragging");
    if (!draggable) return;
    placeOnBody(draggable, earZone, earContainer, "on-ear");
  });

  // Return trays
  [rings, bracelets, neckAccessories, earringsArea].forEach((tray) => {
    enableDrop(tray);
    tray.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggable = document.querySelector(".draggable.dragging");
      if (!draggable) return;
      returnToTray(draggable, tray);
    });
  });

  // -----------------------------
  // Mobile touch drag (snap logic)
  // -----------------------------
  let active = null;
  let touchOffsetX = 0;
  let touchOffsetY = 0;

  // Prevent page scrolling during drag
  window.addEventListener(
    "touchmove",
    (e) => {
      if (active) e.preventDefault();
    },
    { passive: false }
  );

  draggables.forEach((draggable) => {
    draggable.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        active = draggable;
        active.classList.add("dragging");

        const rect = active.getBoundingClientRect();
        touchOffsetX = touch.clientX - rect.left;
        touchOffsetY = touch.clientY - rect.top;

        // Use fixed position while dragging for accurate movement
        active.style.position = "fixed";
        active.style.left = `${touch.clientX - touchOffsetX}px`;
        active.style.top = `${touch.clientY - touchOffsetY}px`;
        active.style.zIndex = "1000";
      },
      { passive: false }
    );

    draggable.addEventListener(
      "touchmove",
      (e) => {
        if (!active) return;
        const touch = e.touches[0];
        active.style.left = `${touch.clientX - touchOffsetX}px`;
        active.style.top = `${touch.clientY - touchOffsetY}px`;
      },
      { passive: false }
    );

    draggable.addEventListener(
      "touchend",
      (e) => {
        if (!active) return;

        const touch = e.changedTouches[0];
        const rawTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        const target = findValidDropTarget(rawTarget);

        // If dropped on a zone -> snap perfectly
        if (target?.classList?.contains("finger-zone")) {
          placeOnBody(active, target, handContainer, "on-finger");
        } else if (target?.classList?.contains("wrist-zone")) {
          placeOnBody(active, target, handContainer, "on-wrist");
        } else if (target?.classList?.contains("neck-zone")) {
          placeOnBody(active, target, neckContainer, "on-neck");
        } else if (target?.classList?.contains("ear-zone")) {
          placeOnBody(active, target, earContainer, "on-ear");
        }
        // If dropped on a tray -> return
        else if (isTray(target)) {
          returnToTray(active, target);
        }
        // Otherwise: return to its original tray (best effort)
        else {
          const originalContainer =
            active.closest("#rings") ||
            active.closest("#bracelets") ||
            active.closest("#neck-accessories") ||
            active.closest("#earrings-area");

          if (originalContainer) returnToTray(active, originalContainer);
          else {
            // fallback: return to rings
            returnToTray(active, rings);
          }
        }

        active = null;
      },
      { passive: false }
    );
  });

  // -----------------------------
  // Rotate (rotate the whole hand container so jewelry rotates too)
  // -----------------------------
  const applyHandRotation = () => {
    handContainer.style.transform = `rotate(${rotation}deg)`;
    handContainer.style.transformOrigin = "center center";
  };

  rotateLeftBtn?.addEventListener("click", () => {
    rotation -= 15;
    applyHandRotation();
  });

  rotateRightBtn?.addEventListener("click", () => {
    rotation += 15;
    applyHandRotation();
  });
});
