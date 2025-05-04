function createNotification(message, backgroundColor = "#333") {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notification.style.backgroundColor = backgroundColor;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("show");
    }, 100);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 2000);
}
