import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import '../editarlinhas/editarlimites.css';

const categorias = ['temperatura', 'densidade', 'espessura', 'secagem'];

function EditarLimites({ onClose }) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('temperatura');
  const [limites, setLimites] = useState({ vermelho: 0, amarelo: 0, verde: 0 });

  useEffect(() => {
    const fetchLimites = async () => {
      const docRef = doc(db, "limites", categoriaSelecionada);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setLimites(snapshot.data());
      } else {
        setLimites({ vermelho: 0, amarelo: 0, verde: 0 });
      }
    };
    fetchLimites();
  }, [categoriaSelecionada]);

  const salvarLimites = async () => {
    const docRef = doc(db, "limites", categoriaSelecionada);
    await setDoc(docRef, limites);
    alert(`Limites da categoria ${categoriaSelecionada} atualizados!`);
  };

  return (
    <div className="editar-limites-container" style={{ position: 'relative' }}>
      {}
      <button 
        className="btn-sair-icon" 
        onClick={onClose} 
        aria-label="Fechar"
        title="Fechar"
      >
        &times;
      </button>

      <h2>Editar Limites</h2>

      <select
        value={categoriaSelecionada}
        onChange={e => setCategoriaSelecionada(e.target.value)}
      >
        {categorias.map(cat => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      <div>
        <label>
          Linha Vermelha:
          <input
            type="number"
            value={limites.vermelho || ''}
            onChange={e => setLimites({ ...limites, vermelho: +e.target.value })}
          />
        </label>

        <label>
          Linha Amarela:
          <input
            type="number"
            value={limites.amarelo || ''}
            onChange={e => setLimites({ ...limites, amarelo: +e.target.value })}
          />
        </label>

        <label>
          Linha Verde:
          <input
            type="number"
            value={limites.verde || ''}
            onChange={e => setLimites({ ...limites, verde: +e.target.value })}
          />
        </label>
      </div>

      <button onClick={salvarLimites}>Guardar Limites</button>
    </div>
  );
}

export default EditarLimites;
