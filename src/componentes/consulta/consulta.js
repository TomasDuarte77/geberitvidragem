import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import './consulta.css';

function Consulta() {
  const [medicoes, setMedicoes] = useState([]);
  const [colecaoSelecionada, setColecaoSelecionada] = useState('medicoes');
  const [editandoId, setEditandoId] = useState(null); 
  const [valorEditado, setValorEditado] = useState(''); 

  useEffect(() => {
    const fetchMedicoes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, colecaoSelecionada));
        const dados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const dadosOrdenados = dados.sort((a, b) => {
          const [diaA, mesA, anoA] = a.data.split('/');
          const [diaB, mesB, anoB] = b.data.split('/');
          const dataA = new Date(`${anoA}-${mesA}-${diaA}`);
          const dataB = new Date(`${anoB}-${mesB}-${diaB}`);
          return dataB - dataA;
        });

        setMedicoes(dadosOrdenados);
      } catch (error) {
        console.error("Erro ao buscar medições:", error);
        setMedicoes([]);
      }
    };

    fetchMedicoes();
  }, [colecaoSelecionada]);

  const iniciarEdicao = (id, valorAtual) => {
    setEditandoId(id);
    setValorEditado(valorAtual);
  };

  const salvarEdicao = async (id) => {
    try {
      const docRef = doc(db, colecaoSelecionada, id);
      await updateDoc(docRef, { valor: valorEditado });

      setMedicoes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, valor: valorEditado } : item
        )
      );
      setEditandoId(null);
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      alert('Erro ao salvar alteração. Tenta novamente.');
    }
  };

  const apagarMedicao = async (id) => {
    const confirmar = window.confirm("Tens a certeza que queres apagar esta medição?");
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, colecaoSelecionada, id));
      setMedicoes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao apagar medição:", error);
      alert('Erro ao apagar a medição. Tenta novamente.');
    }
  };

  const onKeyDownHandler = (e, id) => {
    if (e.key === 'Enter') {
      salvarEdicao(id);
    } else if (e.key === 'Escape') {
      setEditandoId(null);
    }
  };

  return (
    <div className="consulta-container">
      <h2 className="consulta-title">Consulta de Medições</h2>

      <div className="botoes-tipos">
        <button onClick={() => setColecaoSelecionada('medicoes')}>Temperatura</button>
        <button onClick={() => setColecaoSelecionada('medicoes_densidade')}>Densidade</button>
        <button onClick={() => setColecaoSelecionada('medicoes_espessura')}>Espessura</button>
        <button onClick={() => setColecaoSelecionada('medicoes_secagem')}>Secagem</button>
      </div>

      {medicoes.length === 0 ? (
        <p>Nenhuma medição encontrada.</p>
      ) : (
        <table className="tabela-medicoes">
          <thead>
            <tr>
              <th>Data</th>
              <th>Turno</th>
              <th>Tipo</th>
              <th>Célula</th>
              <th>Medição</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medicoes.map((item) => (
              <tr key={item.id}>
                <td>{item.data}</td>
                <td>{item.turno}</td>
                <td>{item.tipo}</td>
                <td>{item.celula}</td>
                <td>{item.medicao}</td>
                <td>
                  {editandoId === item.id ? (
                    <input
                      type="text"
                      value={valorEditado}
                      onChange={(e) => setValorEditado(e.target.value)}
                      onBlur={() => salvarEdicao(item.id)}
                      onKeyDown={(e) => onKeyDownHandler(e, item.id)}
                      autoFocus
                      style={{ width: '100px' }}
                    />
                  ) : (
                    <span
                      onClick={() => iniciarEdicao(item.id, item.valor)}
                      style={{ cursor: 'pointer', color: '#007bff' }}
                      title="Clique para editar"
                    >
                      {item.valor}
                    </span>
                  )}
                </td>
                <td>
                  <div className="apagar">
                  <button onClick={() => apagarMedicao(item.id)} style={{ color: 'white' }}>
                    Apagar
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Consulta;
