document.addEventListener('DOMContentLoaded', function() {
    fetch('../../cmp/header/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-menu-container').innerHTML = data;

            
            const burgerMenu = document.querySelector('.burger-menu');
            const navRight = document.querySelector('.nav-right');
            burgerMenu.addEventListener('click', () => {
                navRight.classList.toggle('active');
            });

            
            document.addEventListener('click', (event) => {
                if (!burgerMenu.contains(event.target) && !navRight.contains(event.target)) {
                    navRight.classList.remove('active');
                }
            });

            
            navRight.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navRight.classList.remove('active');
                });
            });
        });
});