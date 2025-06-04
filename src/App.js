import React, { useState } from 'react';
import Temperatura from '../src/componentes/temperatura/temperatura.js';
import Densidade from '../src/componentes/densidade/densidade.js';
import Espessura from '../src/componentes/espessura/espessura.js';
import Secagem from '../src/componentes/secagem/secagem.js';
import Geral from '../src/componentes/geral/geral.js';
import Consulta from '../src/componentes/consulta/consulta.js';
import EditarLimites from '../src/componentes/editarlinhas/editarlimites.js';

function App() {
  const [viewSelected, setViewSelected] = useState('temperatura');
  const [editarLimitesOpen, setEditarLimitesOpen] = useState(false);
  const [tipoLimites, setTipoLimites] = useState('temperatura');

  const tabs = [
    { id: 'temperatura', label: 'Temperatura' },
    { id: 'densidade', label: 'Densidade' },
    { id: 'espessura', label: 'Espessura' },
    { id: 'secagem', label: 'Secagem' },
    { id: 'geral', label: 'Geral' },
    { id: 'consulta', label: 'Consulta' },
  ];

  const renderSection = () => {
    switch (viewSelected) {
      case 'temperatura':
        return <Temperatura />;
      case 'densidade':
        return <Densidade />;
      case 'espessura':
        return <Espessura />;
      case 'secagem':
        return <Secagem />;
        case 'geral':
        return <Geral />;
      case 'consulta':
        return <Consulta />;
      default:
        return <Temperatura />;
    }
  };

  const abrirEditorLimites = () => {
    setTipoLimites(viewSelected);
    setEditarLimitesOpen(true);
  };

  return (
    <div className="container">
      <nav
        className="topmenu"
        role="tablist"
        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${viewSelected === tab.id ? 'active' : ''}`}
            onClick={() => setViewSelected(tab.id)}
            aria-selected={viewSelected === tab.id}
            role="tab"
            tabIndex={viewSelected === tab.id ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}

        {}
        {['temperatura', 'densidade', 'espessura', 'secagem'].includes(viewSelected) && (
          <button
            className="tab-button"
            onClick={abrirEditorLimites}
            style={{ marginLeft: 'auto' }}
          >
            Editar Limites
          </button>
        )}
      </nav>

      <section role="tabpanel">{renderSection()}</section>

      {editarLimitesOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#222',
              padding: '20px',
              borderRadius: '8px',
              minWidth: '300px',
              color: 'white',
            }}
          >
            <EditarLimites tipo={tipoLimites} onClose={() => setEditarLimitesOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
