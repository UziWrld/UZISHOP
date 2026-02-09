let cart = [];

// Función para añadir al carrito
function addToCart(itemName, itemPrice, itemImage) {
    const item = {
        name: itemName,
        price: itemPrice,
        image: itemImage
    };
    cart.push(item);
    updateCart();
}

// Función para actualizar el carrito
function updateCart() {
    let totalAmount = 0;
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = ''; // Limpiar los elementos anteriores

    if (cart.length > 0) {
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            const itemContent = document.createElement('div');
            const itemImage = document.createElement('img');
            itemImage.src = item.image; 
            itemImage.alt = item.name; 
            itemImage.style.width = '50px';  // Ajusta el tamaño de la imagen
            itemImage.style.height = '50px';
            itemContent.appendChild(itemImage);

            const itemText = document.createElement('span');
            itemText.textContent = `${item.name} - $${item.price}`;
            itemContent.appendChild(itemText);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.style.backgroundColor = '#e74c3c';
            removeButton.style.color = 'white';
            removeButton.style.padding = '5px';
            removeButton.style.borderRadius = '5px';
            removeButton.style.cursor = 'pointer';
            removeButton.onclick = () => removeItemFromCart(index);

            li.appendChild(itemContent);
            li.appendChild(removeButton);
            cartItems.appendChild(li);

            totalAmount += item.price;
        });

        document.getElementById('totalAmount').textContent = totalAmount;
    } else {
        document.getElementById('totalAmount').textContent = '0';
    }
}

// Función para eliminar un producto del carrito
function removeItemFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Función para mostrar el carrito
function showCart() {
    const cartContainer = document.getElementById('cartContainer');
    cartContainer.style.display = (cartContainer.style.display === 'none') ? 'block' : 'none';
}

// Función para vaciar el carrito
function clearCart() {
    cart = []; 
    updateCart(); 
    showCart(); 
}

// Función para proceder al pago
document.getElementById('checkoutButton').addEventListener('click', function () {
    if (cart.length > 0) {
        window.location.href = "payment.php";
    } else {
        alert('Your cart is empty!');
    }
});


