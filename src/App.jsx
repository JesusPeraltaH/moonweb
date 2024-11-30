import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { supabase } from './supabase/supabase';
import './App.css';  // Asegúrate de importar el CartProvider
import Home from './pages/home';  // Importa el componente Home
import Login from './pages/login';  // Importa el componente Login
import CRUD from './pages/crud';  // Importa el componente CRUD
import Ventas from './pages/ventas';  // Importa el componente Ventas
import Ingresos from './pages/ingresos';  // Importa el componente Ingresos
import Pedidos from './pages/pedidos';  // Importa el componente Pedidos
import SidebarLayout from './components/sidebarlayout'; 
import ProductsByBusiness from './components/ProductsByCategory';
import { CartProvider } from './components/CartContext'; // Importa el SidebarLayout

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error obteniendo sesión:', error);
      } else {
        setSession(data.session);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
   <CartProvider>
    
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Home />  } />
        <Route path="/login" element={session ? <Navigate to="/crud" /> : <Login onLogin={setSession} />} />

        {/* Rutas protegidas con el CartProvider y la barra lateral */}
        <Route path="/" element={session ? <SidebarLayout /> : <Navigate to="/login" />}>
          <Route path="/crud" element={<CRUD />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/pedidos" element={<Pedidos />} />
        </Route>
      </Routes>
    </Router>
    <ProductsByBusiness/>
    </CartProvider>
    
  );
}

export default App;
