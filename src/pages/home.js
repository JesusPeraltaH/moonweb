import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import Categories from '../components/Categories';
import ProductsByCategory, { CartProvider } from '../components/ProductsByCategory';

import '../styles/home.css'; // Importa el archivo CSS
import SearchBarWithDropdown from '../components/SearchBarWithDropdown';
import ProductModal from '../components/ProductModal';
import { useCart } from '../components/CartContext'; 


function Home() {
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false); 

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]); 
 
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessProducts, setBusinessProducts] = useState([]);

  const [carouselImages, setCarouselImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { cart, addToCart, removeFromCart, setCart } = useCart() || {};

  const [selectedType, setSelectedType] = useState(null); // 'business' o 'product'
  const [selectedData, setSelectedData] = useState(null); // Datos seleccionados
  const [productsOfBusiness, setProductsOfBusiness] = useState([]); // Productos del negocio seleccionado
  const [isModalVisible, setIsModalVisible] = useState(false); // Control del modal



  const placeholderImage = "https://via.placeholder.com/150"; // Imagen de marcador de posición (ajusta el tamaño si es necesario)


  useEffect(() => {
    fetchItems();
    fetchCarouselImages();
   
    console.log(cart);
  }, [cart]);

  
  const handleProductSelect = async (product) => {
    try {
      const { data: productDetails, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single(); // Usamos .single() para obtener un único producto
  
      if (error) {
        console.error('Error fetching product details:', error);
        return;
      }
  
      setSelectedType('product');
      setSelectedData(productDetails);
      setIsModalVisible(true);
    } catch (err) {
      console.error('Error fetching product:', err);
    }
  };
  

  const handleBusinessSelect = async (business) => {
    setSelectedType('business');
    setSelectedData(business);

    // Obtiene los productos del negocio
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('negocioId', business.id);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProductsOfBusiness(products);
    setIsModalVisible(true); // Muestra el modal
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedBusiness(null);
    setBusinessProducts([]);
  };

  const handleAddToCart = (product) => {
    console.log('Producto añadido al carrito:', product);
  };
 
  const closeModal = () => {
    setIsModalVisible(false); // Oculta el modal
    setSelectedType(null);
    setSelectedData(null);
    setProductsOfBusiness([]);
  };

  async function fetchItems() {
    const { data, error } = await supabase
      .from('products')
      .select(`*,
        negocios (nombreempresa)
        `)
      .order('createdat', { ascending: false });

    if (error) {
      alert(`Error al obtener items: ${error.message}`);
    } else {
      console.log(data); // Verifica los datos obtenidos
      setItems(data);
      setFilteredItems(data);
    }
  }

  const prevImage = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1));
  };

  // Función para ir a la siguiente imagen
  const nextImage = () => {
    setActiveIndex((prevIndex) => (prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1));
  };

  const fetchCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from("carousel")
        .select("carouselimg, posicion, mensaje") // Seleccionamos los campos necesarios
        .order("posicion", { ascending: true }); // Ordenamos por el campo 'posicion'

      if (error) {
        console.error("Error al obtener las imágenes del carrusel:", error);
        return;
      }

      setCarouselImages(data); // Actualizamos el estado con las imágenes obtenidas
    } catch (err) {
      console.error("Error al cargar los datos del carrusel:", err);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
  
    // Consolidar productos repetidos
    const consolidatedCart = cart.reduce((acc, item) => {
      const existingProduct = acc.find((p) => p.id === item.id);
      if (existingProduct) {
        existingProduct.quantity += item.quantity;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);
  
    try {
      // Disminuir la cantidad de cada producto en la base de datos
      for (const product of consolidatedCart) {
        const { id, quantity } = product;
  
        // Verifica que el producto tenga cantidad y precio
        if (!quantity || !product.price) {
          console.error('Producto sin cantidad o precio:', product);
          alert('Hubo un problema con uno de los productos en el carrito.');
          return;
        }
  
        // Obtener la cantidad actual del producto desde la base de datos
        const { data, error } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', id)
          .single();
  
        if (error) throw error;
  
        // Verificar si hay suficiente stock
        if (!data || data.quantity < quantity) {
          alert(`No hay suficiente stock de ${product.name}`);
          return;
        }
  
        const updatedQuantity = data.quantity - quantity;
  
        // Actualizar la cantidad en la base de datos
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity: updatedQuantity })
          .eq('id', id);
  
        if (updateError) throw updateError;
      }
  
      // Registrar la venta en la base de datos
      const { error: saleError } = await supabase.from('orders').insert({
        items: consolidatedCart.map(item => item.id), // Solo los IDs de los productos
        total: consolidatedCart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      });
  
      if (saleError) throw saleError;
  
      alert('Venta registrada con éxito.');
      setCart([]); // Limpiar el carrito
      setShowCart(false); // Cerrar el carrito
    } catch (error) {
      console.error('Error durante el checkout:', error.message || error);
      alert('Hubo un error durante el proceso de pago. Verifique la consola para más detalles.');
    }
  };
  
  

  const handleCancel = () => {
    setCart([]); // Vaciar el carrito al cancelar
  };

  const handleIncreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };
  
  const handleDecreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0) // Eliminar productos con cantidad <= 0
    );
  };
  

  
  
    // Función para mostrar/ocultar el carrito
    function toggleCart() {
      setShowCart(!showCart);
    }

   

  return (
 
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <a className="navbar-brand" href="#">Inicio</a>
        <a className="nav-link" href="#">Productos</a>
        <a className="nav-link" href="#">Sobre nosotros</a>
        <div className="ml-auto">
          <Link to="/login">
            <button className="btn btn-primary">Iniciar Sesión</button>
          </Link>
          <button className="btn btn-secondary">Crear Cuenta</button>
        </div>
      </nav>


      <SearchBarWithDropdown
        onProductSelect={handleProductSelect}
        onBusinessSelect={handleBusinessSelect}
      />

      {/* Mostrar el modal dependiendo del tipo de selección */}
      {isModalVisible && (
        <ProductModal
          selectedType={selectedType}
          selectedData={selectedData}
          products={selectedType === 'business' ? productsOfBusiness : null}
          onClose={closeModal}
          onAddToCart={addToCart}
        />
      )}

      {/* Icono del carrito */}
      <div className="cart-icon" onClick={toggleCart}>
        <i className="fas fa-shopping-cart"></i>
        {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
      </div>

      {showCart && (
  <div className="cart-container">
    <h5 className="cart-title">Carrito de compras</h5>
    {cart.length === 0 ? (
      <p className="cart-empty">No hay productos en el carrito</p>
    ) : (
      <ul className="cart-list">
        {cart.map((item) => (
          <React.Fragment key={item.id}>
            <li className="cart-item">
              <div className="cart-item-image-container">
                <img
                  src={item.imageUrl ? item.imageUrl : placeholderImage}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '50px', // Cambié el tamaño para el carrito
                    objectFit: 'cover',
                    borderRadius: '4px', // Asegura bordes redondeados
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
              </div>
              <div className="cart-item-details">
                <span className="cart-item-name">{item.name}</span>
                <div className="cart-quantity">
                  <span>Cantidad:</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDecreaseQuantity(item.id)}
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleIncreaseQuantity(item.id)}
                  >
                    +
                  </button>
                </div>
                <span>Precio: ${item.price}</span>
              </div>
            </li>
            <hr className="cart-item-separator" />
          </React.Fragment>
        ))}
      </ul>
    )}
    <p className="cart-total">
      <strong>
        Total: $
        {cart
          .reduce((total, item) => total + item.price * item.quantity, 0)
          .toFixed(2)}
      </strong>
    </p>
    {cart.length > 0 && (
      <div className="cart-buttons">
        <button onClick={handleCheckout} className="btn btn-primary">
          Pagar
        </button>
        <button onClick={() => setShowCart(false)} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    )}
  </div>
)}



      <div className="container-home">
        {/* Carrusel */}
        
        <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {carouselImages.length > 0 ? (
          carouselImages.map((image, index) => (
            <div
              className={`carousel-item ${index === activeIndex ? "active" : ""}`}
              key={index}
            >
              <img
                src={image.carouselimg} // Usamos la URL de la imagen del campo 'carouselimg'
                className="d-block w-100"
                alt={`Imagen ${index + 1}`}
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>{image.mensaje}</h5> {/* Mostramos el mensaje de la imagen */}
                 {/* Mostramos la posición de la imagen */}
              </div>
            </div>
          ))
        ) : (
          <div className="carousel-item active">
            <img
              src="/assets/images/placeholder.jpg" // Placeholder en caso de que no haya imágenes
              className="d-block w-100"
              alt="Imagen de placeholder"
            />
          </div>
        )}
      </div>

      {/* Controles del carrusel */}
      <a
        className="carousel-control-prev"
        href="#carouselExample"
        role="button"
        onClick={prevImage}
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="sr-only">Previous</span>
      </a>
      <a
        className="carousel-control-next"
        href="#carouselExample"
        role="button"
        onClick={nextImage}
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="sr-only">Next</span>
      </a>
    </div>

        <Categories addToCart={addToCart} />
        <ProductsByCategory addToCart={addToCart} />

      </div>

      <div className="container">
        {/* Grid de tarjetas */}
        <div className="grid-container">
          {items.map((item) => (
            <div className="card" key={item.id}>
              <img 
                src={item.imageUrl ? item.imageUrl : '/assets/placeholder.jpg'} // Usa imageUrl o un placeholder
                alt={`Imagen de ${item.name}`} 
                className="card-img" 
                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/placeholder.jpg'; }} // Manejo de error de carga de imagen
              />
              <div className="card-overlay">
                <h5>{item.name}</h5>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Tu Tienda. Todos los derechos reservados.</p>
          <div className="footer-links">
            <Link to="#">Términos de servicio</Link>
            <Link to="#">Política de privacidad</Link>
            <Link to="#">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
  
}

export default Home;
