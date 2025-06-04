import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase.js";

async function obterMedicoesGenericoPorData(dataStr, colecao) {
  if (!dataStr) return [];

  const q = query(collection(db, colecao), where("data", "==", dataStr));
  const snapshot = await getDocs(q);
  const dados = snapshot.docs.map(doc => doc.data());

  const resultado = { A: { '1': [], '2': [] }, B: { '1': [], '2': [] }, C: { '1': [], '2': [] } };

  dados.forEach(item => {
    const turno = item.turno?.toUpperCase();
    const medicao = item.medicao?.includes("1") ? '1' : '2';
    const valor = parseFloat(item.valor);
    if (resultado[turno]) resultado[turno][medicao].push(valor);
  });

  const calcularMedia = (lista) => lista.length > 0
    ? lista.reduce((a, b) => a + b, 0) / lista.length
    : null;

  const chartData = [];

  ['A', 'B', 'C'].forEach(turno => {
    const media1 = calcularMedia(resultado[turno]['1']);
    const media2 = calcularMedia(resultado[turno]['2']);
    const geral = calcularMedia([...resultado[turno]['1'], ...resultado[turno]['2']]);
    chartData.push({ nome: `Turno ${turno} - Medição 1`, valor: media1 });
    chartData.push({ nome: `Turno ${turno} - Medição 2`, valor: media2 });
    chartData.push({ nome: `Turno ${turno} - Geral`, valor: geral });
  });

  const todas1 = ['A', 'B', 'C'].flatMap(t => resultado[t]['1']);
  const todas2 = ['A', 'B', 'C'].flatMap(t => resultado[t]['2']);
  const todasGeral = [...todas1, ...todas2];

  chartData.push({ nome: `Geral - Medição 1`, valor: calcularMedia(todas1) });
  chartData.push({ nome: `Geral - Medição 2`, valor: calcularMedia(todas2) });
  chartData.push({ nome: `Geral - Total`, valor: calcularMedia(todasGeral) });

  return chartData;
}

export async function obterMedicoesEspessuraPorData(dataStr) {
  return obterMedicoesGenericoPorData(dataStr, "medicoes_espessura");
}

export async function obterMedicoesTemperaturaPorData(dataStr) {
  return obterMedicoesGenericoPorData(dataStr, "medicoes");
}

export async function obterMedicoesDensidadePorData(dataStr) {
  return obterMedicoesGenericoPorData(dataStr, "medicoes_densidade");
}

export async function obterMedicoesSecagemPorData(dataStr) {
  return obterMedicoesGenericoPorData(dataStr, "medicoes_secagem");
}
