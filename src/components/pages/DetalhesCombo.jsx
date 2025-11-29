

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaClipboardList, FaArrowLeft, FaPlusCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './DetalhesCombo.module.css';

function DetalhesCombo() {
  const { comboId } = useParams(); 
  const { register, handleSubmit, reset } = useForm(); 
  const { register: registerItem, handleSubmit: handleSubmitItem, reset: resetItem } = useForm();

  const [combo, setCombo] = useState(null);
  const [itensDoCombo, setItensDoCombo] = useState([]);
  const [todosOsItens, setTodosOsItens] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]); 
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const buscarDados = useCallback(async () => {
    try {
      const [resCombo, resItensCombo, resTodosItens, resClassificacoes] = await Promise.all([ 
        axios.get(`https://ssge.onrender.com/adm/combos/${comboId}`, makeConfig()),
        axios.get(`https://ssge.onrender.com/adm/combos/${comboId}/itens`, makeConfig()),
        axios.get('https://ssge.onrender.com/adm/itens', makeConfig()),
        axios.get('https://ssge.onrender.com/adm/classificacoes', makeConfig()) 
      ]);
      setCombo(resCombo.data);
      
      // Garante que a lista de itens não seja null e ordena
      const lista = resItensCombo.data || [];
      const itensOrdenados = lista.sort((a, b) => parseInt(a.ordem || 0) - parseInt(b.ordem || 0));
      setItensDoCombo(itensOrdenados);
      
      setTodosOsItens(resTodosItens.data || []);
      setClassificacoes(resClassificacoes.data || []); 
    } catch (error) { 
        console.error(error);
        // Evita toast excessivo
    }
  }, [comboId, token]); 

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);
  
  // --- Modal Criar Item ---
  const abrirItemModal = () => { resetItem(); setIsItemModalOpen(true); };
  const fecharItemModal = () => setIsItemModalOpen(false);

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
        await axios.post('https://ssge.onrender.com/adm/itens', dadosFormatados, makeConfig());
        toast.success('Novo item criado!');
        fecharItemModal();
        const resTodosItens = await axios.get('https://ssge.onrender.com/adm/itens', makeConfig());
        setTodosOsItens(resTodosItens.data); 
    } catch (error) {
        toast.error('Erro ao criar item.');
    }
  };

  // --- Adicionar Item ao Kit ---
  const adicionarItem = async (data) => {
    const maiorOrdem = itensDoCombo.length > 0 
        ? Math.max(...itensDoCombo.map(i => parseInt(i.ordem) || 0)) 
        : 0;
    const proximaOrdem = (maiorOrdem + 1).toString();

    const payload = {
      itemId: data.itemId,
      ordem: proximaOrdem,
      obrigatorio: data.obrigatorio || false,
    };

    try {
      await axios.post(`https://ssge.onrender.com/adm/combos/${comboId}/itens`, payload, makeConfig());
      toast.success('Item adicionado!');
      reset(); 
      buscarDados(); 
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao adicionar.';
      toast.error(msg);
    }
  };

  // --- Reordenar Itens ---
  const moverItem = async (index, direcao) => {
    if (direcao === 'cima' && index === 0) return;
    if (direcao === 'baixo' && index === itensDoCombo.length - 1) return;

    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;
    const novaLista = [...itensDoCombo];
    const itemMovido = novaLista[index];
    const itemTrocado = novaLista[novoIndex];

    const ordemTemp = itemMovido.ordem;
    itemMovido.ordem = itemTrocado.ordem;
    itemTrocado.ordem = ordemTemp;

    novaLista[index] = itemTrocado;
    novaLista[novoIndex] = itemMovido;
    setItensDoCombo(novaLista);

    try {
        await Promise.all([
            axios.patch(`https://ssge.onrender.com/adm/combos/itens/${itemMovido.id}/ordem`, itemMovido.ordem, {
                headers: { ...makeConfig().headers, 'Content-Type': 'text/plain' }
            }),
            axios.patch(`https://ssge.onrender.com/adm/combos/itens/${itemTrocado.id}/ordem`, itemTrocado.ordem, {
                headers: { ...makeConfig().headers, 'Content-Type': 'text/plain' }
            })
        ]);
    } catch (error) {
        toast.error("Erro ao salvar a nova ordem.");
        buscarDados(); 
    }
  };

  const removerItem = async (comboItemId) => {
    if (window.confirm('Remover este item do kit?')) {
      try {
        await axios.delete(`https://ssge.onrender.com/adm/combos/itens/${comboItemId}`, makeConfig());
        toast.success('Item removido!');
        buscarDados(); 
      } catch (error) {
        toast.error('Erro ao remover.');
      }
    }
  };

  // Loading state simples
  if (!combo) return <div style={{color: 'white', textAlign: 'center', padding: '50px'}}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <Link to="/adm/combos" className={styles.linkVoltar}><FaArrowLeft /> Voltar para Kits</Link>
      
      <div className={styles.cabecalho}>
        <h3 className={styles.titulo}><FaClipboardList className={styles.icone} /> {combo.nomeCombo}</h3>
        <p className={styles.descricao}>{combo.descricao}</p>
      </div>

      <div className={styles.conteudo}>
        {/* Lado Esquerdo */}
        <div className={styles.coluna}>
          <h4 className={styles.subtitulo}>Itens no Kit</h4>
          {itensDoCombo.length > 0 ? (
            <table className={styles.tabelaItens}>
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Item</th>
                  <th>Tipo de Dado</th>
                  <th>Obrigatório</th>
                  <th>Mover</th>
                  <th>Ação</th> 
                </tr>
              </thead>
              <tbody>
                {itensDoCombo.map((comboItem, index) => ( 
                  <tr key={comboItem.id}>
                    <td style={{fontWeight: 'bold', textAlign: 'center'}}>{comboItem.ordem}</td>
                    <td>{comboItem.item ? comboItem.item.nomeItem : 'Item inválido'}</td>
                    <td>{comboItem.item ? comboItem.item.tipo_dado : 'Item inválido'}</td>
                    <td style={{textAlign: 'center'}}>{comboItem.obrigatorio ? 'Sim' : 'Não'}</td>
                    
                    <td className={styles.colunaMover}>
                        <button onClick={() => moverItem(index, 'cima')} className={styles.botaoSeta} disabled={index === 0}><FaArrowUp /></button>
                        <button onClick={() => moverItem(index, 'baixo')} className={styles.botaoSeta} disabled={index === itensDoCombo.length - 1}><FaArrowDown /></button>
                    </td>

                    <td style={{textAlign: 'center'}}>
                      <button onClick={() => removerItem(comboItem.id)} className={styles.botaoRemover}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.mensagemVazia}>Nenhum item adicionado a este kit ainda.</p>
          )}
        </div>

        {/* Lado Direito */}
        <div className={styles.coluna}>
           <h4 className={styles.subtitulo}>
             Adicionar Item
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
            
            <div className={styles.formGroupCheck}>
              <input type="checkbox" {...register('obrigatorio')} id="obrigatorio-add" /> 
              <label htmlFor="obrigatorio-add">É obrigatório?</label>
            </div>
            <button type="submit" className={styles.botaoAdicionar}><FaPlus /> Adicionar ao Kit</button>
          </form>
        </div>
      </div>

      {/* Modal Criar Item */}
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