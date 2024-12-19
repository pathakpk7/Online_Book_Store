document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Mock API call to send message
    console.log('Sending message:', { name, email, message });
    alert('Your message has been sent!');
});
