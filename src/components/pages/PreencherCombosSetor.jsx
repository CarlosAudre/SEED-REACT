import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClipboardList, FaClock, FaBuilding, FaArrowLeft, FaExchangeAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './PreencherCombosSetor.module.css';

function PreencherCombosSetor() {
  // Dados Gerais
  const [setores, setSetores] = useState([]);
  const [setorAtivo, setSetorAtivo] = useState(null); // O setor que o usuário escolheu trabalhar
  const [combos, setCombos] = useState([]);
  
  // States do Modal de Preenchimento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comboSelecionado, setComboSelecionado] = useState(null);
  const [itens, setItens] = useState([]);
  
  // Dados do formulário
  const [valores, setValores] = useState({}); 
  const [qtds, setQtds] = useState({});       
  const [observacoes, setObservacoes] = useState({});
  const [enviando, setEnviando] = useState(false);

  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });
  const baseUrl = "https://sua-api-no-render.onrender.com/responsavel-setor/combos";

  // 1. Ao abrir, carrega APENAS os setores do usuário
  useEffect(() => {
    async function carregarMeusSetores() {
      try {
        const res = await axios.get(`${baseUrl}/setores`, makeConfig());
        const listaSetores = res.data;
        setSetores(listaSetores);

        // Se o usuário só tem 1 setor, entra automático
        if (listaSetores.length === 1) {
            selecionarSetor(listaSetores[0]);
        }
      } catch (error) {
        console.error("Erro:", error);
        toast.error("Erro ao carregar seus setores.");
      }
    }
    carregarMeusSetores();
  }, []);

  // 2. Função para Escolher o Setor e Carregar os Combos dele
  const selecionarSetor = async (setor) => {
    setSetorAtivo(setor);
    try {
      const res = await axios.get(`${baseUrl}/setor/${setor.id}`, makeConfig());
      setCombos(ordenarCombos(res.data));
    } catch (error) {
      toast.error("Erro ao carregar kits deste setor.");
    }
  };

  const trocarSetor = () => {
    setSetorAtivo(null);
    setCombos([]);
  };

  const ordenarCombos = (lista) => {
    return lista.sort((a, b) => {
      const dateA = new Date(a.dataFim || a.dataEnvio);
      const dateB = new Date(b.dataFim || b.dataEnvio);
      return dateA - dateB;
    });
  };

  // --- Lógica do Modal (Igual a antes) ---
  const abrirModal = async (combo) => {
    setComboSelecionado(combo);
    setIsModalOpen(true);
    setItens([]);
    try {
      const resItens = await axios.get(`${baseUrl}/${combo.comboId}/itens`, makeConfig());
      setItens(resItens.data);
      const resPreench = await axios.get(`https://sua-api-no-render.onrender.com/responsavel-setor/preenchimentos/${combo.id}`, makeConfig());
      
      const novosValores = {}; const novasQtds = {}; const novasObs = {};
      if (resPreench.data && resPreench.data.length > 0) {
        resPreench.data.forEach(p => {
            novosValores[p.itemId] = p.valor;
            novasQtds[p.itemId] = p.quantidade; 
            novasObs[p.itemId] = p.observacao || "";
        });
      }
      setValores(novosValores); setQtds(novasQtds); setObservacoes(novasObs);
    } catch (error) { toast.error("Erro ao carregar detalhes."); }
  };

  const fecharModal = () => {
    setIsModalOpen(false); setComboSelecionado(null); setValores({}); setQtds({}); setObservacoes({});
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
      await axios.put(`https://sua-api-no-render.onrender.com/responsavel-setor/preenchimentos/${comboSelecionado.id}`, payload, makeConfig());
      toast.success("Salvo com sucesso!");
      fecharModal();
    } catch (error) { toast.error("Erro ao salvar."); } finally { setEnviando(false); }
  };

  const getPrazoTexto = (dataFim) => {
    if (!dataFim) return "Sem prazo";
    const hoje = new Date(); const fim = new Date(dataFim);
    const diffDias = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return "Vencido";
    if (diffDias === 0) return "Vence hoje";
    return `Vence em ${diffDias} dias`;
  };

  // Handlers de input
  const handleQtdChange = (id, val) => val >= 0 && setQtds({...qtds, [id]: val});
  const handleValorChange = (id, val) => val >= 0 && setValores({...valores, [id]: val});


  // --- RENDERIZAÇÃO ---

  // TELA 1: SELEÇÃO DE SETOR (Se nenhum estiver ativo)
  if (!setorAtivo) {
    return (
        <div className={styles.containerSelect}>
            <h2 className={styles.tituloSelect}>Onde você vai trabalhar hoje?</h2>
            <p className={styles.subtituloSelect}>Selecione o setor para visualizar os kits disponíveis.</p>
            
            <div className={styles.gridSetores}>
                {setores.map(setor => (
                    <div key={setor.id} className={styles.cardSetor} onClick={() => selecionarSetor(setor)}>
                        <FaBuilding className={styles.iconSetor} />
                        <h3>{setor.nome}</h3>
                        <p>Clique para acessar</p>
                    </div>
                ))}
                {setores.length === 0 && <p>Você não está vinculado a nenhum setor.</p>}
            </div>
            <ToastContainer />
        </div>
    );
  }

  // TELA 2: LISTA DE KITS (Se um setor estiver ativo)
  return (
    <div className={styles.container}>
      <div className={styles.headerTopo}>
         <button onClick={trocarSetor} className={styles.botaoVoltar}>
            <FaExchangeAlt /> Trocar Setor
         </button>
         <div className={styles.infoSetor}>
            Setor: <strong>{setorAtivo.nome}</strong>
         </div>
      </div>

      <h3 className={styles.titulo}>
        <FaClipboardList className={styles.icone} /> Kits Disponíveis
      </h3>

      <div className={styles.gridCombos}>
        {combos.length > 0 ? (
            combos.map(c => (
                <div key={c.id} className={styles.card} onClick={() => abrirModal(c)}>
                    <div className={styles.cardHeader}>
                        <span className={styles.badgeSetor}>{c.nomeCombo.substring(0, 3).toUpperCase()}</span>
                        <span className={styles.badgePrazo}>
                            <FaClock /> {getPrazoTexto(c.dataFim)}
                        </span>
                    </div>
                    <h4 className={styles.cardTitle}>{c.nomeCombo}</h4>
                    <p className={styles.cardInfo}>Clique para preencher</p>
                </div>
            ))
        ) : (
            <p className={styles.mensagemVazia}>Nenhum kit disponível para este setor.</p>
        )}
      </div>

      {/* Modal de Preenchimento (Mantido Igual) */}
      {isModalOpen && comboSelecionado && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>{comboSelecionado.nomeCombo}</h4>
            <p className={styles.modalSubtitulo}>{setorAtivo.nome}</p>

            <div className={styles.listaItens}>
                {itens.map(item => (
                    <div key={item.id} className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                            <strong>{item.nomeItem}</strong>
                            <span>{item.descricao}</span>
                        </div>
                        <div className={styles.itemInputs}>
                            <div className={styles.inputWrapper}>
                                <label>Qtd.</label>
                                <input 
                                    type="number" min="0" placeholder="0"
                                    value={qtds[item.id] || ''}
                                    onChange={(e) => handleQtdChange(item.id, e.target.value)}
                                    className={styles.inputSmall}
                                />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label>Valor R$</label>
                                <input 
                                    type="number" min="0" step="0.01" placeholder="0.00"
                                    value={valores[item.id] || ''}
                                    onChange={(e) => handleValorChange(item.id, e.target.value)}
                                    className={styles.inputMedium}
                                />
                            </div>
                            <div className={`${styles.inputWrapper} ${styles.obsWrapper}`}>
                                <label>Observação</label>
                                <input 
                                    type="text" placeholder="Opcional"
                                    value={observacoes[item.id] || ''}
                                    onChange={(e) => setObservacoes({...observacoes, [item.id]: e.target.value})}
                                    className={styles.inputObs}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={fecharModal} className={styles.botaoCancelar}>Cancelar</button>
              <button onClick={enviarPreenchimento} className={styles.botaoSalvar} disabled={enviando}>
                {enviando ? 'Salvando...' : 'Salvar'}
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