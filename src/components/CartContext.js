// CartContext.js
import React, { createContext, useState, useContext } from 'react';

// Crear el contexto del carrito
const CartContext = createContext();

// Proveedor del contexto del carrito
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // Asegúrate de que 'cart' siempre sea un array vacío.

  const addToCart = (product) => {
    setCart((prevCart) => {
      // Buscar si el producto ya está en el carrito
      const existingProduct = prevCart.find((item) => item.id === product.id);
  
      if (existingProduct) {
        // Incrementar la cantidad del producto existente
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Agregar el producto al carrito con cantidad inicial de 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  
   
  };
  
  
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((product) => product.id !== productId));
    
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart,setCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar el contexto del carrito
const useCart = () => useContext(CartContext); 

export { CartProvider, useCart };
