// src/components/pages/DetalhesCombo.js

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './DetalhesCombo.module.css';

function DetalhesCombo() {
  const { comboId } = useParams(); // Pega o ID da URL
  const { register, handleSubmit, reset } = useForm();

  const [combo, setCombo] = useState(null);
  const [itensDoCombo, setItensDoCombo] = useState([]);
  const [todosOsItens, setTodosOsItens] = useState([]);

  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const buscarDados = useCallback(async () => {
    try {
      const [resCombo, resItensCombo, resTodosItens] = await Promise.all([
        axios.get(`http://localhost:8081/adm/combos/${comboId}`, makeConfig()),
        axios.get(`http://localhost:8081/adm/combos/${comboId}/itens`, makeConfig()),
        axios.get('http://localhost:8081/adm/itens', makeConfig())
      ]);
      setCombo(resCombo.data);
      setItensDoCombo(resItensCombo.data);
      setTodosOsItens(resTodosItens.data);
    } catch (error) {
      toast.error('Erro ao carregar os detalhes do kit.');
      console.error(error);
    }
  }, [comboId, token]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const adicionarItem = async (data) => {
    try {
      await axios.post(`http://localhost:8081/adm/combos/${comboId}/itens`, data, makeConfig());
      toast.success('Item adicionado ao kit com sucesso!');
      reset(); // Limpa o formulário
      buscarDados(); // Atualiza a lista
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao adicionar o item.';
      toast.error(msg);
      console.error(error);
    }
  };

  const removerItem = async (comboItemId) => {
    if (window.confirm('Tem certeza que deseja remover este item do kit?')) {
      try {
        await axios.delete(`http://localhost:8081/adm/combos/itens/${comboItemId}`, makeConfig());
        toast.success('Item removido do kit com sucesso!');
        buscarDados(); // Atualiza a lista
      } catch (error) {
        toast.error('Erro ao remover o item.');
        console.error(error);
      }
    }
  };

  if (!combo) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <Link to="/adm/combos" className={styles.linkVoltar}><FaArrowLeft /> Voltar para Kits</Link>
      
      <div className={styles.cabecalho}>
        <h3 className={styles.titulo}><FaClipboardList className={styles.icone} /> {combo.nomeCombo}</h3>
        <p className={styles.descricao}>{combo.descricao}</p>
      </div>

      <div className={styles.conteudo}>
        {/* Lado Esquerdo: Itens já no Combo */}
        <div className={styles.coluna}>
          <h4 className={styles.subtitulo}>Itens no Kit</h4>
          {itensDoCombo.length > 0 ? (
            <table className={styles.tabelaItens}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Ordem</th>
                  <th>Obrigatório</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {itensDoCombo.map(({ id, ordem, obrigatorio, item }) => (
                  <tr key={id}>
                    <td>{item.nomeItem}</td>
                    <td>{ordem}</td>
                    <td>{obrigatorio ? 'Sim' : 'Não'}</td>
                    <td>
                      <button onClick={() => removerItem(id)} className={styles.botaoRemover} title="Remover Item">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.mensagemVazia}>Nenhum item adicionado a este kit ainda.</p>
          )}
        </div>

        {/* Lado Direito: Formulário para Adicionar Novos Itens */}
        <div className={styles.coluna}>
          <h4 className={styles.subtitulo}>Adicionar Novo Item</h4>
          <form onSubmit={handleSubmit(adicionarItem)} className={styles.formulario}>
            <div className={styles.formGroup}>
              <label>Item</label>
              <select {...register('itemId', { required: true, valueAsNumber: true })}>
                <option value="">Selecione um item...</option>
                {todosOsItens.map(item => (
                  <option key={item.id} value={item.id}>{item.nomeItem}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Ordem</label>
              <input type="text" {...register('ordem', { required: true })} placeholder="Ex: 1, 2, A, B..." />
            </div>
            <div className={styles.formGroupCheck}>
              <input type="checkbox" {...register('obrigatorio')} id="obrigatorio" />
              <label htmlFor="obrigatorio">É obrigatório?</label>
            </div>
            <button type="submit" className={styles.botaoAdicionar}><FaPlus /> Adicionar ao Kit</button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DetalhesCombo;