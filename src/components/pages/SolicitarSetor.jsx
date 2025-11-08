import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaBuilding, FaBriefcase } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './SolicitarSetor.module.css'; // Novo CSS

function SolicitarSetor() {
  const [estruturas, setEstruturas] = useState([]);
  const [setores, setSetores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Busca as Estruturas (escolas) no carregamento
  useEffect(() => {
    const buscarEstruturas = async () => {
      try {
        const res = await axios.get('http://localhost:8081/api/estruturas', makeConfig());
        setEstruturas(res.data);
      } catch (error) {
        toast.error('Erro ao carregar a lista de escolas.');
      }
    };
    buscarEstruturas();
  }, [token]);

  // Observa a mudança no dropdown de Estrutura
  const estruturaIdSelecionada = watch("estruturaId");

  // Busca os Setores (departamentos) quando a Estrutura muda
  useEffect(() => {
    if (!estruturaIdSelecionada) {
      setSetores([]);
      return;
    }
    const buscarSetores = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/api/setores/estrutura/${estruturaIdSelecionada}`, makeConfig());
        setSetores(res.data);
      } catch (error) {
        toast.error('Erro ao carregar os setores desta escola.');
      }
    };
    buscarSetores();
  }, [estruturaIdSelecionada, token]);

  // Envia a solicitação para o ADM
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = {
      setorId: parseInt(data.setorId),
      justificativa: data.justificativa
    };

    try {
      await axios.post('http://localhost:8081/api/solicitacoes-setor', payload, makeConfig());
      toast.success('Solicitação enviada com sucesso! Aguardando aprovação do ADM.');
      reset();
      setTimeout(() => navigate('/'), 2000); // Volta para a Home
    } catch (error) {
      toast.error('Erro ao enviar sua solicitação.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrapper}>
        <h3 className={styles.titulo}>
          <FaBriefcase className={styles.icone} /> Solicitar Acesso a um Setor
        </h3>
        <p className={styles.descricao}>
          Peça ao administrador para vincular seu usuário a um setor de uma escola.
        </p>

        <div className={styles.formGroup}>
          <label>1. Selecione a Estrutura (Escola)</label>
          <select {...register('estruturaId', { required: true })}>
            <option value="">Selecione uma estrutura...</option>
            {estruturas.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>2. Selecione o Setor (Departamento)</label>
          <select {...register('setorId', { required: true })} disabled={!estruturaIdSelecionada || setores.length === 0}>
            <option value="">Selecione um setor...</option>
            {setores.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>3. Justificativa</label>
          <textarea
            {...register('justificativa', { required: true })}
            placeholder="Ex: Sou o novo professor de matemática da turma 801."
            rows={4}
          />
        </div>

        <button type="submit" className={styles.botaoEnviar} disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : <><FaPaperPlane /> Enviar Solicitação</>}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default SolicitarSetor;