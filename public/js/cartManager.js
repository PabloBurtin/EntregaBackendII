// cartManager.js - Gestión del carrito con JavaScript
const cartManager = {
    // Función para redireccionar con mensaje
    redirectWithMessage: function(url, messageType, message) {
        const newUrl = `${url}?${messageType}=${encodeURIComponent(message)}`;
        window.location.href = newUrl;
    },

    // Función para redireccionar al carrito con mensaje
    redirectToCart: function(cartId, messageType, message) {
        this.redirectWithMessage(`/carts/${cartId}`, messageType, message);
    },

    // Función para redireccionar a productos con mensaje
    redirectToProducts: function(messageType, message) {
        this.redirectWithMessage('/products', messageType, message);
    },

    // Eliminar producto del carrito
    deleteProduct: async function(cartId, productId) {
        if (confirm('¿Eliminar este producto del carrito?')) {
            try {
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    this.redirectToCart(cartId, 'success', 'Producto eliminado correctamente');
                } else {
                    const error = await response.json();
                    this.redirectToCart(cartId, 'error', error.message || 'Error al eliminar producto');
                }
            } catch (error) {
                console.error('Error eliminando producto:', error);
                this.redirectToCart(cartId, 'error', 'Error de conexión');
            }
        }
    },

    // Actualizar cantidad de producto
    updateQuantity: async function(cartId, productId) {
        const quantityInput = document.getElementById(`quantity-${productId}`);
        const quantity = parseInt(quantityInput.value);
        
        if (isNaN(quantity) || quantity < 1) {
            alert('Por favor ingrese una cantidad válida (mínimo 1)');
            return;
        }
        
        try {
            const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });
            
            if (response.ok) {
                this.redirectToCart(cartId, 'success', 'Cantidad actualizada correctamente');
            } else {
                const error = await response.json();
                this.redirectToCart(cartId, 'error', error.message || 'Error al actualizar cantidad');
            }
        } catch (error) {
            console.error('Error actualizando cantidad:', error);
            this.redirectToCart(cartId, 'error', 'Error de conexión');
        }
    },

    // Vaciar carrito
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