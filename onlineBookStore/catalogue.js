// Mock book data
const books = [
    { id: 1, title: 'Data Structure Using C and C++', price: 10 },
    { id: 2, title: 'Digital Electronics', price: 15 },
    { id: 3, title: 'Discrete Mathematics', price: 20 }
];

// Function to add book to cart
function addToCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const book = books.find(b => b.id === bookId);

    const issueDate = new Date();
    const returnDate = new Date(issueDate);
    returnDate.setMonth(issueDate.getMonth() + 6);  // Setting return date to 6 months later

    cart.push({ ...book, issueDate, returnDate });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${book.title} added to cart!`);
}

// Function to update cart
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <h3>${item.title}</h3>
            <p>Price: $${item.price}</p>
            <p>Issue Date: ${new Date(item.issueDate).toLocaleDateString()}</p>
            <p>Return Date: ${new Date(item.returnDate).toLocaleDateString()}</p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
        totalPrice += item.price;
    });

    totalPriceElement.innerText = totalPrice.toFixed(2);
}

// Function to remove book from cart
function removeFromCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCart();
}

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", function() {
    updateCart();
});
