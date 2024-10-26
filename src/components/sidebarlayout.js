import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './sidebarlayout.css'; // Estilos para el layout
import { supabase } from '../supabase/supabase'; // Importar el cliente de Supabase

function SidebarLayout() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    } else {
      // Redirigir o realizar alguna acción después de cerrar sesión
      console.log('Sesión cerrada con éxito');
    }
  };

  return (
    <div className="layout-container">
      {/* Barra lateral */}
      <aside className="sidebar">
        <nav>
          <ul>
            <li><Link to="/ventas">Ventas</Link></li>
            <li><Link to="/ingresos">Ingresos</Link></li>
            <li><Link to="/pedidos">Pedidos</Link></li>
            <li><Link to="/crud">CRUD</Link></li>
            <li><button className='logout-button' onClick={handleLogout}>Cerrar sesión</button></li> {/* Botón de cerrar sesión */}
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="main-content">
        <Outlet /> {/* Aquí se renderizarán las rutas hijas dinámicamente */}
      </div>
    </div>
  );
}

export default SidebarLayout;
