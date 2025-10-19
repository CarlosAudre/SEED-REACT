// src/components/pages/GerenciarCombos.js

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFolderOpen, FaTasks, FaShare } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './GerenciarCombos.module.css';

function GerenciarCombos() {
  const [combos, setCombos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEnvioOpen, setIsModalEnvioOpen] = useState(false);
  const [comboEmEdicao, setComboEmEdicao] = useState(null);
  const [comboParaEnvio, setComboParaEnvio] = useState(null);
  const [estruturas, setEstruturas] = useState([]);
  const [setores, setSetores] = useState([]);

  const { register, handleSubmit, reset, setValue } = useForm();
  const { register: registerEnvio, handleSubmit: handleSubmitEnvio, reset: resetEnvio, watch: watchEnvio } = useForm();

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // --- Buscar combos ---
  const buscarCombos = async () => {
    try {
      const response = await axios.get('http://localhost:8081/adm/combos', makeConfig());
      setCombos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar os kits.');
      console.error(error);
    }
  };

  // --- Buscar estruturas ---
  const buscarEstruturas = async () => {
    try {
      const response = await axios.get('http://localhost:8081/adm/estruturas', makeConfig());
      setEstruturas(response.data);
    } catch (error) {
      toast.error('Erro ao buscar estruturas.');
      console.error(error);
    }
  };

  // --- Buscar setores por estrutura ---
  const buscarSetores = async (estruturaId) => {
    if (!estruturaId) return setSetores([]);
    try {
      const response = await axios.get(`http://localhost:8081/adm/setores/estrutura/${estruturaId}`, makeConfig());
      setSetores(response.data);
    } catch (error) {
      toast.error('Erro ao buscar setores.');
      console.error(error);
    }
  };

  useEffect(() => {
    buscarCombos();
    buscarEstruturas();
  }, []);

  // --- Abrir modal criar/editar ---
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
    reset();
    setIsModalOpen(false);
    setComboEmEdicao(null);
  };

  // --- Abrir modal envio ---
  const abrirModalEnvio = (combo) => {
    resetEnvio();
    setComboParaEnvio(combo);
    setIsModalEnvioOpen(true);
    setSetores([]); // limpa setores antigos
  };

  const fecharModalEnvio = () => {
    resetEnvio();
    setIsModalEnvioOpen(false);
    setComboParaEnvio(null);
    setSetores([]);
  };

  // --- Criar ou atualizar combo ---
  const onSubmit = async (data) => {
    const dadosFormatados = { ...data, ativo: comboEmEdicao ? comboEmEdicao.ativo : true };
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

  // --- Deletar combo ---
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

  // --- Navegar para detalhes ---
  const navegarParaDetalhes = (comboId) => {
    navigate(`/adm/combos/${comboId}`);
  };

  // --- Enviar combo para setor ---
  const onSubmitEnvio = async (data) => {
    const { estruturaId, setorId } = data;
    if (!comboParaEnvio) return;
    try {
      await axios.post(
        `http://localhost:8081/adm/combos/${comboParaEnvio.id}/setor/${setorId}?estruturaId=${estruturaId}`,
        {},
        makeConfig()
      );
      toast.success('Combo enviado para o setor com sucesso!');
      fecharModalEnvio();
    } catch (error) {
      toast.error('Erro ao enviar o combo.');
      console.error(error);
    }
  };

  // --- Atualizar setores ao mudar estrutura ---
  const estruturaSelecionada = watchEnvio('estruturaId');
  useEffect(() => {
    if (estruturaSelecionada) buscarSetores(estruturaSelecionada);
    else setSetores([]);
  }, [estruturaSelecionada]);

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
                <button onClick={() => abrirModalEnvio(combo)} className={styles.botaoAcao} title="Enviar para Setor">
                  <FaShare />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Criar/Editar */}
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

      {/* Modal Enviar para Setor */}
      {isModalEnvioOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>Enviar Combo para Setor</h4>
            <form onSubmit={handleSubmitEnvio(onSubmitEnvio)}>
              <div className={styles.formGroup}>

                <label>Estrutura</label>
                <select {...registerEnvio('estruturaId', { required: true })}>
                  <option value="">Selecione</option>
                  {console.log("Estruturas recebidas:", estruturas)}
                  {estruturas.map(e => (
                    <option key={e.id} value={e.id}>
                       {e.name || e.nomeEstrutura || e.nome}
                    </option>
                  ))}
                </select>

              </div>
              <div className={styles.formGroup}>
                <label>Setor</label>
                <select {...registerEnvio('setorId', { required: true })}>
                  <option value="">Selecione</option>
                  {setores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nome || s.nomeSetor}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={fecharModalEnvio} className={styles.botaoCancelar}>Cancelar</button>
                <button type="submit" className={styles.botaoSalvar}>Enviar</button>
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
