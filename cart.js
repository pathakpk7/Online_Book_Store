
document.addEventListener("DOMContentLoaded", function() {
    updateCart();
});

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
        totalPrice =totalPrice + item.price * item.quantity;
    });

    totalPriceElement.innerText = totalPrice.toFixed(2);
}

// Function to remove book from cart
function removeFromCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItem = cart.find(item => item.id === bookId);

    if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== bookId);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Function to proceed to checkout
function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
        alert('Proceeding to checkout!');
        // Add checkout process logic here
    } else {
        alert('Your cart is empty.');
    }
}

// Mock book data
const books = [
    { id: 1, title: 'Data Structure Using C and C++', price: 10 },
    { id: 2, title: 'Digital Electronics', price: 15 },
    { id: 3, title: 'Discrete Mathematics', price: 20 }
];
console.log("hello world")
// Function to add book to cart
function addToCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const book = books.find(b => b.id === bookId);

    const issueDate = new Date();
    const returnDate = new Date(issueDate);
    returnDate.setMonth(issueDate.getMonth() + 6);  // Setting return date to 6 months later

    const cartItem = cart.find(item => item.id === bookId);
    if (cartItem) {
        console.log(typeof(cartitem.quantity))
        cartItem.quantity += 1;
        console.log("hello world")
    } else {
        cart.push({ ...book, issueDate, returnDate, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${book.title} added to cart!`);

    updateCart();
}
