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

  // Hand rotate (rotate the SCENE so zones + jewelry stay aligned)
  const handScene = document.getElementById('hand-scene');
  const rotateLeftBtn = document.getElementById('rotate-left');
  const rotateRightBtn = document.getElementById('rotate-right');
  let rotation = 0;

  // Hamburger
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

  // -------------------------
  // Fit persistence (per jewelry + zone + side)
  // -------------------------
  const fitKey = (el, zone, dropZone) => {
    const src = el.getAttribute('src') || '';
    const zoneName = zone?.dataset?.zone || 'unknown';
    const part = dropZone?.dataset?.part || 'part';
    const side = dropZone?.dataset?.side || 'front';
    return `sj_fit:${part}:${side}:${zoneName}:${src}`;
  };

  const saveFit = (el) => {
    const key = el.dataset.fitKey;
    if (!key) return;
    const payload = {
      dx: parseFloat(el.dataset.dx || '0'),
      dy: parseFloat(el.dataset.dy || '0'),
      rot: parseFloat(el.dataset.rot || '0'),
      scale: parseFloat(el.dataset.scale || '1'),
      // keep the "anchor" position inside dropzone
      left: el.style.left,
      top: el.style.top
    };
    localStorage.setItem(key, JSON.stringify(payload));
  };

  const loadFit = (el, key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  // -------------------------
  // Helpers
  // -------------------------
  const clearWearState = (el) => {
    el.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear', 'selected');
    el.style.position = '';
    el.style.left = '';
    el.style.top = '';
    el.style.zIndex = '';
    el.style.transform = '';
    el.style.removeProperty('--sj-rot');
    el.style.removeProperty('--sj-scale');
    el.style.removeProperty('--sj-dx');
    el.style.removeProperty('--sj-dy');
    delete el.dataset.fitKey;
    delete el.dataset.dx;
    delete el.dataset.dy;
    delete el.dataset.rot;
    delete el.dataset.scale;
  };

  const setFitVars = (el, { rot, scale, dx, dy }) => {
    el.dataset.rot = String(rot);
    el.dataset.scale = String(scale);
    el.dataset.dx = String(dx);
    el.dataset.dy = String(dy);

    el.style.setProperty('--sj-rot', `${rot}deg`);
    el.style.setProperty('--sj-scale', `${scale}`);
    el.style.setProperty('--sj-dx', `${dx}px`);
    el.style.setProperty('--sj-dy', `${dy}px`);
  };

  const defaultsFromZone = (el, zone) => {
    const baseRot = parseFloat(zone?.dataset?.rotate ?? '0');
    const baseScale = parseFloat(zone?.dataset?.scale ?? '1');

    // per-type nudges (starting point)
    const type = el.dataset.type || '';
    let dx = 0, dy = 0;

    if (type === 'earring')  { dx = -4; dy = 4; }
    if (type === 'necklace') { dx = 0;  dy = 10; }
    if (type === 'ring')     { dx = 0;  dy = 2; }
    if (type === 'bracelet') { dx = 0;  dy = 6; }

    return { rot: baseRot, scale: baseScale, dx, dy };
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
    draggable.style.zIndex = '30';

    const key = fitKey(draggable, zone, dropZone);
    draggable.dataset.fitKey = key;

    // defaults first
    const def = defaultsFromZone(draggable, zone);
    setFitVars(draggable, def);

    // if we have saved fit, apply it
    const saved = loadFit(draggable, key);
    if (saved) {
      const rot = typeof saved.rot === 'number' ? saved.rot : def.rot;
      const scale = typeof saved.scale === 'number' ? saved.scale : def.scale;
      const dx = typeof saved.dx === 'number' ? saved.dx : def.dx;
      const dy = typeof saved.dy === 'number' ? saved.dy : def.dy;
      setFitVars(draggable, { rot, scale, dx, dy });

      if (saved.left) draggable.style.left = saved.left;
      if (saved.top)  draggable.style.top = saved.top;
    }

    selectJewelry(draggable);
  };

  const returnToTray = (draggable, tray) => {
    tray.appendChild(draggable);
    draggable.classList.remove('dragging', 'selected');
    clearWearState(draggable);
    draggable.style.position = 'static';
    draggable.style.transform = 'none';
  };

  // -------------------------
  // Selection + fine tuning
  // -------------------------
  let selected = null;

  const deselectAll = () => {
    document.querySelectorAll('.draggable.selected').forEach(el => el.classList.remove('selected'));
    selected = null;
  };

  const selectJewelry = (el) => {
    deselectAll();
    el.classList.add('selected');
    selected = el;
  };

  // Click/tap selects
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains('draggable') && (
      t.classList.contains('on-finger') || t.classList.contains('on-wrist') || t.classList.contains('on-neck') || t.classList.contains('on-ear')
    )) {
      selectJewelry(t);
    } else {
      // keep clicks on UI from clearing selection
      if (!t.closest('.toggle-side') && !t.closest('#rotate-left') && !t.closest('#rotate-right')) {
        deselectAll();
      }
    }
  });

  // Keyboard nudges (desktop)
  window.addEventListener('keydown', (e) => {
    if (!selected) return;

    const step = e.shiftKey ? 5 : 1;
    let dx = parseFloat(selected.dataset.dx || '0');
    let dy = parseFloat(selected.dataset.dy || '0');
    let rot = parseFloat(selected.dataset.rot || '0');
    let scale = parseFloat(selected.dataset.scale || '1');

    let changed = false;

    if (e.key === 'ArrowLeft')  { dx -= step; changed = true; }
    if (e.key === 'ArrowRight') { dx += step; changed = true; }
    if (e.key === 'ArrowUp')    { dy -= step; changed = true; }
    if (e.key === 'ArrowDown')  { dy += step; changed = true; }

    if (e.key === '[') { rot -= 1; changed = true; }
    if (e.key === ']') { rot += 1; changed = true; }

    if (e.key === '-' || e.key === '_') { scale = Math.max(0.2, scale - 0.02); changed = true; }
    if (e.key === '+' || e.key === '=') { scale = Math.min(3.0, scale + 0.02); changed = true; }

    if (e.key.toLowerCase() === 's') {
      saveFit(selected);
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const type = selected.dataset.type;
      if (type === 'ring') returnToTray(selected, rings);
      else if (type === 'bracelet') returnToTray(selected, bracelets);
      else if (type === 'necklace') returnToTray(selected, neckAccessories);
      else if (type === 'earring') returnToTray(selected, earringsArea);
      else returnToTray(selected, rings);
      return;
    }

    if (changed) {
      e.preventDefault();
      setFitVars(selected, { rot, scale, dx, dy });
    }
  });

  // Drag-to-fine-move (desktop + mobile via pointer events)
  let moving = null;
  let moveStart = { x: 0, y: 0, left: 0, top: 0 };

  const pxToNum = (v) => parseFloat(String(v || '0').replace('px','')) || 0;

  document.addEventListener('pointerdown', (e) => {
    const t = e.target;
    if (!(t.classList && t.classList.contains('draggable'))) return;

    // only allow fine-move if it's already placed on body
    if (!(t.classList.contains('on-finger') || t.classList.contains('on-wrist') || t.classList.contains('on-neck') || t.classList.contains('on-ear'))) return;

    selectJewelry(t);
    moving = t;
    moving.setPointerCapture(e.pointerId);

    moveStart.x = e.clientX;
    moveStart.y = e.clientY;
    moveStart.left = pxToNum(moving.style.left);
    moveStart.top  = pxToNum(moving.style.top);
  });

  document.addEventListener('pointermove', (e) => {
    if (!moving) return;
    const dx = e.clientX - moveStart.x;
    const dy = e.clientY - moveStart.y;
    moving.style.left = `${moveStart.left + dx}px`;
    moving.style.top  = `${moveStart.top + dy}px`;
  });

  document.addEventListener('pointerup', () => {
    if (!moving) return;
    // auto-save position (not rotation/scale) to avoid losing it by mistake
    saveFit(moving);
    moving = null;
  });

  // -------------------------
  // Desktop drag/drop (tray -> zones)
  // -------------------------
  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
      draggable.classList.add('dragging');
      e.dataTransfer.setData('text/plain', '');

      // hide ghost (needs transparent.png in repo)
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

  // Return trays (drop back)
  [rings, bracelets, neckAccessories, earringsArea].forEach(tray => {
    enableDrop(tray);
    tray.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggable = document.querySelector('.draggable.dragging');
      if (!draggable) return;
      returnToTray(draggable, tray);
    });
  });

  // -------------------------
  // Mobile touch drag (tray -> zones) (keep your logic)
  // -------------------------
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
      // if it's already on body, we don't start tray-drag here (pointer events handles fine-move)
      if (draggable.classList.contains('on-finger') || draggable.classList.contains('on-wrist') || draggable.classList.contains('on-neck') || draggable.classList.contains('on-ear')) {
        selectJewelry(draggable);
        return;
      }

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

  // Rotate buttons (scene rotation)
  rotateLeftBtn.addEventListener('click', () => {
    rotation -= 15;
    handScene.style.transform = `rotate(${rotation}deg)`;
  });

  rotateRightBtn.addEventListener('click', () => {
    rotation += 15;
    handScene.style.transform = `rotate(${rotation}deg)`;
  });

  // -------------------------
  // Front/Back toggle (expects you to add *_back.png files later)
  // -------------------------
  const sideImages = {
    hand: { front: 'hand-ai.png', back: 'hand-ai-back.png' },
    neck: { front: 'neck-ai.png', back: 'neck-ai-back.png' },
    ear:  { front: 'ear-ai.png',  back: 'ear-ai-back.png'  },
  };

  const setSide = (dropId, nextSide) => {
    const drop = document.getElementById(dropId);
    const part = drop.dataset.part;
    drop.dataset.side = nextSide;

    const img = drop.querySelector('.base-image');
    const src = sideImages[part]?.[nextSide];
    if (img && src) img.src = src;

    // When switching side, saved fits are side-specific (key includes side),
    // so users can calibrate front and back separately.
    deselectAll();
  };

  document.querySelectorAll('.toggle-side').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const drop = document.getElementById(targetId);
      const cur = drop.dataset.side || 'front';
      const next = (cur === 'front') ? 'back' : 'front';
      setSide(targetId, next);
    });
  });
});