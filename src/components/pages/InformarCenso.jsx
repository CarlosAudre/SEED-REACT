import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { FaSchool, FaCalendarAlt, FaSave, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './InformarCenso.module.css';

function InformarCenso() {
  const [estruturas, setEstruturas] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm();
  
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // 1. Carregar Listas Iniciais
  useEffect(() => {
    const carregarListas = async () => {
      try {
        const [resEstruturas, resCompetencias] = await Promise.all([
          axios.get('https://ssge.onrender.com/api/estruturas', makeConfig()),
          axios.get('https://ssge.onrender.com/api/competencias', makeConfig())
        ]);
        setEstruturas(resEstruturas.data);
        setCompetencias(resCompetencias.data);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar dados iniciais.');
      }
    };
    carregarListas();
  }, []);

  // 2. Monitorar Seleção para Buscar Dado Existente
  const estruturaId = watch('estruturaId');
  const competenciaId = watch('competenciaId');

  useEffect(() => {
    const buscarCensoExistente = async () => {
      if (estruturaId && competenciaId) {
        setLoadingData(true);
        try {
          const res = await axios.get(
            `https://ssge.onrender.com/api/censo/${estruturaId}/${competenciaId}`, 
            makeConfig()
          );
          // Se retornar número, preenche. Se null, limpa.
          setValue('quantidadeAlunos', res.data !== null ? res.data : '');
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingData(false);
        }
      }
    };
    buscarCensoExistente();
  }, [estruturaId, competenciaId, setValue]);

  // 3. Salvar
  const onSubmit = async (data) => {
    const payload = {
        estruturaId: parseInt(data.estruturaId),
        competenciaId: parseInt(data.competenciaId),
        quantidadeAlunos: parseInt(data.quantidadeAlunos)
    };

    try {
        await axios.post('https://ssge.onrender.com/api/censo', payload, makeConfig());
        toast.success('Censo salvo com sucesso!');
    } catch (error) {
        toast.error('Erro ao salvar o censo.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerTop}>
        <Link to="/" className={styles.linkVoltar}><FaArrowLeft /> Voltar</Link>
      </div>

      <h3 className={styles.titulo}>
        <FaUsers className={styles.icone} /> Censo Escolar
      </h3>
      <p className={styles.descricao}>
        Informe a quantidade de alunos matriculados para o cálculo de indicadores.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formCard}>
        
        <div className={styles.gridInputs}>
            <div className={styles.formGroup}>
                <label><FaSchool /> Unidade Escolar</label>
                <select {...register('estruturaId', { required: true })}>
                    <option value="">Selecione a escola...</option>
                    {estruturas.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label><FaCalendarAlt /> Mês de Referência</label>
                <select {...register('competenciaId', { required: true })}>
                    <option value="">Selecione a competência...</option>
                    {competencias.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className={styles.qtdContainer}>
            <label>Quantidade Total de Alunos</label>
            <input 
                type="number" 
                className={styles.inputQtd}
                placeholder={loadingData ? "..." : "0"}
                disabled={!estruturaId || !competenciaId || loadingData}
                {...register('quantidadeAlunos', { required: true, min: 0 })}
            />
        </div>

        <button type="submit" className={styles.botaoSalvar}>
            <FaSave /> Salvar Informações
        </button>

      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default InformarCenso;