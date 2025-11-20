import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaUserTie, FaSave, FaSearch } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './FolhaPagamentoRh.module.css';

function FolhaPagamentoRh() {
  // Listas
  const [itensDisponiveis, setItensDisponiveis] = useState([]);
  const [escolas, setEscolas] = useState([]);
  
  // Seleção
  const [itemSelecionado, setItemSelecionado] = useState('');
  
  // Dados do Formulário (Chave = ID do ComboDestino/Escola)
  const [qtds, setQtds] = useState({});
  const [valores, setValores] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // 1. Carregar Cargos (Itens) ao abrir a tela
  useEffect(() => {
    async function carregarItens() {
      try {
        const res = await axios.get('http://localhost:8081/api/rh/itens-disponiveis', makeConfig());
        setItensDisponiveis(res.data);
      } catch (error) {
        toast.error("Erro ao carregar lista de cargos.");
      }
    }
    carregarItens();
  }, []);

  // 2. Quando selecionar um Cargo, buscar as Escolas
  const carregarEscolasPorItem = async (itemId) => {
    setItemSelecionado(itemId);
    setEscolas([]);
    setQtds({});
    setValores({});

    if (!itemId) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8081/api/rh/itens/${itemId}/escolas`, makeConfig());
      const dadosEscolas = res.data;
      setEscolas(dadosEscolas);

      // Preenche os inputs com o que já veio do banco (se houver)
      const novasQtds = {};
      const novosValores = {};
      
      dadosEscolas.forEach(e => {
        if (e.quantidadeAtual !== null) novasQtds[e.comboDestinoId] = e.quantidadeAtual;
        if (e.valorAtual !== null) novosValores[e.comboDestinoId] = e.valorAtual;
      });

      setQtds(novasQtds);
      setValores(novosValores);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar escolas para este cargo.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Manipuladores de Input
  const handleQtdChange = (idEnvio, val) => {
    if (val < 0) return;
    setQtds(prev => ({ ...prev, [idEnvio]: val }));
  };

  const handleValorChange = (idEnvio, val) => {
    if (val < 0) return;
    setValores(prev => ({ ...prev, [idEnvio]: val }));
  };

  // 4. Salvar Tudo (Lote)
  const salvarLote = async () => {
    setEnviando(true);
    
    // Monta a lista de objetos para enviar
    const payload = escolas.map(escola => ({
        comboDestinoId: escola.comboDestinoId,
        quantidade: qtds[escola.comboDestinoId] ? parseInt(qtds[escola.comboDestinoId]) : 0,
        valor: valores[escola.comboDestinoId] ? parseFloat(valores[escola.comboDestinoId]) : 0
    }));

    try {
      await axios.post(
        `http://localhost:8081/api/rh/itens/${itemSelecionado}/salvar-lote`, 
        payload, 
        makeConfig()
      );
      toast.success("Dados salvos com sucesso para todas as escolas!");
    } catch (error) {
      toast.error("Erro ao salvar lote.");
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.titulo}>
        <FaMoneyBillWave className={styles.icone} /> Gestão de Folha (RH)
      </h3>

      {/* Seleção de Cargo */}
      <div className={styles.filtroContainer}>
        <label><FaUserTie /> Selecione o Cargo/Função:</label>
        <select 
            value={itemSelecionado} 
            onChange={(e) => carregarEscolasPorItem(e.target.value)}
            className={styles.selectCargo}
        >
            <option value="">Selecione...</option>
            {itensDisponiveis.map(item => (
                <option key={item.id} value={item.id}>{item.nome}</option>
            ))}
        </select>
      </div>

      {/* Tabela de Preenchimento */}
      {itemSelecionado && (
        <div className={styles.areaPreenchimento}>
            {loading ? (
                <p>Carregando escolas...</p>
            ) : escolas.length === 0 ? (
                <p className={styles.mensagemVazia}>Nenhuma escola precisa deste cargo na competência atual.</p>
            ) : (
                <>
                    <div className={styles.tabelaHeader}>
                        <span>Escola</span>
                        <span>Qtd. Funcionários</span>
                        <span>Valor Total (R$)</span>
                    </div>
                    
                    <div className={styles.listaEscolas}>
                        {escolas.map(escola => (
                            <div key={escola.comboDestinoId} className={styles.linhaEscola}>
                                <div className={styles.nomeEscola}>{escola.nomeEstrutura}</div>
                                
                                <div className={styles.inputWrapper}>
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        className={styles.inputQtd}
                                        value={qtds[escola.comboDestinoId] || ''}
                                        onChange={(e) => handleQtdChange(escola.comboDestinoId, e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputWrapper}>
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        step="0.01"
                                        className={styles.inputValor}
                                        value={valores[escola.comboDestinoId] || ''}
                                        onChange={(e) => handleValorChange(escola.comboDestinoId, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.footerAcoes}>
                        <button onClick={salvarLote} className={styles.botaoSalvar} disabled={enviando}>
                            {enviando ? 'Salvando...' : <><FaSave /> Salvar Todos</>}
                        </button>
                    </div>
                </>
            )}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default FolhaPagamentoRh;