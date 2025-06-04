import React, { useEffect, useState, useRef } from 'react';
import GraficoEspessura from '../espessura/graficoespessura.js';
import GraficoSecagem from '../secagem/graficosecagem.js'; 
import GraficoTemperatura from '../temperatura/graficotemperatura.js';
import GraficoDensidade from '../densidade/grafico';
import '../../App.css'
import {
  obterMedicoesTemperaturaPorData,
  obterMedicoesDensidadePorData,
  obterMedicoesEspessuraPorData,
  obterMedicoesSecagemPorData
} from '../../firebaseHelpers.js';

const ComponenteGeral = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [indexGrafico, setIndexGrafico] = useState(0);
  const wrapperRef = useRef(null);
  const [showScreenAtivo, setShowScreenAtivo] = useState(false);

  
  const [dataTemperatura, setDataTemperatura] = useState('');
  const [dadosTemperatura, setDadosTemperatura] = useState([]);

  const [dataDensidade, setDataDensidade] = useState('');
  const [dadosDensidade, setDadosDensidade] = useState([]);

  const [dataEspessura, setDataEspessura] = useState('');
  const [dadosEspessura, setDadosEspessura] = useState([]);

  const [dataSecagem, setDataSecagem] = useState('');
  const [dadosSecagem, setDadosSecagem] = useState([]);

  
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setFullscreen(isFs);
      if (!isFs) {
        setShowScreenAtivo(false);
        setIndexGrafico(0);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

 
  useEffect(() => {
    if (dataTemperatura) {
      obterMedicoesTemperaturaPorData(dataTemperatura).then(setDadosTemperatura);
    } else {
      setDadosTemperatura([]);
    }
  }, [dataTemperatura]);

  useEffect(() => {
    if (dataDensidade) {
      obterMedicoesDensidadePorData(dataDensidade).then(setDadosDensidade);
    } else {
      setDadosDensidade([]);
    }
  }, [dataDensidade]);

  useEffect(() => {
    if (dataEspessura) {
      obterMedicoesEspessuraPorData(dataEspessura).then(setDadosEspessura);
    } else {
      setDadosEspessura([]);
    }
  }, [dataEspessura]);

  useEffect(() => {
    if (dataSecagem) {
      obterMedicoesSecagemPorData(dataSecagem).then(setDadosSecagem);
    } else {
      setDadosSecagem([]);
    }
  }, [dataSecagem]);

 
  useEffect(() => {
    if (!showScreenAtivo) return;

    const hoje = new Date().toISOString().slice(0, 10);

    const atualizarDadosGrafico = (index) => {
      switch (index) {
        case 0:
          setDataSecagem(hoje);
          obterMedicoesSecagemPorData(hoje).then(setDadosSecagem);
          break;
        case 1:
          setDataEspessura(hoje);
          obterMedicoesEspessuraPorData(hoje).then(setDadosEspessura);
          break;
        case 2:
          setDataTemperatura(hoje);
          obterMedicoesTemperaturaPorData(hoje).then(setDadosTemperatura);
          break;
        case 3:
          setDataDensidade(hoje);
          obterMedicoesDensidadePorData(hoje).then(setDadosDensidade);
          break;
        default:
          break;
      }
    };

 
    wrapperRef.current?.requestFullscreen().catch(console.error);

   
    atualizarDadosGrafico(0);
    setIndexGrafico(0);

    const interval = setInterval(() => {
      setIndexGrafico(prev => {
        const proximo = (prev + 1) % 4;
        atualizarDadosGrafico(proximo);
        return proximo;
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, [showScreenAtivo]);

  const handleShowScreenClick = () => {
    setShowScreenAtivo(prev => !prev);
    if (showScreenAtivo) {
      setIndexGrafico(0);
    }
  };

  const graficos = [
    <GraficoSecagem
      key="secagem"
      dataGrafico={dataSecagem}
      setDataGrafico={setDataSecagem}
      dadosProcessados={dadosSecagem}
      fullscreen={fullscreen}
      setFullscreen={setFullscreen}
    />,
    <GraficoEspessura
      key="espessura"
      dataGrafico={dataEspessura}
      setDataGrafico={setDataEspessura}
      dadosProcessados={dadosEspessura}
      fullscreen={fullscreen}
      setFullscreen={setFullscreen}
    />,
    <GraficoTemperatura
      key="temperatura"
      dataGrafico={dataTemperatura}
      setDataGrafico={setDataTemperatura}
      dadosProcessados={dadosTemperatura}
      fullscreen={fullscreen}
      setFullscreen={setFullscreen}
    />,
    <GraficoDensidade
      key="densidade"
      dadosProcessados={dadosDensidade}
      dataGrafico={dataDensidade}
      setDataGrafico={setDataDensidade}
      fullscreen={fullscreen}
      setFullscreen={setFullscreen}
    />
  ];

  return (
    <div className="componente-geral-container">
      <h1 className="componente-geral-title">Gráfico Geral</h1>

      <button
        onClick={handleShowScreenClick}
        className="componente-geral-btn"
      >
        {showScreenAtivo ? 'Parar ShowScreen' : 'Iniciar ShowScreen'}
      </button>

      <div
        ref={wrapperRef}
        className={`componente-geral-wrapper ${fullscreen ? 'fullscreen' : ''}`}
      >
        {graficos[indexGrafico]}
      </div>
    </div>
  );
};

export default ComponenteGeral;
