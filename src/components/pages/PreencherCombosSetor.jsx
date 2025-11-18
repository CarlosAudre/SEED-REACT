import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClipboardList, FaClock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './PreencherCombosSetor.module.css';

function PreencherCombosSetor() {
  const [combos, setCombos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [setorSelecionado, setSetorSelecionado] = useState('');
  
  // States do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comboSelecionado, setComboSelecionado] = useState(null);
  const [itens, setItens] = useState([]);
  
  // Dados do formulário
  const [valores, setValores] = useState({}); // Dinheiro (R$)
  const [qtds, setQtds] = useState({});       // Quantidade (Unidades)
  const [observacoes, setObservacoes] = useState({});
  
  const [enviando, setEnviando] = useState(false);

  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });
  const baseUrl = "http://localhost:8081/responsavel-setor/combos";

  useEffect(() => {
    async function carregarDados() {
      try {
        const resSetores = await axios.get(`${baseUrl}/setores`, makeConfig());
        setSetores(resSetores.data);
        
        const resCombos = await axios.get(baseUrl, makeConfig());
        setCombos(ordenarCombos(resCombos.data));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar lista de combos.");
      }
    }
    carregarDados();
  }, []);

  const ordenarCombos = (lista) => {
    return lista.sort((a, b) => {
      const dateA = new Date(a.dataFim || a.dataEnvio);
      const dateB = new Date(b.dataFim || b.dataEnvio);
      return dateA - dateB;
    });
  };

  const filtrarPorSetor = async (idSetor) => {
    setSetorSelecionado(idSetor);
    try {
      let url = baseUrl;
      if (idSetor) url = `${baseUrl}/setor/${idSetor}`;
      
      const res = await axios.get(url, makeConfig());
      setCombos(ordenarCombos(res.data));
    } catch (error) {
      toast.error("Erro ao filtrar combos.");
    }
  };

  const abrirModal = async (combo) => {
    setComboSelecionado(combo);
    setIsModalOpen(true);
    setItens([]);
    
    try {
      // A. Busca Itens
      const resItens = await axios.get(`${baseUrl}/${combo.comboId}/itens`, makeConfig());
      setItens(resItens.data);

      // B. Busca Preenchimentos
      const resPreench = await axios.get(`http://localhost:8081/responsavel-setor/preenchimentos/${combo.id}`, makeConfig());
      
      // C. Popula formulário
      const novosValores = {};
      const novasQtds = {}; 
      const novasObs = {};
      
      if (resPreench.data && resPreench.data.length > 0) {
        resPreench.data.forEach(p => {
            novosValores[p.itemId] = p.valor;
            novasQtds[p.itemId] = p.quantidade; 
            novasObs[p.itemId] = p.observacao || "";
        });
      }
      setValores(novosValores);
      setQtds(novasQtds); 
      setObservacoes(novasObs);

    } catch (error) {
      toast.error("Erro ao carregar detalhes.");
      console.error(error);
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setComboSelecionado(null);
    setValores({});
    setQtds({});
    setObservacoes({});
  };

  const enviarPreenchimento = async () => {
    setEnviando(true);
    const payload = itens.map(item => ({
        itemId: item.id,
        valor: valores[item.id] ? parseFloat(valores[item.id]) : 0, 
        quantidade: qtds[item.id] ? parseInt(qtds[item.id]) : 0, 
        observacao: observacoes[item.id] || ""
    }));

    try {
      await axios.put(`http://localhost:8081/responsavel-setor/preenchimentos/${comboSelecionado.id}`, payload, makeConfig());
      toast.success("Preenchimento salvo com sucesso!");
      fecharModal();
    } catch (error) {
      toast.error("Erro ao salvar preenchimento.");
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  const getPrazoTexto = (dataFim) => {
    if (!dataFim) return "Sem prazo";
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diffDias = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
    
    if (diffDias < 0) return "Vencido";
    if (diffDias === 0) return "Vence hoje";
    return `Vence em ${diffDias} dias`;
  };

  // --- NOVAS FUNÇÕES DE VALIDAÇÃO ---
  const handleQtdChange = (itemId, inputValue) => {
    // Impede números negativos
    if (inputValue < 0) return;
    setQtds({...qtds, [itemId]: inputValue});
  };

  const handleValorChange = (itemId, inputValue) => {
    // Impede números negativos
    if (inputValue < 0) return;
    setValores({...valores, [itemId]: inputValue});
  };
  // ----------------------------------

  return (
    <div className={styles.container}>
      <h3 className={styles.titulo}>
        <FaClipboardList className={styles.icone} /> Preencher Combos
      </h3>

      <div className={styles.filtroContainer}>
        <label>Filtrar por Setor:</label>
        <select 
            value={setorSelecionado} 
            onChange={(e) => filtrarPorSetor(e.target.value)}
            className={styles.selectSetor}
        >
            <option value="">Todos os meus setores</option>
            {setores.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
        </select>
      </div>

      <div className={styles.gridCombos}>
        {combos.length > 0 ? (
            combos.map(c => (
                <div key={c.id} className={styles.card} onClick={() => abrirModal(c)}>
                    <div className={styles.cardHeader}>
                        <span className={styles.badgeSetor}>{c.nomeSetor}</span>
                        <span className={styles.badgePrazo}>
                            <FaClock /> {getPrazoTexto(c.dataFim)}
                        </span>
                    </div>
                    <h4 className={styles.cardTitle}>{c.nomeCombo}</h4>
                    <p className={styles.cardInfo}>Clique para preencher</p>
                </div>
            ))
        ) : (
            <p className={styles.mensagemVazia}>Nenhum combo disponível para preenchimento.</p>
        )}
      </div>

      {isModalOpen && comboSelecionado && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>{comboSelecionado.nomeCombo}</h4>
            <p className={styles.modalSubtitulo}>{comboSelecionado.nomeSetor}</p>

            <div className={styles.listaItens}>
                {itens.map(item => (
                    <div key={item.id} className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                            <strong>{item.nomeItem}</strong>
                            <span>{item.descricao}</span>
                        </div>
                        <div className={styles.itemInputs}>
                            {/* CAMPO QUANTIDADE (VALIDADO) */}
                            <div className={styles.inputWrapper}>
                                <label>Qtd.</label>
                                <input 
                                    type="number" 
                                    min="0" // Proteção HTML
                                    placeholder="0"
                                    value={qtds[item.id] || ''}
                                    onChange={(e) => handleQtdChange(item.id, e.target.value)} // Proteção JS
                                    className={styles.inputSmall}
                                    onKeyDown={(e) => ["-", "e", "+"].includes(e.key) && e.preventDefault()} // Impede digitar sinais
                                />
                            </div>

                            {/* CAMPO VALOR (VALIDADO) */}
                            <div className={styles.inputWrapper}>
                                <label>Valor R$</label>
                                <input 
                                    type="number" 
                                    min="0" // Proteção HTML
                                    step="0.01"
                                    placeholder="0.00"
                                    value={valores[item.id] || ''}
                                    onChange={(e) => handleValorChange(item.id, e.target.value)} // Proteção JS
                                    className={styles.inputMedium}
                                    onKeyDown={(e) => ["-", "e", "+"].includes(e.key) && e.preventDefault()} // Impede digitar sinais
                                />
                            </div>
                            
                            {/* CAMPO OBSERVAÇÃO */}
                            <div className={`${styles.inputWrapper} ${styles.obsWrapper}`}>
                                <label>Observação</label>
                                <input 
                                    type="text" 
                                    placeholder="Opcional"
                                    value={observacoes[item.id] || ''}
                                    onChange={(e) => setObservacoes({...observacoes, [item.id]: e.target.value})}
                                    className={styles.inputObs}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {itens.length === 0 && <p>Carregando itens...</p>}
            </div>

            <div className={styles.modalFooter}>
              <button onClick={fecharModal} className={styles.botaoCancelar}>Cancelar</button>
              <button onClick={enviarPreenchimento} className={styles.botaoSalvar} disabled={enviando}>
                {enviando ? 'Salvando...' : 'Salvar Preenchimento'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default PreencherCombosSetor;