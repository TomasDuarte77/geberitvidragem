
import React, { useState, useEffect } from 'react';
import '../../App.css';
import { db } from '../../firebase.js';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import GraficoEspessura from './graficoespessura.js';

function Espessura() {
  const [form, setForm] = useState({
    turno: '',
    data: '',
    tipo: '',
    celula: '',
    medicao: '',
    valor: ''
  });

  const [dataGrafico, setDataGrafico] = useState('');
  const [dadosProcessados, setDadosProcessados] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const obterMedicoesPorData = async (dataStr) => {
    const q = query(collection(db, "medicoes_espessura"), where("data", "==", dataStr));
    const snapshot = await getDocs(q);
    const dados = snapshot.docs.map(doc => doc.data());

    const resultado = { A: { '1': [], '2': [] }, B: { '1': [], '2': [] }, C: { '1': [], '2': [] } };

    dados.forEach(item => {
      const turno = item.turno.toUpperCase();
      const medicao = item.medicao.includes("1") ? '1' : '2';
      const valor = parseFloat(item.valor);
      if (resultado[turno]) resultado[turno][medicao].push(valor);
    });

    const calcularMedia = (lista) => lista.length > 0 ? lista.reduce((a, b) => a + b, 0) / lista.length : null;

    const chartData = [];
    ['A', 'B', 'C'].forEach(turno => {
      const media1 = calcularMedia(resultado[turno]['1']);
      const media2 = calcularMedia(resultado[turno]['2']);
      const geral = calcularMedia([...resultado[turno]['1'], ...resultado[turno]['2']]);

      chartData.push({ nome: `Turno ${turno} - Medição 1`, valor: media1 !== null ? +media1.toFixed(2) : null });
      chartData.push({ nome: `Turno ${turno} - Medição 2`, valor: media2 !== null ? +media2.toFixed(2) : null });
      chartData.push({ nome: `Turno ${turno} - Geral`, valor: geral !== null ? +geral.toFixed(2) : null });
    });

    const todas1 = [...resultado['A']['1'], ...resultado['B']['1'], ...resultado['C']['1']];
    const todas2 = [...resultado['A']['2'], ...resultado['B']['2'], ...resultado['C']['2']];
    const todasGeral = [...todas1, ...todas2];

    chartData.push({ nome: `Geral - Medição 1`, valor: calcularMedia(todas1)?.toFixed(2) });
    chartData.push({ nome: `Geral - Medição 2`, valor: calcularMedia(todas2)?.toFixed(2) });
    chartData.push({ nome: `Geral - Total`, valor: calcularMedia(todasGeral)?.toFixed(2) });

    setDadosProcessados(chartData.map(d => ({ nome: d.nome, valor: d.valor !== null ? +d.valor : null })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { turno, data, tipo, celula, medicao, valor } = form;
    if (!turno || !data || !tipo || !celula || !medicao || !valor) {
      alert('Preenche todos os campos antes de salvar.');
      return;
    }

    try {
      const q = query(
        collection(db, "medicoes_espessura"),
        where("turno", "==", turno),
        where("data", "==", data),
        where("tipo", "==", tipo),
        where("celula", "==", celula),
        where("medicao", "==", medicao)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert("Já existe uma medição para esta combinação.");
        return;
      }

      await addDoc(collection(db, "medicoes_espessura"), {
        ...form,
        valor: Number(valor),
        timestamp: Timestamp.now()
      });

      alert("Dados guardados com sucesso!");
      

      if (data === dataGrafico) {
        obterMedicoesPorData(dataGrafico);
      }
    } catch (error) {
      console.error("Erro ao guardar:", error);
    }
  };

  const celulaOptions =
    form.tipo === 'Célula' ? ['1', '2'] :
    form.tipo === 'Cabine' ? ['2', '4','5'] : [];

  useEffect(() => {
    if (dataGrafico) {
      obterMedicoesPorData(dataGrafico);
    } else {
      setDadosProcessados([]);
    }
  }, [dataGrafico]);

  return (
    <div className="container">
      <h1 className="header">Registrar Medição Espessura</h1>

      <form className="form-section" onSubmit={handleSubmit}>
        {['turno', 'data', 'tipo', 'celula', 'medicao', 'valor'].map((campo) => (
          <div className="form-item" key={campo}>
            <label>{campo[0].toUpperCase() + campo.slice(1)}:</label>
            {campo === 'data' || campo === 'valor' ? (
              <input
                type={campo === 'valor' ? 'number' : 'date'}
                name={campo}
                className="input"
                value={form[campo]}
                onChange={handleChange}
              />
            ) : (
              <select
                name={campo}
                className="select"
                value={form[campo]}
                onChange={handleChange}
              >
                <option value="">Selecionar</option>
                {campo === 'turno' && ['A', 'B', 'C'].map(op => <option key={op}>{op}</option>)}
                {campo === 'tipo' && ['Célula', 'Cabine'].map(op => <option key={op}>{op}</option>)}
                {campo === 'celula' && celulaOptions.map(op => <option key={op}>{op}</option>)}
                {campo === 'medicao' && ['Medição 1', 'Medição 2'].map(op => <option key={op}>{op}</option>)}
              </select>
            )}
          </div>
        ))}
        <button type="submit" className="button salvar">Salvar</button>
      </form>

      <GraficoEspessura
        dadosProcessados={dadosProcessados}
        dataGrafico={dataGrafico}
        setDataGrafico={setDataGrafico}
        fullscreen={fullscreen}
        setFullscreen={setFullscreen}
      />
    </div>
  );
}

export default Espessura;
