import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importamos el plugin de autoTable
import '../styles/ventas.css';  // Importa el archivo de estilos

const Ventas = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        // Obtiene la lista de negocios
        const { data: negocios, error: negociosError } = await supabase
          .from('negocios')
          .select('id, nombreempresa, logo');
        if (negociosError) throw negociosError;

        // Obtiene todas las órdenes
        const { data: orders, error: ordersError } = await supabase.from('orders').select('items, created_at');
        if (ordersError) throw ordersError;

        // Obtiene todos los productos
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, negocioId, name, price'); // Usando negocioId con "I" mayúscula
        if (productsError) throw productsError;

        // Crear un objeto para agrupar las ventas por negocio
        const salesData = negocios.map((negocio) => {
          const negocioProducts = products.filter((product) => product.negocioId === negocio.id);

          // Crear un arreglo para almacenar los productos vendidos
          let vendidos = [];

          // Recorremos las órdenes y extraemos los productos vendidos para este negocio
          orders.forEach((order) => {
            // Filtramos las órdenes por las fechas si están seleccionadas
            const orderDate = new Date(order.created_at);
            if (
              (startDate && orderDate < new Date(startDate)) || 
              (endDate && orderDate > new Date(endDate))
            ) {
              return; // Si no está en el rango de fechas, ignoramos la orden
            }

            order.items.forEach((productId) => {
              // Verificar si el producto está en el negocio actual
              const product = products.find((p) => p.id === productId);
              if (product && product.negocioId === negocio.id) {
                vendidos.push({ ...product, created_at: order.created_at });
              }
            });
          });
          const totalVentas = vendidos.reduce((acc, product) => acc + product.price, 0);

          return {
            id: negocio.id,
            nombreempresa: negocio.nombreempresa,
            logo: negocio.logo,
            vendidos,
            totalVentas, // Aquí guardamos el arreglo de productos vendidos
          };
        });

        setBusinesses(salesData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
  }, [startDate, endDate]); // Dependencias para volver a obtener los datos cuando cambian las fechas

  // Función para generar el PDF de un negocio
  const generateBusinessPDF = (business) => {
    const doc = new jsPDF();
    const { nombreempresa, logo, vendidos } = business;

    // Título del PDF
    doc.setFontSize(18);
    doc.text(`Reporte de Ventas - ${nombreempresa}`, 10, 10);

    // Logo
    if (logo) {
      doc.addImage(logo, 'PNG', 10, 15, 30, 30);
    }

    let yPosition = 50;

    // Título de la tabla
    doc.setFontSize(14);
    doc.text("Productos Vendidos", 10, yPosition);
    yPosition += 10;

    // Definir las columnas de la tabla
    const columns = ["Producto", "Precio", "Fecha"];
    const rows = vendidos.map((product) => [
      product.name, // Nombre del producto
      `$${product.price}`, // Precio del producto
      new Date(product.created_at).toLocaleDateString(), // Fecha de la venta
    ]);

    // Crear la tabla con autoTable
    doc.autoTable({
      startY: yPosition,
      head: [columns],
      body: rows,
      theme: 'grid', // Estilo de la tabla
      margin: { top: 20, left: 10, right: 10 }, // Margen de la tabla
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' } },
      styles: { fontSize: 12, cellPadding: 4 }, // Estilos de las celdas
    });

    // Obtener la posición después de la tabla
    yPosition = doc.lastAutoTable.finalY + 10;

    // Total de ventas del negocio
    const total = vendidos.reduce((acc, product) => acc + product.price, 0);
    doc.text(`Total Ventas: $${total.toFixed(2)}`, 10, yPosition);
    yPosition += 20;

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(10, yPosition, 200, yPosition);

    // Guardar el archivo PDF
    doc.save(`reporte_ventas_${nombreempresa}.pdf`);
  };

  // Función para generar el PDF con todos los negocios
  const generateAllBusinessesPDF = () => {
    const doc = new jsPDF();
    let yPosition = 10;
    let totalGeneral = 0;

    businesses.forEach((business, index) => {
      const { nombreempresa, logo, vendidos } = business;

      // Título del PDF
      doc.setFontSize(18);
      doc.text(`Reporte de Ventas - ${nombreempresa}`, 10, yPosition);

      // Logo - Eliminar el logo para el reporte de todos los negocios
      yPosition += 10;

      // Título de la tabla
      doc.setFontSize(14);
      doc.text("Productos Vendidos", 10, yPosition);
      yPosition += 10;

      // Definir las columnas de la tabla
      const columns = ["Producto", "Precio", "Fecha"];
      const rows = vendidos.map((product) => [
        product.name, // Nombre del producto
        `$${product.price}`, // Precio del producto
        new Date(product.created_at).toLocaleDateString(), // Fecha de la venta
      ]);

      // Crear la tabla con autoTable
      doc.autoTable({
        startY: yPosition,
        head: [columns],
        body: rows,
        theme: 'grid', // Estilo de la tabla
        margin: { top: 20, left: 10, right: 10 }, // Margen de la tabla
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' } },
        styles: { fontSize: 12, cellPadding: 4 }, // Estilos de las celdas
      });

      // Obtener la posición después de la tabla
      yPosition = doc.lastAutoTable.finalY + 10;

      // Total de ventas del negocio
      const totalNegocio = vendidos.reduce((acc, product) => acc + product.price, 0);
      doc.text(`Total Ventas de ${nombreempresa}: $${totalNegocio.toFixed(2)}`, 10, yPosition);
      yPosition += 20;

      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.line(10, yPosition, 200, yPosition);
      yPosition += 10;

      totalGeneral += totalNegocio;

      // Si hemos alcanzado el final de la página, crea una nueva
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 10;
      }
    });

    // Total general
    doc.setFontSize(14);
    doc.text(`Total General: $${totalGeneral.toFixed(2)}`, 10, yPosition);
    doc.save('reporte_ventas_todos_los_negocios.pdf');
  };

  return (
    <div className="sales-container">
      <div className="filter-container">
        <h2>Filtrar Ventas por Fecha</h2>
        <label>Desde: </label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <label>Hasta: </label>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />
        <button onClick={generateAllBusinessesPDF}>Generar PDF de todos los negocios</button>
      </div>

      {businesses.map((business) => (
        <div 
          className="business-card" 
          key={business.id}
          onClick={() => generateBusinessPDF(business)}
        >
          <img src={business.logo} alt={`${business.nombreempresa} logo`} />
          <h3>{business.nombreempresa}</h3>
          <p>Total Ventas: ${business.totalVentas.toFixed(2)}</p>
          <button>Generar PDF</button>
        </div>
      ))}
    </div>
  );
};

export default Ventas;
