// productManager.js - Gestión de productos con JavaScript
const productManager = {
    // Función para redireccionar con mensaje
    redirectWithMessage: function(url, messageType, message) {
        const newUrl = `${url}?${messageType}=${encodeURIComponent(message)}`;
        window.location.href = newUrl;
    },

    // Función para redireccionar a productos con mensaje
    redirectToProducts: function(messageType, message) {
        this.redirectWithMessage('/products', messageType, message);
    },

    // Crear carrito
    createCart: async function() {
        try {
            const response = await fetch('/api/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ redirect: true })
            });
            
            if (response.ok) {
                window.location.href = '/products?success=Carrito+creado+exitosamente';
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Error al crear carrito'));
            }
        } catch (error) {
            console.error('Error creando carrito:', error);
            alert('Error de conexión');
        }
    },

    // Agregar producto al carrito
    addToCart: async function(cartId, productId, inputId) {
        const quantityInput = document.getElementById(`quantity-${inputId}`);
        const quantity = parseInt(quantityInput.value);
        
        if (isNaN(quantity) || quantity < 1) {
            alert('Por favor ingrese una cantidad válida (mínimo 1)');
            return;
        }
        
        try {
            const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });
            
            if (response.ok) {
                this.redirectToProducts('success', 'Producto agregado al carrito');
            } else {
                const error = await response.json();
                this.redirectToProducts('error', error.message || 'Error al agregar producto');
            }
        } catch (error) {
            console.error('Error agregando producto:', error);
            this.redirectToProducts('error', 'Error de conexión');
        }
    },
//Vaciar el carrito
    emptyCart: async function(cartId, redirectToProducts = false) {
        if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
            try {
                const response = await fetch(`/api/carts/${cartId}/empty`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    if (redirectToProducts) {
                        this.redirectToProducts('success', 'Carrito vaciado correctamente');
                    } else {
                        this.redirectToCart(cartId, 'success', 'Carrito vaciado correctamente');
                    }
                } else {
                    const error = await response.json();
                    if (redirectToProducts) {
                        this.redirectToProducts('error', error.message || 'Error al vaciar carrito');
                    } else {
                        this.redirectToCart(cartId, 'error', error.message || 'Error al vaciar carrito');
                    }
                }
            } catch (error) {
                console.error('Error vaciando carrito:', error);
                if (redirectToProducts) {
                    this.redirectToProducts('error', 'Error de conexión');
                } else {
                    this.redirectToCart(cartId, 'error', 'Error de conexión');
                }
            }
        }
    },

    // Eliminar carrito
    deleteCart: async function(cartId, redirectToProducts = false) {
        if (confirm('¿Estás seguro de eliminar el carrito permanentemente?')) {
            try {
                const response = await fetch(`/api/carts/${cartId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    this.redirectToProducts('success', 'Carrito eliminado correctamente');
                } else {
                    const error = await response.json();
                    if (redirectToProducts) {
                        this.redirectToProducts('error', error.message || 'Error al eliminar carrito');
                    } else {
                        this.redirectToCart(cartId, 'error', error.message || 'Error al eliminar carrito');
                    }
                }
            } catch (error) {
                console.error('Error eliminando carrito:', error);
                if (redirectToProducts) {
                    this.redirectToProducts('error', 'Error de conexión');
                } else {
                    this.redirectToCart(cartId, 'error', 'Error de conexión');
                }
            }
        }
    }
};