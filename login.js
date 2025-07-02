document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-message');

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
        const password = passwordInput.value;

        // Validation Rule 1
        if (email === '' || !email.includes('@')) {
            showError('Please enter a valid email.');
            return;
        }

        // Validation Rule 2
        if (password.length < 8) {
            showError('Password must be at least 8 characters.');
            return;
        }

        // All validations passed
        clearError();
        console.log('Login successful!');
    });
}); 