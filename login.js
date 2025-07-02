document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-message');
    const container = document.querySelector('.login-container');

    // Pre-fill email if previously saved
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }

    function clearError() {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
    }

    loginBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();

        // Validate email
        if (email === '' || !email.includes('@')) {
            showError('Please enter a valid email.');
            return;
        }

        // Handle remember-me storage
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }

        // Simulate sending magic link
        clearError();
        container.style.display = 'none';

        const successMsg = document.createElement('h2');
        successMsg.textContent = 'Magic link sent! Please check your email to log in.';
        successMsg.style.textAlign = 'center';
        document.body.appendChild(successMsg);

        console.log('Magic link flow simulated for', email);
    });
}); 