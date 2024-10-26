import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import { FaTrash, FaEdit } from 'react-icons/fa';
import '../styles/crud.css';

function CRUD() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');

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

  async function createItem() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('items')
      .insert([{ name: newItemName, createdAt: now }])
      .select();

    if (error) {
      alert(`Error al crear item: ${error.message}`);
    } else {
      setItems([data[0], ...items]);
      setNewItemName('');
    }
  }

  async function deleteItem(id) {
    const { error } = await supabase
      .from('items')
      .delete()
      .match({ id });

    if (error) {
      alert(`Error al eliminar item: ${error.message}`);
    } else {
      setItems(items.filter(item => item.id !== id));
    }
  }

  function openEditModal(item) {
    setSelectedItem(item);
    setEditItemName(item.name);
    setIsEditModalOpen(true);
  }

  async function updateItem() {
    const { error } = await supabase
      .from('items')
      .update({ name: editItemName })
      .match({ id: selectedItem.id });

    if (error) {
      alert(`Error al actualizar item: ${error.message}`);
    } else {
      setItems(items.map(item => (item.id === selectedItem.id ? { ...item, name: editItemName } : item)));
      setIsEditModalOpen(false);
    }
  }

  return (
    <div className="page-container">
      <div className="crud-container">
       
        <div className="crud-form">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Nombre del nuevo item"
            className="crud-input"
          />
          <button onClick={createItem} className="crud-btn-create">Crear Nuevo</button>
        </div>

        <div className="crud-table-container">
          <table className="crud-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="crud-action-btn" onClick={() => openEditModal(item)}>
                      <FaEdit />
                    </button>
                    <button className="crud-action-btn" onClick={() => deleteItem(item.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Item</h2>
            <input
              type="text"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              className="crud-input"
            />
            <button onClick={updateItem} className="crud-btn-save">Guardar</button>
            <button onClick={() => setIsEditModalOpen(false)} className="crud-btn-cancel">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CRUD;
