document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const fingerZones = document.querySelectorAll('.finger-zone');
    const wristZone = document.querySelector('.wrist-zone');
    const neckZone = document.querySelector('.neck-zone');
    const earZone = document.querySelector('.ear-zone');
    const rings = document.getElementById('rings');
    const bracelets = document.getElementById('bracelets');
    const neckAccessories = document.getElementById('neck-accessories');
    const earringsArea = document.getElementById('earrings-area');
    const hand = document.getElementById('hand');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    let rotation = 0;

    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const mainMenu = document.querySelector('.main-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mainMenu.classList.toggle('active');
    });

    const menuLinks = document.querySelectorAll('.main-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mainMenu.classList.remove('active');
        });
    });

    // Prevent default touchmove behavior to ensure drag works on iOS
    window.addEventListener('touchmove', (e) => {}, { passive: false });

    // Drag-and-Drop Logic
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggable.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });

        draggable.addEventListener('touchstart', (e) => {
            draggable.classList.add('dragging');
            e.preventDefault();
        });

        draggable.addEventListener('touchend', () => {
            draggable.classList.remove('dragging');
        });
    });

    const handleDrop = (zone, className, returnContainer) => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                zone.appendChild(draggable);
                draggable.style.position = 'absolute';
                draggable.style.left = '50%';
                draggable.style.top = '50%';
                draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
                draggable.classList.add(className);
            }
        });

        zone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const rect = zone.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    zone.dispatchEvent(new Event('dragover'));
                }
            }
        }, { passive: false });

        zone.addEventListener('touchend', (e) => {
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const rect = zone.getBoundingClientRect();
                const touch = e.changedTouches[0];
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    zone.dispatchEvent(new Event('drop'));
                } else {
                    returnContainer.appendChild(draggable);
                    draggable.style.position = 'static';
                    draggable.style.transform = 'none';
                    draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
                }
            }
        });
    };

    fingerZones.forEach(zone => handleDrop(zone, 'on-finger', rings));
    handleDrop(wristZone, 'on-wrist', bracelets);
    handleDrop(neckZone, 'on-neck', neckAccessories);
    handleDrop(earZone, 'on-ear', earringsArea);

    const returnZones = [rings, bracelets, neckAccessories, earringsArea];
    returnZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                zone.appendChild(draggable);
                draggable.style.position = 'static';
                draggable.style.transform = 'none';
                draggable.classList.remove('on-finger', 'on-wrist', 'on-neck', 'on-ear');
            }
        });

        zone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const rect = zone.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    zone.dispatchEvent(new Event('dragover'));
                }
            }
        }, { passive: false });

        zone.addEventListener('touchend', (e) => {
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const rect = zone.getBoundingClientRect();
                const touch = e.changedTouches[0];
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    zone.dispatchEvent(new Event('drop'));
                }
            }
        });
    });

    rotateLeftBtn.addEventListener('click', () => {
        rotation -= 15;
        hand.style.transform = `rotate(${rotation}deg)`;
    });

    rotateRightBtn.addEventListener('click', () => {
        rotation += 15;
        hand.style.transform = `rotate(${rotation}deg)`;
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