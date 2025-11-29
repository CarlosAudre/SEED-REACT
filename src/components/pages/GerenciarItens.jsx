// src/components/pages/GerenciarItens.js

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios'; // Usando axios diretamente
import { FaPlus, FaEdit, FaTrash, FaBoxOpen } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Gerenciamento.module.css'; 

function GerenciarItens() {
  const [itens, setItens] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  // Lógica para adicionar o token, igual ao seu componente de Solicitação
  const token = localStorage.getItem('token');
  const makeConfig = () => {
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const buscarDados = async () => {
    try {
      const [resItens, resClassificacoes] = await Promise.all([
        axios.get('https://ssge.onrender.com/adm/itens', makeConfig()),
        axios.get('https://ssge.onrender.com/adm/classificacoes', makeConfig()) 
      ]);
      setItens(resItens.data);
      setClassificacoes(resClassificacoes.data);
    } catch (error) {
      toast.error('Erro ao buscar dados. O endpoint /adm/classificacoes existe?');
      console.error(error);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const abrirModal = (item = null) => {
    reset();
    if (item) {
      setItemEmEdicao(item);
      setValue('nomeItem', item.nomeItem);
      setValue('descricao', item.descricao);
      setValue('classificacaoId', item.classificacaoDTO.id);
      setValue('tipo_dado', item.tipo_dado);
      setValue('obrigatorio', item.obrigatorio);
    } else {
      setItemEmEdicao(null);
    }
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setItemEmEdicao(null);
  };

  const onSubmit = async (data) => {
    const dadosFormatados = {
        ...data,
        classificacaoDTO: { id: parseInt(data.classificacaoId) },
        ativo: itemEmEdicao ? itemEmEdicao.ativo : true
    };

    try {
      if (itemEmEdicao) {
        await axios.put(`https://ssge.onrender.com/adm/itens/${itemEmEdicao.id}`, dadosFormatados, makeConfig());
        toast.success('Item atualizado com sucesso!');
      } else {
        await axios.post('https://ssge.onrender.com/adm/itens', dadosFormatados, makeConfig());
        toast.success('Item criado com sucesso!');
      }
      fecharModal();
      buscarDados();
    } catch (error) {
      toast.error('Erro ao salvar o item.');
      console.error(error);
    }
  };

  const deletarItem = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este item?')) {
      try {
        await axios.delete(`https://ssge.onrender.com/adm/itens/${id}`, makeConfig());
        toast.success('Item deletado com sucesso!');
        buscarDados();
      } catch (error) {
        toast.error('Erro ao deletar o item.');
        console.error(error);
      }
    }
  };

  
  return (
    <div className={styles.container}>
      <h3 className={styles.titulo}>
        <FaBoxOpen className={styles.icone} /> Gerenciar Itens
      </h3>
      <div className={styles.containerBotaoTopo}>
        <button onClick={() => abrirModal()} className={styles.botaoNovo}>
          <FaPlus /> Adicionar Novo Item
        </button>
      </div>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Classificação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map(item => (
            <tr key={item.id}>
              <td>{item.nomeItem}</td>
              <td>{item.descricao}</td>
              <td>{item.classificacaoDTO.nomeClassificacao}</td>
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
            <h4 className={styles.modalTitulo}>{itemEmEdicao ? 'Editar Item' : 'Novo Item'}</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGroup}>
                <label>Nome do Item</label>
                <input {...register('nomeItem', { required: true })} />
              </div>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <input {...register('descricao', { required: true })} />
              </div>
              <div className={styles.formGroup}>
                <label>Classificação</label>
                <select {...register('classificacaoId', { required: true })}>
                  <option value="">Selecione...</option>
                  {classificacoes.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeClassificacao}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Tipo de Dado</label>
                <input {...register('tipo_dado')} placeholder="Ex: UNIDADE, QUANTIDADE" />
              </div>
               <div className={styles.formGroupCheck}>
                <label>Obrigatório?</label>
                <input type="checkbox" {...register('obrigatorio')} />
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

export default GerenciarItens;