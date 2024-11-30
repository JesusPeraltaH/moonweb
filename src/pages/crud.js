import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import { FaTrash, FaEdit, FaBox, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/crud.css';

function CRUD() {
  const [negocios, setNegocios] = useState([]);
  const [newLogo, setNewLogo] = useState(null);
  const [newNombreDueno, setNewNombreDueno] = useState('');
  const [newNombreEmpresa, setNewNombreEmpresa] = useState('');
  const [newTelefono, setNewTelefono] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNegocio, setSelectedNegocio] = useState(null);
  const [editNombreDueno, setEditNombreDueno] = useState('');
  const [editNombreEmpresa, setEditNombreEmpresa] = useState('');

  const [editTelefono, setEditTelefono] = useState('');
  const [productos, setProductos] = useState([]);
  const [isProductContainerOpen, setIsProductContainerOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState(0);
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductImage, setNewProductImage] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedNegocioId, setSelectedNegocioId] = useState(null);
 
  // Aquí guardamos las imágenes del carrusel
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar la visibilidad del modal
  const [bucketImages, setBucketImages] = useState([]); 
  const [newCarouselImage, setNewCarouselImage] = useState(null); // Para la nueva imagen
  const [carouselPosition, setCarouselPosition] = useState(""); // Para la posición
  const [carouselMessage, setCarouselMessage] = useState(""); // Para el mensaje
  const [carouselImages, setCarouselImages] = useState([]);

  const [showEditProductModal, setShowEditProductModal] = useState(false); // Controla si el modal está abierto o cerrado
  const [editProductName, setEditProductName] = useState('');
  const [editProductQuantity, setEditProductQuantity] = useState(0);
  const [editProductCode, setEditProductCode] = useState('');
  const [editProductPrice, setEditProductPrice] = useState(0);
  const [editProductImage, setEditProductImage] = useState(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);


  const [editProductImageUrl, setEditProductImageUrl] = useState(""); // Para la URL de la imagen actual
  const [editProductFile, setEditProductFile] = useState(null); // Para el archivo de imagen seleccionado
  const [selectedProduct, setSelectedProduct] = useState(null); // Para almacenar el producto seleccionado para editar


  useEffect(() => {
    fetchNegocios();
    fetchCarouselImages();
  }, [showEditProductModal]);

  async function fetchNegocios() {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .order('createdat', { ascending: false });

    if (error) {
      alert(`Error al obtener negocios: ${error.message}`);
    } else {
      setNegocios(data);
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function createNegocio() {
    const now = new Date().toISOString();
  
    if (!newLogo) {
      alert('Por favor, selecciona un logo para el negocio.');
      return;
    }
  
    // Generar un nombre de archivo único usando la marca de tiempo
    const uniqueFileName = `${Date.now()}-${newLogo.name}`;
  
    // Subir la imagen al bucket "negocio-images" sin carpeta adicional
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('negocio-images')
      .upload(uniqueFileName, newLogo); // Subimos sin la carpeta 'public/'
  
      if (uploadError) {
        console.error('Error al subir la imagen:', uploadError);
        alert(`Error al subir la imagen: ${uploadError.message}`);
        return;
    }
  
    // Obtener la URL pública del archivo directamente desde el objeto subido
    const { data: publicUrlData, error: publicUrlError } = await supabase
      .storage
      .from('negocio-images')
      .getPublicUrl(uniqueFileName);
  
    if (publicUrlError) {
      alert(`Error al obtener la URL pública: ${publicUrlError.message}`);
      return;
    }
  
    const logoUrl = publicUrlData.publicUrl;
  
    // Insertar el negocio en la tabla "negocios" con la URL de la imagen
    const { data, error } = await supabase
      .from('negocios')
      .insert([{ logo: logoUrl, nombredueno: newNombreDueno, nombreempresa: newNombreEmpresa, telefono: newTelefono, createdat: now }])
      .select();
  
    if (error) {
      alert(`Error al crear negocio: ${error.message}`);
    } else {
      setNegocios([data[0], ...negocios]);
      setNewLogo(null);
      setNewNombreDueno('');
      setNewNombreEmpresa('');
      setNewTelefono('');
    }
  }
  

  async function fetchProductos(negocioId) {
    // Validar si negocioId está definido antes de continuar
    if (!negocioId) {
      console.error("Error: El negocio ID no está definido.");
      alert("Error: No se pudo cargar los productos porque el negocio ID no está definido.");
      return; // Salir de la función si negocioId es inválido
    }
  
    try {
      // Realizar la consulta a la base de datos
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('negocioId', negocioId);
  
      // Manejar errores de la consulta
      if (error) {
        console.error('Error al obtener productos:', error.message);
        alert('Error al obtener productos: ' + error.message);
        return; // Salir si hay un error
      }
  
      // Si no hay error, actualizar los estados
      setProductos(data);
      setSelectedNegocio(negocios.find(negocio => negocio.id === negocioId));
      setSelectedNegocioId(negocioId);
      setIsProductContainerOpen(true);
      setShowProductForm(false);
    } catch (error) {
      // Manejar errores inesperados
      console.error('Error inesperado al obtener productos:', error.message);
      alert('Ocurrió un error inesperado al obtener los productos.');
    }
  }
  

  async function createProduct() {
    let imageUrl = '';
    if (newProductImage) {
      const uniqueFileName = `${Date.now()}-${newProductImage.name}`;
  
      // Subir la imagen al bucket 'product-images'
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(uniqueFileName, newProductImage);
  
      if (error) {
        alert('Error al subir la imagen:'+ error.message);
        return;
      }
  
      // Obtener la URL pública del archivo
      const { data: publicUrlData, error: publicUrlError } = await supabase
        .storage
        .from('product-images')
        .getPublicUrl(uniqueFileName);
  
      if (publicUrlError) {
        alert('Error al obtener la URL pública de la imagen: '+ publicUrlError.message);
        return;
      }
  
      imageUrl = publicUrlData.publicUrl; // URL pública de la imagen
    }
  
    // Guardar los datos del producto en la base de datos
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: newProductName,
        quantity: newProductQuantity,
        code: newProductCode,
        price: newProductPrice,
        imageUrl: imageUrl,
        negocioId: selectedNegocioId
      }])
      .select();
  
    if (error) {
      alert('Error al crear producto: '+ error.message);
    } else {
      setProductos([...productos, data[0]]);
      setNewProductName('');
      setNewProductQuantity(0);
      setNewProductCode('');
      setNewProductPrice(0);
      setNewProductImage(null);
    }
  }

  function openEditProductModal(product) {
   
    setSelectedProduct(product); // Producto seleccionado
    setEditProductName(product.name || ""); // Rellenar nombre
    setEditProductPrice(product.price || 0); // Rellenar precio
    setEditProductQuantity(product.quantity || 0); // Rellenar cantidad
    setEditProductCode(product.code || ""); // Rellenar código
    setEditProductImageUrl(product.imageUrl || ""); // Rellenar imagen
     // Resetea archivo
    setShowEditProductModal(true); // Abre el modal
  }
  

  function closeEditProductModal() {
    setShowEditProductModal(false); // Cierra el modal
  }
  
  
  
  async function updateProduct() {
    try {
      let imageUrl = editProductImageUrl; // Mantén la imagen actual por defecto
  
      // Subir nueva imagen si se selecciona
      if (editProductFile) {
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(`public/${Date.now()}_${editProductFile.name}`, editProductFile);
  
        if (error) throw error;
  
        imageUrl = `https://efoerjjzamedrddxdgnh.supabase.co/storage/v1/object/public/product-images/${data.path}`;
      }
  
      // Actualizar producto en la base de datos
      const { error } = await supabase
        .from('products')
        .update({
          name: editProductName,
          quantity: editProductQuantity,
          code: editProductCode,
          price: editProductPrice,
          imageUrl, // Mantener URL actualizada
        })
        .eq('id', selectedProduct.id);
  
      if (error) throw error;
  
      alert('Producto actualizado correctamente');
  
      // Llamar a fetchProductos después de la actualización
      if (selectedProduct && selectedProduct.negocioid) {
        await fetchProductos(selectedProduct.negocioid); // Refrescar productos
      }
  
      // Cerrar los modales
      setShowEditProductModal(false);
      setIsProductContainerOpen(false);
    } catch (error) {
      console.error('Error actualizando el producto:', error.message);
      alert('Ocurrió un error al actualizar el producto: ' + error.message);
    }
  }


  
  
  
  async function deleteProduct(productId) {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return; // Si el usuario cancela, no se hace nada
    }
  
    try {
      // Eliminar el producto de la base de datos
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
  
      if (error) throw error;
  
      alert('Producto eliminado correctamente');
  
      // Refrescar la lista de productos después de eliminar
      if (selectedNegocioId) {
        await fetchProductos(selectedNegocioId);
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error.message);
      alert('Ocurrió un error al eliminar el producto: ' + error.message);
    }
  }
  

 
  
  function toggleEstadoNegocio(id, currentEstado) {
    const newEstado = !currentEstado;
  
    updateNegocioEstado(id, newEstado)
      .then(() => {
        setNegocios((prevNegocios) =>
          prevNegocios.map((negocio) =>
            negocio.id === id ? { ...negocio, estado: newEstado } : negocio
          )
        );
      })
      .catch((error) => {
        console.error("Error al actualizar el estado del negocio:", error);
      });
  }
  
  async function updateNegocioEstado(id, newEstado) {
    const { data, error } = await supabase
      .from('negocios')
      .update({ estado: newEstado })
      .eq('id', id);
  
    if (error) throw error;
    return data;
  }
  
  
  
  function openEditModal(negocio) {
    console.log("Abrir modal para negocio:", negocio);
    setSelectedNegocio(negocio);
    setEditNombreDueno(negocio.nombredueno || '');
    setEditNombreEmpresa(negocio.nombreempresa || '');
    setEditTelefono(negocio.telefono || '');
    setIsEditModalOpen(true);
  }
  

  async function updateNegocio() {
    const { error } = await supabase
      .from('negocios')
      .update({ nombredueno: editNombreDueno, nombreempresa: editNombreEmpresa, telefono: editTelefono })
      .match({ id: selectedNegocio.id });

    if (error) {
      alert('Error al actualizar negocio:' +error.message);
    } else {
      setNegocios(negocios.map(negocio => (negocio.id === selectedNegocio.id ? { ...negocio, nombredueno: editNombreDueno, nombreempresa: editNombreEmpresa, telefono: editTelefono } : negocio)));
      setIsEditModalOpen(false);
    }
  }

  
    // Función para abrir el modal y cargar las imágenes del bucket
    const showImageModal = () => {
       // Cargamos las imágenes cuando se abre el modal
      setIsModalVisible(true); // Abrimos el modal
    };
  
    // Función para cerrar el modal
    const closeImageModal = () => {
      setIsModalVisible(false); // Cerramos el modal
    };

    const fetchCarouselImages = async () => {
      try {
        const { data, error } = await supabase
          .from("carousel") // Nombre de tu tabla en Supabase
          .select("*") // Seleccionamos todos los campos
          .order("posicion", { ascending: true }); // Ordenamos por el campo 'posicion'
  
        if (error) {
          console.error("Error al obtener imágenes del carrusel:", error);
          return;
        }
  
        setCarouselImages(data); // Guardamos los datos en el estado
      } catch (err) {
        console.error("Error al cargar datos del carrusel:", err);
      }
    };

    
  
    // Subir imagen al almacenamiento de Supabase y agregar la URL a la tabla 'carousel-img'
    const uploadCarouselImage = async () => {
      if (!newCarouselImage) {
        alert("Por favor, selecciona una imagen antes de subir.");
        return;
      }
    
      const posicion = prompt("Ingresa la posición de la imagen en el carrusel:");
      if (!posicion || isNaN(posicion)) {
        alert("La posición debe ser un número válido.");
        return;
      }
    
      const mensaje = prompt("Ingresa un mensaje para esta imagen (opcional):") || "";
    
      // Generar un nombre único para el archivo
      const uniqueFileName = `${Date.now()}-${newCarouselImage.name}`;
    
      // Subimos la imagen al bucket 'carousel-images' en Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('carousel-images')
        .upload(uniqueFileName, newCarouselImage);
    
      if (uploadError) {
        console.error("Error al subir la imagen:", uploadError);
        alert("Hubo un error al subir la imagen.");
        return;
      }
    
      // Obtenemos la URL pública de la imagen subida
      const { data: publicUrlData, error: publicUrlError } = await supabase
        .storage
        .from('carousel-images')
        .getPublicUrl(uniqueFileName);
    
      if (publicUrlError) {
        console.error("Error al obtener la URL pública:", publicUrlError);
        alert("Hubo un error al obtener la URL pública de la imagen.");
        return;
      }
    
      const imageUrl = publicUrlData.publicUrl;
    
      // Guardamos la URL, posición y mensaje en la tabla 'carousel'
      const { data: insertedData, error: insertError } = await supabase
        .from('carousel')
        .insert([
          {
            carouselimg: imageUrl,
            posicion: parseInt(posicion, 10), // Convertimos la posición a número
            mensaje: mensaje.trim(), // Limpiamos el mensaje
          },
        ])
        .select(); // Para devolver los datos insertados
    
      if (insertError) {
        console.error("Error al guardar la información en la tabla:", insertError);
        alert("Hubo un error al guardar la información del carrusel.");
        return;
      }
    
      // Imprimir en la consola los datos ingresados
      console.log("Datos guardados en la base de datos:", insertedData);
    
      // Actualizamos el estado de imágenes del carrusel (opcional)
      setCarouselImages([...carouselImages, { carouselImg: imageUrl, posicion, mensaje }]);
      setNewCarouselImage(null); // Limpiamos el input
      alert("Imagen subida exitosamente al carrusel.");
    };
    
    const deleteCarouselImage = async (imageId) => {
      if (!imageId) return;
    
      const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta imagen?");
      if (!confirmDelete) return;
    
      try {
        // Elimina la imagen de la tabla `carousel` utilizando Supabase
        const { error } = await supabase
          .from('carousel')
          .delete()
          .eq('id', imageId);
    
        if (error) {
          console.error("Error al eliminar la imagen:", error.message);
          alert("Hubo un problema al eliminar la imagen.");
          return;
        }
    
        // Actualiza el estado local si la eliminación fue exitosa
        setCarouselImages((prevImages) => prevImages.filter((image) => image.id !== imageId));
        alert("Imagen eliminada correctamente.");
      } catch (error) {
        console.error("Error de red o del servidor:", error);
        alert("No se pudo conectar con el servidor.");
      }
    };
    
    

    
    
  

  return (
    <div className="page-container">
      <div className="crud-container">
        <div className="crud-form">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewLogo(e.target.files[0])} 
            className="crud-input"
          />
          {newLogo && <img src={newLogo} alt="Logo Preview" style={{ width: '50px', marginBottom: '10px' }} />}
          <input
            type="text"
            value={newNombreDueno}
            onChange={(e) => setNewNombreDueno(e.target.value)}
            placeholder="Nombre del dueño"
            className="crud-input"
          />
          <input
            type="text"
            value={newNombreEmpresa}
            onChange={(e) => setNewNombreEmpresa(e.target.value)}
            placeholder="Nombre de la empresa"
            className="crud-input"
          />
          <input
            type="text"
            value={newTelefono}
            onChange={(e) => setNewTelefono(e.target.value)}
            placeholder="Teléfono"
            className="crud-input"
          />
          <button onClick={createNegocio} className="crud-btn">
            Agregar negocio
          </button>
        </div>

     

        

<table className="crud-table">
  <thead>
    <tr>
      <th>Logo</th>
      <th>Nombre Dueño</th>
      <th>Nombre Empresa</th>
      <th>Teléfono</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {negocios.map((negocio) => (
      <tr key={negocio.id}>
        <td><img src={negocio.logo} alt="Logo" className="crud-logo" /></td>
        <td>{negocio.nombredueno}</td>
        <td>{negocio.nombreempresa}</td>
        <td>{negocio.telefono}</td>
        <td>
          {!negocio.estado ? (
            <span className="estado-icon">
              <FaEye style={{ color: 'green' }} title="Activo" />
            </span>
          ) : (
            <span className="estado-icon">
              <FaEyeSlash style={{ color: 'red' }} title="Desactivado" />
            </span>
          )}
        </td>
        <td>
          <button className="crud-action-btn" onClick={() => openEditModal(negocio)}>
            <FaEdit />
          </button>
          <button className="crud-action-btn" onClick={() => toggleEstadoNegocio(negocio.id, negocio.estado)}>
            {!negocio.estado ? (
              <FaEyeSlash title="Desactivar" />
            ) : (
              <FaEye title="Activar" />
            )}
          </button>
          <button className="crud-action-btn" onClick={() => fetchProductos(negocio.id)}>
            <FaBox />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>



        {isEditModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Editar Negocio</h2>
      <input
        type="text"
        value={editNombreDueno}
        onChange={(e) => setEditNombreDueno(e.target.value)}
        placeholder="Nombre del dueño"
        className="crud-input"
      />
      <input
        type="text"
        value={editNombreEmpresa}
        onChange={(e) => setEditNombreEmpresa(e.target.value)}
        placeholder="Nombre de la empresa"
        className="crud-input"
      />
      <input
        type="text"
        value={editTelefono}
        onChange={(e) => setEditTelefono(e.target.value)}
        placeholder="Teléfono"
        className="crud-input"
      />
      <button onClick={updateNegocio} className="crud-btn-save">Guardar</button>
      <button onClick={() => setIsEditModalOpen(false)} className="crud-btn-cancel">Cancelar</button>
    </div>
  </div>
)}

{isProductContainerOpen && (
  <div className="product-container">
    <h2>Productos del Negocio</h2>
    <button onClick={() => setIsProductContainerOpen(false)} className="crud-btn-cancel">Cerrar</button>
    <button onClick={() => setShowProductForm(!showProductForm)} className="crud-btn-create">
      {showProductForm ? 'Cancelar' : 'Agregar Nuevo Producto'}
    </button>
    
    {/* Formulario para agregar productos */}
    {showProductForm && (
      <div>
        <h3>Agregar nuevo producto:</h3>
        <input
          type="text"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          placeholder="Nombre del producto"
          className="crud-input"
        />
        <input
          type="number"
          value={newProductQuantity}
          onChange={(e) => setNewProductQuantity(Number(e.target.value))}
          placeholder="Cantidad"
          className="crud-input"
        />
        <input
          type="text"
          value={newProductCode}
          onChange={(e) => setNewProductCode(e.target.value)}
          placeholder="Código"
          className="crud-input"
        />
        <input
          type="number"
          value={newProductPrice}
          onChange={(e) => setNewProductPrice(Number(e.target.value))}
          placeholder="Precio"
          className="crud-input"
        />
        <input
          type="file"
          onChange={(e) => setNewProductImage(e.target.files[0])}
          className="crud-input"
        />
        <button onClick={createProduct} className="crud-btn-create">Agregar Producto</button>
      </div>
    )}

    {/* Tabla de productos */}
    <table className="product-table">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Cantidad</th>
          <th>Código</th>
          <th>Precio</th>
          <th>Fecha de Creación</th>
          <th>Vendido</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.length === 0 ? (
          <tr>
            <td colSpan="8" style={{ textAlign: 'center' }}>
              No hay productos disponibles.
            </td>
          </tr>
        ) : (
          productos.map((producto) => (
            <tr key={producto.id}>
              <td>
                <img 
                  src={producto.imageUrl} 
                  alt={producto.name} 
                  className="product-image"
                />
              </td>
              <td>{producto.name}</td>
              <td>{producto.quantity}</td>
              <td>{producto.code}</td>
              <td>{producto.price}</td>
              <td>{new Date(producto.createdat).toLocaleString()}</td>
              <td>{producto.sold ? 'Sí' : 'No'}</td>
              <td>
              <button
                  className="crud-action-btn"
                  onClick={() => openEditProductModal(producto)}
                >
                  <FaEdit />
                </button>

                <button 
                  className="crud-action-btn" 
                  onClick={() => deleteProduct(producto.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>

    {showEditProductModal && (
  <div className="modalEditProduct-overlay">
    <div className="modalEditProduct-content">
      <h2>Editar Producto</h2>
      <input
        type="text"
        value={editProductName}
        onChange={(e) => setEditProductName(e.target.value)}
        placeholder="Nombre del producto"
        className="crud-input"
      />
      <input
        type="number"
        value={editProductQuantity}
        onChange={(e) => setEditProductQuantity(Number(e.target.value))}
        placeholder="Cantidad"
        className="crud-input"
      />
      <input
        type="text"
        value={editProductCode}
        onChange={(e) => setEditProductCode(e.target.value)}
        placeholder="Código"
        className="crud-input"
      />
      <input
        type="number"
        value={editProductPrice}
        onChange={(e) => setEditProductPrice(Number(e.target.value))}
        placeholder="Precio"
        className="crud-input"
      />
      <input
        type="file"
        onChange={(e) => setEditProductFile(e.target.files[0])}
        className="crud-input"
      />
      <button onClick={updateProduct} className="crud-btn-save">
        Guardar
      </button>
      <button onClick={() => setShowEditProductModal(false)} className="crud-btn-cancel">
        Cerrar
      </button>
    </div>
  </div>
)}


    


  </div>
)}




<div className="carousel-form-container">
  <h3>Gestión del Carrusel</h3>

  {/* Botón para abrir el modal */}
  <div className="input-container">
    <span className="input-icon" onClick={showImageModal}>
      <i className="fas fa-image"></i>
    </span>
  </div>

  {/* Input para seleccionar una imagen */}
  <input
    type="file"
    accept="image/*"
    className="crud-input"
    onChange={(e) => setNewCarouselImage(e.target.files[0])}
  />

  {/* Botón para agregar la imagen al carrusel */}
  <button className="crud-btn" onClick={uploadCarouselImage}>
    Agregar al carrusel
  </button>

  {/* Lista de imágenes cargadas al carrusel */}
  <div className="carousel-image-list">
    {carouselImages.map((image, index) => (
      <div key={index} className="carousel-item">
        <img
          src={image.carouselImg}
          alt={`Carousel Image ${index + 1}`}
          className="carousel-image"
          style={{ width: "100px", height: "100px" }}
        />
        <div className="carousel-info">
          <p>Posición: {image.posicion}</p>
          <p>Mensaje: {image.mensaje}</p>
        </div>
      </div>
    ))}
  </div>

  {isModalVisible && (
  <div
    className={`modal-overlay ${isModalVisible ? 'visible' : ''}`}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente oscuro
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}
  >
    <div
      className="modal-content"
      style={{
        backgroundColor: 'rgba(50, 50, 50, 0.9)', // Fondo gris oscuro
        color: 'white', // Texto blanco
        borderRadius: '10px', // Bordes redondeados
        padding: '20px', // Espaciado interior
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', // Sombra
        maxWidth: '600px', // Ancho máximo del modal
        width: '90%', // Adaptación a pantallas pequeñas
        overflow: 'hidden',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Imágenes del Carrusel</h2>
      <table
        className="image-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid white', padding: '10px' }}>Imagen</th>
            <th style={{ borderBottom: '1px solid white', padding: '10px' }}>Posición</th>
            <th style={{ borderBottom: '1px solid white', padding: '10px' }}>Mensaje</th>
            <th style={{ borderBottom: '1px solid white', padding: '10px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {carouselImages.map((image, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <img
                  src={image.carouselimg}
                  alt={`Image ${index + 1}`}
                  style={{ width: '100px', height: '100px', borderRadius: '5px' }}
                />
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{image.posicion}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{image.mensaje}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button
                  className="crud-btn delete-btn"
                  onClick={() => deleteCarouselImage(image.id)}
                  style={{
                    backgroundColor: '#d9534f', // Rojo para eliminar
                    color: 'white',
                    padding: '5px 10px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="crud-btn"
        onClick={closeImageModal}
        style={{
          display: 'block',
          margin: '0 auto',
          backgroundColor: '#5bc0de', // Azul claro para cerrar
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Cerrar
      </button>
    </div>
  </div>
)}


</div>




      </div>
    </div>
  );
}



export default CRUD;
