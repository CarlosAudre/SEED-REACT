// src/components/pages/GerenciarClassificacoes.js

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTags } from 'react-icons/fa'; // Ícone novo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Gerenciamento.module.css'; // Novo CSS

function GerenciarClassificacoes() {
  const [classificacoes, setClassificacoes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();
  
  const token = localStorage.getItem('token');
  const makeConfig = () => {
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const buscarDados = async () => {
    try {
      const response = await axios.get('https://ssge.onrender.com/adm/classificacoes', makeConfig());
      setClassificacoes(response.data);
    } catch (error) {
      toast.error('Erro ao buscar as classificações.');
      console.error(error);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const abrirModal = (item = null) => {
    reset();
    if (item) {
      setEmEdicao(item);
      setValue('nomeClassificacao', item.nomeClassificacao);
      setValue('descricao', item.descricao);
    } else {
      setEmEdicao(null);
    }
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEmEdicao(null);
  };

  const onSubmit = async (data) => {
    // O DTO esperado é { nomeClassificacao, descricao }
    // O 'id' não é enviado no corpo
    const payload = {
      nomeClassificacao: data.nomeClassificacao,
      descricao: data.descricao
    };

    try {
      if (emEdicao) {
        await axios.put(`https://ssge.onrender.com/adm/classificacoes/${emEdicao.id}`, payload, makeConfig());
        toast.success('Classificação atualizada com sucesso!');
      } else {
        await axios.post('https://ssge.onrender.com/adm/classificacoes', payload, makeConfig());
        toast.success('Classificação criada com sucesso!');
      }
      fecharModal();
      buscarDados();
    } catch (error) {
      toast.error('Erro ao salvar a classificação.');
      console.error(error);
    }
  };

  const deletarItem = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta classificação?')) {
      try {
        await axios.delete(`https://ssge.onrender.com/adm/classificacoes/${id}`, makeConfig());
        toast.success('Classificação deletada com sucesso!');
        buscarDados();
      } catch (error) {
        toast.error('Erro ao deletar a classificação.');
        console.error(error);
      }
    }
  };

  return (
    // Reutiliza o estilo do container que você já tem
    <div className={styles.container}> 
      <h3 className={styles.titulo}>
        <FaTags className={styles.icone} /> Gerenciar Classificações
      </h3>
      <div className={styles.containerBotaoTopo}>
        <button onClick={() => abrirModal()} className={styles.botaoNovo}>
          <FaPlus /> Adicionar Nova Classificação
        </button>
      </div>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th className={styles.colunaAcoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {classificacoes.map(item => (
            <tr key={item.id}>
              <td>{item.nomeClassificacao}</td>
              <td>{item.descricao}</td>
              <td className={styles.acoes}>
                <button onClick={() => abrirModal(item)} className={styles.botaoAcao}><FaEdit /></button>
                <button onClick={() => deletarItem(item.id)} className={styles.botaoAcao}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>{emEdicao ? 'Editar Classificação' : 'Nova Classificação'}</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGroup}>
                <label>Nome da Classificação</label>
                <input {...register('nomeClassificacao', { required: true })} />
              </div>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <input {...register('descricao', { required: true })} />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={fecharModal} className={styles.botaoCancelar}>Cancelar</button>
                <button type="submit" className={styles.botaoSalvar}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default GerenciarClassificacoes;