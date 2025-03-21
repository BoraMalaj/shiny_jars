// No JavaScript needed for the start page since the animation is handled by CSS
// You can add this file to keep consistency, but it can be empty
// Redirect to index.html after 5 seconds, if user doesn't click 'Continue to the Game'
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.location.href = 'game.html';
    }, 5000); // Redirect after 5 seconds
});