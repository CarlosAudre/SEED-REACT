// src/components/pages/GerenciarCombos.js

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFolderOpen, FaTasks } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './GerenciarCombos.module.css';

function GerenciarCombos() {
  const [combos, setCombos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comboEmEdicao, setComboEmEdicao] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const makeConfig = () => {
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const buscarCombos = async () => {
    try {
      const response = await axios.get('http://localhost:8081/adm/combos', makeConfig());
      setCombos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar os kits.');
      console.error(error);
    }
  };

  useEffect(() => {
    buscarCombos();
  }, []);

  const abrirModal = (combo = null) => {
    reset();
    if (combo) {
      setComboEmEdicao(combo);
      setValue('nomeCombo', combo.nomeCombo);
      setValue('descricao', combo.descricao);
    } else {
      setComboEmEdicao(null);
    }
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setComboEmEdicao(null);
  };

  const onSubmit = async (data) => {
    const dadosFormatados = {
        ...data,
        ativo: comboEmEdicao ? comboEmEdicao.ativo : true
    };

    try {
      if (comboEmEdicao) {
        await axios.put(`http://localhost:8081/adm/combos/${comboEmEdicao.id}`, dadosFormatados, makeConfig());
        toast.success('Kit atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:8081/adm/combos', dadosFormatados, makeConfig());
        toast.success('Kit criado com sucesso!');
      }
      fecharModal();
      buscarCombos();
    } catch (error) {
      toast.error('Erro ao salvar o kit.');
      console.error(error);
    }
  };

  const deletarCombo = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este kit?')) {
      try {
        await axios.delete(`http://localhost:8081/adm/combos/${id}`, makeConfig());
        toast.success('Kit deletado com sucesso!');
        buscarCombos();
      } catch (error) {
        toast.error('Erro ao deletar o kit.');
        console.error(error);
      }
    }
  };

  const navegarParaDetalhes = (comboId) => {
    navigate(`/adm/combos/${comboId}`);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.titulo}>
        <FaFolderOpen className={styles.icone} /> Gerenciar Kits de Solicitação
      </h3>
      <div className={styles.containerBotaoTopo}>
        <button onClick={() => abrirModal()} className={styles.botaoNovo}>
          <FaPlus /> Adicionar Novo Kit
        </button>
      </div>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome do Kit</th>
            <th>Descrição</th>
            <th className={styles.colunaAcoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {combos.map(combo => (
            <tr key={combo.id}>
              <td>{combo.nomeCombo}</td>
              <td>{combo.descricao}</td>
              <td className={styles.acoes}>
                <button onClick={() => navegarParaDetalhes(combo.id)} className={styles.botaoGerenciar} title="Gerenciar Itens do Kit">
                  <FaTasks />
                </button>
                <button onClick={() => abrirModal(combo)} className={styles.botaoAcao} title="Editar Kit">
                  <FaEdit />
                </button>
                <button onClick={() => deletarCombo(combo.id)} className={styles.botaoAcao} title="Deletar Kit">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>{comboEmEdicao ? 'Editar Kit' : 'Novo Kit'}</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGroup}>
                <label>Nome do Kit</label>
                <input {...register('nomeCombo', { required: true })} />
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

export default GerenciarCombos;