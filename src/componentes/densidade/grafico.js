import React, { useRef, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import { Maximize, Minimize2 } from 'lucide-react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div style={{ backgroundColor: '#222', padding: 10, borderRadius: 4, color: '#fff' }}>
        <p>{label}</p>
        <p>{val !== null ? val : 'Sem dados'}</p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ x, y, width, value }) => {
  const centerX = x + width / 2;
  return (
    <text x={centerX} y={y - 10} fill="white" fontSize={12} textAnchor="middle">
      {value === null ? '0' : value.toFixed(1)}
    </text>
  );
};

function Grafico({
  dadosProcessados = [],
  dataGrafico,
  setDataGrafico,
  fullscreen,
  setFullscreen
}) {
  const graficoRef = useRef(null);
  const [limites, setLimites] = useState({ vermelho: 29, amarelo: 23, verde: 0 }); // Valores default iniciais

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && graficoRef.current) {
      graficoRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setFullscreen]);

  useEffect(() => {
    const docRef = doc(db, 'limites', 'densidade');

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setLimites(snapshot.data());
      } else {
        console.warn("Documento 'densidade' não encontrado em 'limites'.");
      }
    }, (error) => {
      console.error('Erro ao escutar limites em tempo real:', error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div ref={graficoRef} className={`chart-container ${fullscreen ? 'fullscreen' : ''}`}>
      {!fullscreen && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="subheader">Densidade</h2>
            <button
              onClick={toggleFullscreen}
              className="fullscreen-button"
            >
              <Maximize size={16} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <input
              type="date"
              value={dataGrafico}
              onChange={(e) => setDataGrafico(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 6,
                border: '1px solid #888',
                fontSize: 16
              }}
            />
          </div>
        </>
      )}

      {fullscreen && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 11000 }}>
          <button
            onClick={toggleFullscreen}
            className="fullscreen-button"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      )}

      {Array.isArray(dadosProcessados) && dadosProcessados.length > 0 && (
        <div style={{ width: '100%', height: fullscreen ? '100%' : 440 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosProcessados}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" interval={0} stroke="#ccc" />
              <YAxis domain={[limites.amarelo - 2, limites.vermelho + 2]} stroke="#ccc" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#fff', visibility: 'hidden' }} />
              <ReferenceLine y={limites.vermelho} stroke="red" strokeWidth={2} strokeDasharray="4 4" />
              <ReferenceLine y={limites.amarelo} stroke="gold" strokeWidth={2} strokeDasharray="4 4" />
              <ReferenceLine y={limites.verde} stroke="green" strokeWidth={2} strokeDasharray="4 4" />
              <Bar
                dataKey="valor"
                fill="#00bcd4"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                <LabelList content={CustomLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Grafico;
