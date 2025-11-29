// src/components/pages/GerenciarCombos.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFolderOpen, FaTasks, FaShare } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Gerenciamento.module.css'; 

function GerenciarCombos() {
  const [combos, setCombos] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEnvioOpen, setIsModalEnvioOpen] = useState(false);
  const [comboEmEdicao, setComboEmEdicao] = useState(null);
  const [comboParaEnvio, setComboParaEnvio] = useState(null);
  const [estruturas, setEstruturas] = useState([]);
  const [setores, setSetores] = useState([]);
  const [setoresSelecionados, setSetoresSelecionados] = useState([]);

  const { register, handleSubmit, reset, setValue } = useForm();
  const { register: registerEnvio, handleSubmit: handleSubmitEnvio, reset: resetEnvio, watch: watchEnvio } = useForm();

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // --- Buscar combos ---
  const buscarCombos = async () => {
    try {
      const response = await axios.get('https://ssge.onrender.com/adm/combos', makeConfig());
      setCombos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar os kits.');
      console.error(error);
    }
  };

  // --- Buscar competências ---
  const buscarCompetencias = async () => {
    try {
      const response = await axios.get('https://ssge.onrender.com/adm/competencias', makeConfig());
      setCompetencias(response.data);
    } catch (error) {
      toast.error('Erro ao buscar competências.');
      console.error(error);
    }
  };

  // --- Buscar estruturas ---
  const buscarEstruturas = async () => {
    try {
      const response = await axios.get('https://ssge.onrender.com/adm/estruturas', makeConfig());
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
      const response = await axios.get(`https://ssge.onrender.com/adm/setores/estrutura/${estruturaId}`, makeConfig());
      setSetores(response.data);
    } catch (error) {
      toast.error('Erro ao buscar setores.');
      console.error(error);
    }
  };

  useEffect(() => {
    buscarCombos();
    buscarEstruturas();
    buscarCompetencias();
  }, []);

  // --- Abrir modal criar/editar ---
  const abrirModal = (combo = null) => {
    reset();
    if (combo) {
      setComboEmEdicao(combo);
      setValue('nomeCombo', combo.nomeCombo);
      setValue('descricao', combo.descricao);
      setValue('competenciaId', combo.competencia?.id || '');
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
    setSetores([]);
    setSetoresSelecionados([]);
  };

  const fecharModalEnvio = () => {
    resetEnvio();
    setIsModalEnvioOpen(false);
    setComboParaEnvio(null);
    setSetores([]);
    setSetoresSelecionados([]);
  };

  // --- Criar ou atualizar combo ---
  const onSubmit = async (data) => {
    const dadosFormatados = {
      ...data,
      ativo: comboEmEdicao ? comboEmEdicao.ativo : true
    };

    try {
      if (comboEmEdicao) {
        await axios.put(`https://ssge.onrender.com/adm/combos/${comboEmEdicao.id}`, dadosFormatados, makeConfig());
        toast.success('Kit atualizado com sucesso!');
      } else {
        await axios.post('https://ssge.onrender.com/adm/combos', dadosFormatados, makeConfig());
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
        await axios.delete(`https://ssge.onrender.com/adm/combos/${id}`, makeConfig());
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

  // --- Enviar combo para setores ---
  const onSubmitEnvio = handleSubmitEnvio(async (formData) => {
    if (!comboParaEnvio) return;

    const estruturaId = formData.estruturaId;
    if (!estruturaId || setoresSelecionados.length === 0) {
      toast.error('Selecione a estrutura e pelo menos um setor.');
      return;
    }

    try {
      await axios.post(
        `https://ssge.onrender.com/adm/combos/${comboParaEnvio.id}/estrutura/${estruturaId}`,
        {
          setoresId: setoresSelecionados
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      toast.success('Combo enviado para os setores selecionados!');
      fecharModalEnvio();
    } catch (error) {
      toast.error('Erro ao enviar o combo.');
      console.error(error);
    }
  });

  // --- Atualizar setores ao mudar estrutura ---
  const estruturaSelecionada = watchEnvio('estruturaId');
  useEffect(() => {
    if (estruturaSelecionada) buscarSetores(estruturaSelecionada);
    else setSetores([]);
    setSetoresSelecionados([]);
  }, [estruturaSelecionada]);

  // --- Lidar com checkbox de setores ---
  const toggleSetor = (setorId) => {
    setSetoresSelecionados(prev =>
      prev.includes(setorId)
        ? prev.filter(id => id !== setorId)
        : [...prev, setorId]
    );
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
            <th>Competência</th>
            <th className={styles.colunaAcoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {combos.map(combo => (
            <tr key={combo.id}>
              <td>{combo.nomeCombo}</td>
              <td>{combo.descricao}</td>
              <td>{combo.competencia?.nome}</td>
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

              <div className={styles.formGroup}>
                <label>Competência</label>
                <select {...register('competenciaId', { required: true })}>
                  <option value="">Selecione</option>
                  {competencias.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
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
            <h4 className={styles.modalTitulo}>Enviar Combo para Setores</h4>
            <form onSubmit={handleSubmitEnvio(onSubmitEnvio)}>
              {/* Estrutura */}
              <div className={styles.formGroup}>
                <label>Estrutura</label>
                <select {...registerEnvio('estruturaId', { required: true })}>
                  <option value="">Selecione</option>
                  {estruturas.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name || e.nomeEstrutura || e.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Setores */}
              <div className={styles.formGroup}>
                <label>Setores</label>
                <div className={styles.checkboxContainer}>
                  {setores.map((setor) => (
                    <label key={setor.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        value={setor.id}
                        {...registerEnvio('setoresId')}
                        onChange={() => toggleSetor(setor.id)}
                        checked={setoresSelecionados.includes(setor.id)}
                      />
                      <span>{setor.nome || setor.nomeSetor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={fecharModalEnvio} className={styles.botaoCancelar}>
                  Cancelar
                </button>
                <button type="submit" className={styles.botaoSalvar}>
                  Enviar  
                </button>
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
