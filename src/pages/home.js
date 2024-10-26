import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import '../styles/home.css'; // Importa el archivo CSS

function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      alert(`Error al obtener items: ${error.message}`);
    } else {
      setItems(data);
    }
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

      <div className="container">
        {/* Carrusel */}
        <div id="carouselExample" className="carousel slide" data-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/assets/images1.jpg" className="d-block w-100" alt="Imagen 1" />
              <div className="carousel-caption d-none d-md-block">
                <h5>Frases Elegantes</h5>
              </div>
            </div>
            <div className="carousel-item">
              <img src="/assets/images2.jpg" className="d-block w-100" alt="Imagen 2" />
              <div className="carousel-caption d-none d-md-block">
                <h5>Frases Elegantes</h5>
              </div>
            </div>
            <div className="carousel-item">
              <img src="/assets/images3.jpg" className="d-block w-100" alt="Imagen 3" />
              <div className="carousel-caption d-none d-md-block">
                <h5>Frases Elegantes</h5>
              </div>
            </div>
          </div>
          <a className="carousel-control-prev" href="#carouselExample" role="button" data-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="sr-only">Previous</span>
          </a>
          <a className="carousel-control-next" href="#carouselExample" role="button" data-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="sr-only">Next</span>
          </a>
        </div>
    </div>

      <div className="container">
        {/* Grid de tarjetas */}
        <div className="grid-container">
          {items.map((item) => (
            <div className="card" key={item.id}>
              <img src={`/assets/images${item.id % 3 + 1}.jpg`} alt={`Imagen de ${item.name}`} className="card-img" />
              <div className="card-overlay">
                <h5>{item.name}</h5>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
