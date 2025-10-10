document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Mock API call to authenticate user
    console.log('Logging in user:', { email, password });
    alert('Login successful!');
});
