import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase'; // Asegúrate de que esta importación sea correcta

function SearchBarWithDropdown({ onProductSelect, onBusinessSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);

  useEffect(() => {
    // Fetch productos y negocios
    const fetchData = async () => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, negocioId');
    
      if (productsError) {
        console.error(productsError);
        setAllProducts([]); // Asegúrate de establecer un arreglo vacío en caso de error
      } else {
        setAllProducts(products || []); // Asegúrate de que no sea null
      }
    
      const { data: businesses, error: businessesError } = await supabase
        .from('negocios')
        .select('id, nombreempresa');
    
      if (businessesError) {
        console.error(businessesError);
        setAllBusinesses([]); // Asegúrate de establecer un arreglo vacío en caso de error
      } else {
        setAllBusinesses(businesses || []); // Asegúrate de que no sea null
      }
    };
    

    fetchData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);
  
    if (!term) {
      setFilteredItems([]);
      return;
    }
  
    // Buscar coincidencias en negocios
    const businessResults =
      allBusinesses?.filter((business) =>
        business.nombreempresa.toLowerCase().includes(term.toLowerCase())
      ) || [];
  
    // Buscar coincidencias en productos
    const productResults =
      allProducts?.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      ) || [];
  
    // Combinar ambos resultados
    const combinedResults = [
      ...businessResults.map((business) => ({ ...business, type: 'business' })),
      ...productResults.map((product) => ({ ...product, type: 'product' })),
    ];
  
    setFilteredItems(combinedResults);
  };
  

  const handleBusinessSelect = (business) => {
    // Filtrar productos relacionados con el negocio seleccionado
    const productsOfBusiness = allProducts.filter(
      (product) => product.negocioid === business.id
    );
    onBusinessSelect(business, productsOfBusiness);
    setSearchTerm(''); // Limpiar la barra de búsqueda
  };

  return (
    <div className="search-bar-dropdown">
      <input
        type="text"
        placeholder="Buscar por negocio o producto..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      
      {searchTerm && filteredItems.length > 0 && (
  <div className="dropdown-results">
    {filteredItems.map((item) => (
      <div
        key={item.id}
        className="dropdown-item"
        onClick={() =>
          item.type === 'business'
            ? handleBusinessSelect(item) 
            : onProductSelect(item) 
        }
      >
        {item.type === 'business'
          ? `Negocio: ${item.nombreempresa}`
          : `Producto: ${item.name}`} 
      </div>
    ))}
  </div>
)}


    </div>
  );
}

export default SearchBarWithDropdown;
