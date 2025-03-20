document.addEventListener('DOMContentLoaded', () => {
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
});