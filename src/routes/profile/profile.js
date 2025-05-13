if (!Object.hasOwn) {
    Object.hasOwn = function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const spinner = document.getElementById('spinner');
    const profileCard = document.getElementById('profile-card');
    const errorMessage = document.getElementById('error-message');
    let emailModal = null;

    function formatPhoneNumber(phone) {
        if (!phone || phone === 'Unknown') return 'Unknown';

        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            const match = cleaned.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
            if (match) {
                return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
            }
        } else if (cleaned.length === 10) {
            const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
            if (match) {
                return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
            }
        }

        return phone;
    }

    async function fetchUserData(nickName, phone) {
        spinner.style.display = 'block';
        profileCard.style.display = 'none';
        errorMessage.style.display = 'none';

        try {
            const response = await fetch('https://picayune-sugar-roadway.glitch.me/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickName, phone }),
            });
            const data = await response.json();
            spinner.style.display = 'none';
            if (data.error) {
                errorMessage.textContent = data.error;
                errorMessage.style.display = 'block';
            } else {
                document.getElementById('nickname').textContent = data.nickname || '';
                document.getElementById('phone').textContent = formatPhoneNumber(data.phone) || '';
                document.getElementById('level').textContent = data.level || '';
                const emailElement = document.getElementById('email');
                emailElement.textContent = data.email || '';
                if (!data.email) {
                    emailElement.innerHTML = '<span style="color: #1e40af; text-decoration: underline; cursor: pointer;" id="add-email">add</span>';
                    document.getElementById('add-email').addEventListener('click', showEmailModal);
                }
                document.getElementById('created_at').textContent = data.created_at
                    ? new Date(data.created_at).toLocaleString()
                    : '';
                profileCard.style.display = 'block';
            }
        } catch (error) {
            spinner.style.display = 'none';
            errorMessage.textContent = 'Failed to load user data';
            errorMessage.style.display = 'block';
            console.error('Error fetching user data:', error);
        }
    }

    function showEmailModal() {
        if (emailModal) emailModal.remove();
        emailModal = document.createElement('div');
        emailModal.className = 'email-modal';
        emailModal.innerHTML = `
            <div class="email-modal-content">
                <input type="email" id="email-input" placeholder="Enter email" required>
                <button id="submit-email">Добавить</button>
            </div>
        `;
        document.body.appendChild(emailModal);

        document.getElementById('submit-email').addEventListener('click', async () => {
            const email = document.getElementById('email-input').value.trim();
            if (!email || !email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/)) {
                createNotification('Введите корректный email', '#dc2626');
                return;
            }
            const phone = localStorage.getItem('Phone');
            try {
                const response = await fetch('https://picayune-sugar-roadway.glitch.me/api/update-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phone, email }),
                });
                const result = await response.json();
                if (response.ok) {
                    createNotification('Email успешно добавлен', '#22c55e');
                    emailModal.remove();
                    fetchUserData(localStorage.getItem('NickName'), phone);
                } else {
                    createNotification(result.error || 'Ошибка сервера', '#dc2626');
                }
            } catch (error) {
                createNotification('Ошибка соединения с сервером', '#dc2626');
                console.error('Error updating email:', error);
            }
        });

        emailModal.addEventListener('click', (e) => {
            if (e.target === emailModal) emailModal.remove();
        });
    }

    const nickName = localStorage.getItem('NickName');
    const phone = localStorage.getItem('Phone');

    if (!nickName || !phone) {
        spinner.style.display = 'none';
        profileCard.style.display = 'none';
        errorMessage.style.display = 'none';
        if (window.modalReady) {
            window.modalReady.then(() => {
                showRegisterModal(true, false);
            }).catch(() => {
                errorMessage.innerHTML = 'Registration or login is required to view profile <span id="open-modal-link" style="color: #1e40af; text-decoration: underline; cursor: pointer;">Register/Login</span>';
                errorMessage.style.display = 'block';
                document.getElementById('open-modal-link').addEventListener('click', () => {
                    showRegisterModal(true, false);
                });
            });
        } else {
            errorMessage.textContent = 'Registration modal not available';
            errorMessage.style.display = 'block';
        }
    } else {
        fetchUserData(nickName, phone);
    }

    window.addEventListener('message', (event) => {
        if (event.data.type === 'registrationComplete' || event.data.type === 'loginComplete') {
            localStorage.setItem('NickName', event.data.nickName);
            localStorage.setItem('Phone', event.data.phone);
            localStorage.setItem('reg', 'yes');
            fetchUserData(event.data.nickName, event.data.phone);
        } else if (event.data.type === 'closeRegisterModal') {
            errorMessage.innerHTML = 'Registration or login is required to view profile <span id="open-modal-link" style="color: #1e40af; text-decoration: underline; cursor: pointer;">Register/Login</span>';
            errorMessage.style.display = 'block';
            document.getElementById('open-modal-link').addEventListener('click', () => {
                showRegisterModal(true, false);
            });
        }
    });

    document.getElementById('lessons-button').addEventListener('click', () => {
        window.location.href = '../../routes/lessons/lessons.html';
    });
});