import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import { useCart } from './CartContext';  // Importar el hook useCart

function ProductsByBusiness() {
  const [products, setProducts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const { addToCart, removeFromCart } = useCart(); // Usar el contexto del carrito

  useEffect(() => {
    fetchBusinessesWithProducts();
  }, []);

  async function fetchBusinessesWithProducts() {
    try {
      const { data: negocios, error: errorNegocios } = await supabase
        .from('negocios')
        .select('*')
        .eq('estado', false);

      if (errorNegocios) throw errorNegocios;

      const productos = await Promise.all(
        negocios.map(async (negocio) => {
          const { data: productos, error: errorProductos } = await supabase
            .from('products')
            .select('*')
            .eq('negocioId', negocio.id);

          if (errorProductos) throw errorProductos;

          return { negocio, productos };
        })
      );

      const negociosConProductos = productos.filter((entry) => entry.productos.length > 0);

      setBusinesses(negociosConProductos.map((entry) => entry.negocio));
      setProducts(productos.flatMap((entry) => entry.productos));
    } catch (error) {
      console.error('Error al obtener negocios y productos:', error.message);
      alert(`Error al obtener negocios y productos: ${error.message}`);
    }
  }

  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#1f1f1f',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      backgroundColor: '#1f1f1f',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    },
    thead: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: '#fff',
    },
    cell: {
      padding: '10px',
      verticalAlign: 'top',
      color: '#fff',
    },
    productCard: {
      position: 'relative',
      width: '180px',
      height: '210px',
      margin: '10px',
      overflow: 'hidden',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      backgroundColor: 'transparent',
    },
    productImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease',
    },
    productOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    productOverlayHover: {
      opacity: 1,
    },
    button: {
      padding: '5px 10px',
      backgroundColor: 'gold',
      color: '#000',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonHover: {
      backgroundColor: '#ffc107',
    },
  };

  const groupedBusinesses = businesses.reduce((result, business, index) => {
    const rowIndex = Math.floor(index / 8);
    if (!result[rowIndex]) {
      result[rowIndex] = [];
    }
    result[rowIndex].push(business);
    return result;
  }, []);

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          {groupedBusinesses.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((business) => (
                <th key={business.id} style={styles.cell}>
                  {business.name}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {groupedBusinesses.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((business) => (
                <td key={business.id} style={styles.cell}>
                  {products
                    .filter((product) => product.negocioId === business.id)
                    .map((product) => (
                      <div
                        key={product.id}
                        style={styles.productCard}
                        onMouseEnter={(e) => {
                          const overlay = e.currentTarget.querySelector('.overlay');
                          overlay.style.opacity = 1;
                        }}
                        onMouseLeave={(e) => {
                          const overlay = e.currentTarget.querySelector('.overlay');
                          overlay.style.opacity = 0;
                        }}
                      >
                        <img
                          src={product.imageUrl || '/assets/placeholder.jpg'}
                          alt={product.name}
                          style={styles.productImage}
                        />
                        <div className="overlay" style={styles.productOverlay}>
                          <h5>{product.name}</h5>
                          <p>{product.price} $</p>
                          <button
                            onClick={() => addToCart(product)}
                            style={styles.button}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
                            }}
                          >
                            Agregar al carrito
                          </button>
                        </div>
                      </div>
                    ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsByBusiness;
