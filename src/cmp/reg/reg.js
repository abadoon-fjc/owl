document.addEventListener('DOMContentLoaded', () => {
    const regModalDiv = document.getElementById('reg-modal');
    if (!regModalDiv) {
        console.error('reg-modal div not found');
        return;
    }

    window.modalReady = new Promise((resolve, reject) => {
        fetch('../../cmp/reg/reg.html')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load reg.html: ${response.status}`);
                return response.text();
            })
            .then(data => {
                regModalDiv.innerHTML = data;
                initializeModal();
                resolve();
            })
            .catch(error => {
                console.error('Error loading modal:', error);
                reject(error);
            });
    });

    window.showRegisterModal = function(show = true, hideClose = false) {
        console.warn('Modal not yet initialized. Waiting for initialization...');
        window.modalReady.then(() => {
            window.showRegisterModal(show, hideClose);
        }).catch(() => {
            console.error('Modal initialization failed');
        });
    };

    function initializeModal() {
        const modal = document.getElementById('register-modal');
        const closeButton = document.getElementById('close-register');
        const blur = document.getElementById('blur');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginPhoneInput = document.getElementById('login-phone');
        const loginPasswordInput = document.getElementById('login-password');
        const registerNicknameInput = document.getElementById('register-nickname');
        const registerPhoneInput = document.getElementById('register-phone');
        const registerPasswordInput = document.getElementById('register-password');
        const registerPasswordConfirmInput = document.getElementById('register-password-confirm');
        const submitLoginButton = document.getElementById('submit-login');
        const submitRegisterButton = document.getElementById('submit-register');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLoginFromRegister = document.getElementById('switch-to-login-from-register');

        if (!closeButton) {
            console.error('Close button not found');
            return;
        }
        console.log('Close button found:', closeButton);

        
        [loginPhoneInput, registerPhoneInput].forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > 0 && value[0] !== '7') {
                    value = '7' + value.slice(1);
                }
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }

                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.slice(1, 4);
                }
                if (value.length >= 4) {
                    formatted += ') ' + value.slice(4, 7);
                }
                if (value.length >= 7) {
                    formatted += '-' + value.slice(7, 9);
                }
                if (value.length >= 9) {
                    formatted += '-' + value.slice(9, 11);
                }

                e.target.value = formatted;
            });
        });

        
        registerNicknameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9_\-\,\.]/g, '');
        });

        
        function showForm(form) {
            [loginForm, registerForm].forEach(f => f.classList.remove('active'));
            form.classList.add('active');
        }

        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showForm(registerForm);
        });

        switchToLoginFromRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showForm(loginForm);
        });

        
        async function submitLogin() {
            const phone = loginPhoneInput.value.replace(/[^0-9]/g, '');
            const password = loginPasswordInput.value.trim();

            if (!phone.match(/^7[0-9]{10}$/)) {
                createNotification('The phone number must be in the format +7 (999) 999-99-99', '#dc2626');
                return;
            }
            if (!password) {
                createNotification('Please enter your password', '#dc2626');
                return;
            }

            submitLoginButton.classList.add('loading');
            submitLoginButton.disabled = true;

            try {
                const response = await fetch('https://picayune-sugar-roadway.glitch.me/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phone, password })
                });

                const result = await response.json();
                submitLoginButton.classList.remove('loading');
                submitLoginButton.disabled = false;

                if (response.ok) {
                    createNotification('Login successful!', '#22c55e');
                    window.postMessage({
                        type: 'loginComplete',
                        phone: phone,
                        nickName: result.nickName
                    }, '*');
                    hideModal();
                } else {
                    createNotification(result.error || 'Login Error', '#dc2626');
                }
            } catch (error) {
                submitLoginButton.classList.remove('loading');
                submitLoginButton.disabled = false;
                createNotification('Error connecting to server', '#dc2626');
            }
        }

        
        async function submitRegistration() {
            const nickName = registerNicknameInput.value.trim();
            const phone = registerPhoneInput.value.replace(/[^0-9]/g, '');
            const password = registerPasswordInput.value.trim();
            const passwordConfirm = registerPasswordConfirmInput.value.trim();

            if (!nickName) {
                createNotification('Please enter a nickname', '#dc2626');
                return;
            }
            if (!nickName.match(/^[a-zA-Z0-9_\-\,\.]{1,50}$/)) {
                createNotification('The nickname can only contain English letters, numbers, _, -, ,, .', '#dc2626');
                return;
            }
            if (!phone.match(/^7[0-9]{10}$/)) {
                createNotification('The phone must be in the format +7 (999) 999-99-99', '#dc2626');
                return;
            }
            if (!password) {
                createNotification('Please enter your password', '#dc2626');
                return;
            }
            if (password !== passwordConfirm) {
                createNotification(`Passwords don't match`, '#dc2626');
                return;
            }

            submitRegisterButton.classList.add('loading');
            submitRegisterButton.disabled = true;

            try {
                const response = await fetch('https://picayune-sugar-roadway.glitch.me/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nickName, phone, password })
                });

                const result = await response.json();
                submitRegisterButton.classList.remove('loading');
                submitRegisterButton.disabled = false;

                if (response.ok) {
                    createNotification('Registration successful!', '#22c55e');
                    window.postMessage({
                        type: 'registrationComplete',
                        nickName: nickName,
                        phone: phone
                    }, '*');
                    hideModal();
                } else {
                    createNotification(result.error || 'Registration Error', '#dc2626');
                }
            } catch (error) {
                submitRegisterButton.classList.remove('loading');
                submitRegisterButton.disabled = false;
                createNotification('Error connecting to server', '#dc2626');
            }
        }

        
        function hideModal() {
            modal.classList.remove('active');
            blur.classList.remove('active');
            showForm(loginForm);
            loginPhoneInput.value = '';
            loginPasswordInput.value = '';
            registerNicknameInput.value = '';
            registerPhoneInput.value = '';
            registerPasswordInput.value = '';
            registerPasswordConfirmInput.value = '';
        }

        closeButton.addEventListener('click', () => {
            window.postMessage({
                type: 'closeRegisterModal'
            }, '*');
            hideModal();
        });

        submitLoginButton.addEventListener('click', submitLogin);
        submitRegisterButton.addEventListener('click', submitRegistration);

        window.showRegisterModal = function(show = true, hideClose = false) {
            modal.classList.toggle('active', show);
            blur.classList.toggle('active', show);
            closeButton.style.display = hideClose ? 'none' : 'block';
            console.log('Close button visibility:', closeButton.style.display);
            console.log('Close button styles:', window.getComputedStyle(closeButton));
            if (show) showForm(loginForm);
        };
    }
});