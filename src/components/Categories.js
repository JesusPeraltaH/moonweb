import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';
import './Categories.css'; // Asegúrate de importar el archivo CSS

function Categories() {
  const [productos, setProductos] = useState([]);
  const placeholderImage = '/assets/placeholder.jpg'; // Cambia esto al nombre real de tu imagen de placeholder

  useEffect(() => {
    fetchProductosPorNegocio();
  }, []);

  async function fetchProductosPorNegocio() {
    try {
      // Obtiene los negocios cuyo campo 'estado' sea false
      const { data: negocios, error: errorNegocios } = await supabase
        .from('negocios')
        .select('*')
        .eq('estado', false); // Filtra negocios por estado
  
      if (errorNegocios) {
        console.error('Error al obtener negocios:', errorNegocios);
        return;
      }
  
      const productosPorNegocio = await Promise.all(
        negocios.map(async (negocio) => {
          const { data: productos, error: errorProductos } = await supabase
            .from('products')
            .select('*')
            .eq('negocioId', negocio.id)
            .limit(1); // Obtener solo un producto por negocio
  
          if (errorProductos) {
            console.error(`Error al obtener productos para el negocio ${negocio.id}:`, errorProductos);
            return null;
          }
  
          const producto = productos[0];
  
          // Verifica si el producto tiene una imageUrl
          if (producto && producto.imageUrl) {
            console.log(`URL de la imagen del producto ${producto.id}:`, producto.imageUrl);
          }
  
          return producto;
        })
      );
  
      // Filtra productos nulos y actualiza el estado
      const productosFiltrados = productosPorNegocio.filter(producto => producto !== null);
  
      console.log('Productos obtenidos para las categorías:', productosFiltrados);
  
      setProductos(productosFiltrados);
    } catch (error) {
      console.error('Error general al obtener productos por negocio:', error.message);
    }
  }
  

  return (
    
    <div className="categories-container"
    style={{
      marginTop: '10px', // Ajusta el margen superior
      padding: '20px',
      overflowY: 'auto', // Habilita el scroll si el contenido es muy largo
      maxHeight: 'calc(100vh - 120px)', // Asegura que el contenedor no desborde la ventana
      boxSizing: 'border-box',
     
    }}

    >
      <h2 className="categories-title"
          style={{ color: '#d4af37', textAlign: 'center' }}
       >Categorías</h2>
      <div className="categories-grid"
         style={{
          marginTop: '50px', // Ajusta el margen superior
          padding: '20px',
          overflowY: 'auto', // Habilita el scroll si el contenido es muy largo
          maxHeight: 'calc(100vh - 120px)', // Asegura que el contenedor no desborde la ventana
          boxSizing: 'border-box',
        }}
      >
        {productos.map((producto) => (
          producto ? ( // Verifica que el producto no sea undefined
            <div
  key={producto.id}
  className="category-item"
  style={{
    backgroundColor: '#1f1f1f', // Fondo de la tarjeta
    border: '2px solid #d4af37', // Contorno dorado
    borderRadius: '8px', // Bordes redondeados
    overflow: 'hidden', // Asegura que el contenido no sobresalga
    textAlign: 'center', // Centra el texto
    width: '200px', // Ancho de la tarjeta
    height: '300px', // Altura de la tarjeta
    cursor: 'pointer', // Indica que es clickeable
    transition: 'transform 0.2s', // Suaviza el efecto hover
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.transform = 'scale(1.05)')
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.transform = 'scale(1)')
  }
>
  <img
    src={producto.imageUrl ? producto.imageUrl : placeholderImage}
    alt={producto.name}
    style={{
      width: '100%',
      height: '150px', // Ajusta la altura de la imagen dentro de la tarjeta
      objectFit: 'cover', // Asegura que la imagen se ajuste correctamente
      borderRadius: 'inherit', // Respeta los bordes redondeados
    }}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = placeholderImage;
    }}
  />
  <h3 style={{ color: '#d4af37', margin: '10px 0' }}>{producto.name}</h3>
  <p style={{ color: '#f1f1f1' }}>{producto.description}</p>
  <p style={{ color: '#f1f1f1' }}>Precio: ${producto.price}</p>
  <p style={{ color: '#f1f1f1' }}>Stock: {producto.quantity}</p>
</div>

          ) : null // Si el producto es undefined, no renderizar nada
        ))}
      </div>
    </div>
    
  );
}

export default Categories;
