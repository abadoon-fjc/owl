document.addEventListener('DOMContentLoaded', () => {
    fetch('../../cmp/footer/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.createElement('div');
            footerContainer.innerHTML = data;
            document.body.appendChild(footerContainer);
        })
        .catch(error => console.error('Error loading footer:', error));
});