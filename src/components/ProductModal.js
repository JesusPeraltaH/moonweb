import React from 'react';
import './ProductModal.css';

function ProductModal({ selectedType, selectedData, products, onClose, onAddToCart }) {
  return (
    <div
      className="modal fade show"
      style={{ display: 'block' }}
      tabIndex="-1"
      aria-labelledby="productModal"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {selectedType === 'business'
                ? `Productos de ${selectedData.nombreempresa}`
                : `Detalles del Producto`}
            </h5>
            <button
              type="button"
              className="close"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {selectedType === 'business' && products && (
              <div className="product-list">
                {products.map((product) => (
                  <div key={product.id} className="product-item">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="img-fluid"
                    />
                    <h5>{product.name}</h5>
                    <p>{product.description}</p>
                    <p>Precio: ${product.price}</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onAddToCart(product)}
                    >
                      Añadir al carrito
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedType === 'product' && selectedData && (
              <div className="product-item">
                <img
                  src={selectedData.imageUrl}
                  alt={selectedData.name}
                  className="img-fluid"
                />
                <h5>{selectedData.name}</h5>
                <p>{selectedData.description}</p>
                <p>Precio: ${selectedData.price}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onAddToCart(selectedData)}
                >
                  Añadir al carrito
                </button>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default ProductModal;
