

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaClipboardList, FaArrowLeft, FaPlusCircle } from 'react-icons/fa'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './DetalhesCombo.module.css';

function DetalhesCombo() {
  const { comboId } = useParams(); 
  const { register, handleSubmit, reset } = useForm(); // Form principal
  const { register: registerItem, handleSubmit: handleSubmitItem, reset: resetItem } = useForm(); // Form do modal

  const [combo, setCombo] = useState(null);
  const [itensDoCombo, setItensDoCombo] = useState([]);
  const [todosOsItens, setTodosOsItens] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]); 
  const [isItemModalOpen, setIsItemModalOpen] = useState(false); // Estado do modal

  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Busca todos os dados, incluindo classificações para o modal
  const buscarDados = useCallback(async () => {
    try {
      const [resCombo, resItensCombo, resTodosItens, resClassificacoes] = await Promise.all([ 
        axios.get(`http://localhost:8081/adm/combos/${comboId}`, makeConfig()),
        axios.get(`http://localhost:8081/adm/combos/${comboId}/itens`, makeConfig()),
        axios.get('http://localhost:8081/adm/itens', makeConfig()),
        axios.get('http://localhost:8081/adm/classificacoes', makeConfig()) 
      ]);
      setCombo(resCombo.data);
      setItensDoCombo(resItensCombo.data);
      setTodosOsItens(resTodosItens.data);
      setClassificacoes(resClassificacoes.data); 
    } catch (error) { 
        toast.error('Erro ao carregar dados do kit.');
        console.error("Erro em buscarDados:", error);
    }
  }, [comboId, token]); 

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);
  
  // --- Funções do Modal "Criar Item" ---
  const abrirItemModal = () => {
    resetItem();
    setIsItemModalOpen(true);
  };
  const fecharItemModal = () => {
    setIsItemModalOpen(false);
  };

  const criarNovoItem = async (data) => {
    // Payload sem 'valor', mas com o resto
    const dadosFormatados = {
        nomeItem: data.nomeItem,
        descricao: data.descricao,
        classificacaoDTO: { id: parseInt(data.classificacaoId) },
        tipo_dado: data.tipo_dado,
        obrigatorio: data.obrigatorio || false, 
        ativo: true
        // 'valor' (ou 'quantidade') do item foi removido
    };
    try {
        await axios.post('http://localhost:8081/adm/itens', dadosFormatados, makeConfig());
        toast.success('Novo item criado com sucesso!');
        fecharItemModal();
        // Atualiza a lista de itens disponíveis no dropdown
        const resTodosItens = await axios.get('http://localhost:8081/adm/itens', makeConfig());
        setTodosOsItens(resTodosItens.data); 
    } catch (error) {
        toast.error('Erro ao criar o novo item.');
        console.error("Erro em criarNovoItem:", error);
    }
  };
  // --- Fim das Funções do Modal ---

  // Adiciona item existente ao combo
  const adicionarItem = async (data) => {
    const payload = {
      itemId: data.itemId,
      ordem: data.ordem,
      obrigatorio: data.obrigatorio || false,
      // 'valor' foi removido deste payload
    };
    try {
      await axios.post(`http://localhost:8081/adm/combos/${comboId}/itens`, payload, makeConfig());
      toast.success('Item adicionado ao kit com sucesso!');
      reset(); 
      buscarDados(); 
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao adicionar o item.';
      toast.error(msg);
      console.error("Erro em adicionarItem:", error);
    }
  };

  const removerItem = async (comboItemId) => {
    if (window.confirm('Tem certeza que deseja remover este item do kit?')) {
      try {
        await axios.delete(`http://localhost:8081/adm/combos/itens/${comboItemId}`, makeConfig());
        toast.success('Item removido do kit com sucesso!');
        buscarDados(); 
      } catch (error) {
        toast.error('Erro ao remover o item.');
        console.error("Erro em removerItem:", error);
      }
    }
  };

  if (!combo) return <div style={{color: 'white', textAlign: 'center', padding: '50px'}}>Carregando...</div>;

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
                  <th>Tipo de Dado</th>
                  <th>Obrigatório</th>
                  
                  <th>Ação</th> 
                </tr>
              </thead>
              <tbody>
                
                {itensDoCombo.map(({ id, ordem, obrigatorio,tipo_dado, item }) => ( 
                  <tr key={id}>
                    <td>{item.nomeItem}</td>
                    <td>{ordem}</td>
                    <td>{item.tipo_dado}</td>
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

        {/* Lado Direito: Formulário para Adicionar Itens */}
        <div className={styles.coluna}>
           <h4 className={styles.subtitulo}>
             Adicionar Item Existente
             
             <button onClick={abrirItemModal} className={styles.botaoCriacaoRapida} title="Criar novo item rapidamente">
                 <FaPlusCircle />
             </button>
           </h4>
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
              <input 
                type="text" 
                {...register('ordem', { required: true })} 
                placeholder="Ex: 1, 2, 3... (número único, >= 1)" 
              />
            </div>
            
            

            <div className={styles.formGroupCheck}>
              <input type="checkbox" {...register('obrigatorio')} id="obrigatorio-add" /> 
              <label htmlFor="obrigatorio-add">É obrigatório?</label>
            </div>
            <button type="submit" className={styles.botaoAdicionar}><FaPlus /> Adicionar ao Kit</button>
          </form>
        </div>
      </div>

      
      {isItemModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}> 
              <h4 className={styles.modalTitulo}>Criar Novo Item</h4>
              <form onSubmit={handleSubmitItem(criarNovoItem)}>
                <div className={styles.formGroup}>
                  <label>Nome do Item</label>
                  <input {...registerItem('nomeItem', { required: true })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Descrição</label>
                  <input {...registerItem('descricao', { required: true })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Classificação</label>
                  <select {...registerItem('classificacaoId', { required: true })}>
                    <option value="">Selecione...</option>
                    {classificacoes.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeClassificacao}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                   <label>Tipo de Dado</label>
                   <input {...registerItem('tipo_dado')} placeholder="Ex: UNIDADE, QUANTIDADE" />
                </div>
                
                <div className={styles.modalFooter}>
                  <button type="button" onClick={fecharItemModal} className={styles.botaoCancelar}>Cancelar</button>
                  <button type="submit" className={styles.botaoSalvar}>Criar Item</button>
                </div>
              </form>
            </div>
          </div>
      )}
      

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DetalhesCombo;