let scene, camera, renderer, cube, rotating = true;
let rotationSpeed = 0.0025;
let displayedPhrase = null;
const phraseDiv = document.createElement("div");
phraseDiv.classList.add("cube-text");
document.getElementById("scene-container").appendChild(phraseDiv);

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x121212);
    document.getElementById("scene-container").appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
    cube = new THREE.LineSegments(edges, material);
    scene.add(cube);

    document.getElementById("scene-container").addEventListener("mousemove", pauseRotation);
    document.getElementById("scene-container").addEventListener("mouseleave", resumeRotation);
    
    phraseDiv.innerHTML = "<span class='latin'>Latin Wisdom</span>";
    animate();
}

function pauseRotation(event) {
    rotating = false;
    if (!displayedPhrase) {
        fetchRandomPhrase();
    }
}

function resumeRotation() {
    rotating = true;
    displayedPhrase = null;
    phraseDiv.innerHTML = "<span class='latin'>Latin Wisdom</span>";
}

function fetchRandomPhrase() {
    fetch("/random-phrase")
        .then(response => response.json())
        .then(data => updateCubeText(data.latin, data.translation));
}

function updateCubeText(latin, translation) {
    displayedPhrase = { latin, translation };
    phraseDiv.innerHTML = `<span class='latin'>${latin}</span><br><span class='english'>${translation}</span>`;
}

function animate() {
    requestAnimationFrame(animate);
    if (rotating) {
        cube.rotation.x += rotationSpeed;
        cube.rotation.y += rotationSpeed;
        cube.rotation.z += rotationSpeed;
    }
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();