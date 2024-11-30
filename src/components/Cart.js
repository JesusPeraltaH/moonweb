// Cart.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

function Cart({ cartItems, onCheckout }) {
  const totalItems = cartItems.length;

  return (
    <div className="cart-container">
      <div className="cart-icon">
        <span className="cart-count">{totalItems}</span>
        <i className="fas fa-shopping-cart"></i>
      </div>
      {totalItems > 0 && (
        <div className="cart-float">
          <h4>Carrito</h4>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <p>{item.name}</p>
                <p>${item.price}</p>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary checkout-button" onClick={onCheckout}>
            Ir a checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
