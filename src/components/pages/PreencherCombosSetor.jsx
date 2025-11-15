import { useEffect, useState, useEffect as useEff } from "react";
import styles from "./PreencherCombosSetor.module.css";

export default function PreencherCombosSetor() {
  const [combos, setCombos] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comboSelecionado, setComboSelecionado] = useState(null);
  const [valores, setValores] = useState({});
  const [observacoes, setObservacoes] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregandoItens, setCarregandoItens] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function carregarCombos() {
      try {
        const response = await fetch("http://localhost:8081/responsavel-setor/combos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erro ao carregar combos");
        const data = await response.json();

        // ordena usando dataFim quando disponível, senão dataEnvio
        const sorted = data.sort((a, b) => {
          const aKey = a.dataFim || a.dataEnvio || 0;
          const bKey = b.dataFim || b.dataEnvio || 0;
          return new Date(aKey) - new Date(bKey); // mais próximo/prazo primeiro
        });

        setCombos(sorted);
      } catch (e) {
        console.error("Erro ao buscar combos:", e);
      } finally {
        setLoading(false);
      }
    }
    carregarCombos();
  }, [token]);

  // fecha modal ao apertar ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") fecharModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [comboSelecionado]);

  function diasRestantes(isoDate) {
    if (!isoDate) return null;
    const fim = new Date(isoDate);
    const now = new Date();
    const diff = fim - now;
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (dias > 1) return `${dias} dias`;
    if (dias === 1) return "1 dia";
    if (dias === 0) return "Hoje";
    return `${Math.abs(dias)}d atrasado`;
  }

  function prazoStatus(isoDate) {
    if (!isoDate) return { label: "Sem prazo", color: "neutral" };
    const fim = new Date(isoDate);
    const now = new Date();
    if (fim < now) return { label: "Vencido", color: "danger" };
    const dias = Math.ceil((fim - now) / (1000 * 60 * 60 * 24));
    if (dias <= 3) return { label: `${dias}d`, color: "warning" };
    return { label: dias <= 14 ? `${dias}d` : "OK", color: "ok" };
  }

  async function abrirCombo(comboDestino) {
    try {
      setComboSelecionado(comboDestino);
      const comboId = comboDestino.comboId;
      const comboDestinoId = comboDestino.id;

      if (!comboId) {
        alert("Combo inválido.");
        return;
      }

      setCarregandoItens(true);
      const responseItens = await fetch(
        `http://localhost:8081/responsavel-setor/combos/${comboId}/itens`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!responseItens.ok) throw new Error("Erro ao buscar itens");
      const dataItens = await responseItens.json();
      setItens(dataItens);
      setCarregandoItens(false);

      const responsePreench = await fetch(
        `http://localhost:8081/responsavel-setor/preenchimentos/${comboDestinoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (responsePreench.ok) {
        const preenchidos = await responsePreench.json();
        if (preenchidos.length > 0) {
          const novosValores = {};
          const novasObs = {};
          preenchidos.forEach((p) => {
            novosValores[p.itemId] = p.valor;
            novasObs[p.itemId] = p.observacao || "";
          });
          setValores(novosValores);
          setObservacoes(novasObs);
          setModoEdicao(true);
        } else {
          // garante limpar caso não tenha preenchimento
          setValores({});
          setObservacoes({});
          setModoEdicao(false);
        }
      }
    } catch (e) {
      setCarregandoItens(false);
      console.error("Erro ao buscar dados do combo:", e);
      alert("Erro ao carregar o combo.");
    }
  }

  function handleChangeValor(itemId, valor) {
    setValores((prev) => ({ ...prev, [itemId]: valor }));
  }

  function handleChangeObs(itemId, obs) {
    setObservacoes((prev) => ({ ...prev, [itemId]: obs }));
  }

  async function enviarPreenchimento() {
    if (!comboSelecionado) return;
    const comboDestinoId = comboSelecionado.id;
    const preenchimentos = itens.map((item) => ({
      itemId: item.id,
      valor: parseFloat(valores[item.id] || 0),
      observacao: observacoes[item.id] || "",
    }));

    try {
      setEnviando(true);
      const metodo = modoEdicao ? "PUT" : "POST";
      const response = await fetch(
        `http://localhost:8081/responsavel-setor/preenchimentos/${comboDestinoId}`,
        {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(preenchimentos),
        }
      );

      if (!response.ok) throw new Error("Erro ao enviar preenchimentos");
      alert(modoEdicao ? "Preenchimento atualizado!" : "Preenchimento enviado com sucesso!");
      fecharModal();
    } catch (e) {
      console.error("Erro ao enviar:", e);
      alert("Erro ao enviar os dados.");
    } finally {
      setEnviando(false);
    }
  }

  function fecharModal() {
    setComboSelecionado(null);
    setItens([]);
    setModoEdicao(false);
    setValores({});
    setObservacoes({});
  }

  if (loading) return <p className={styles.empty}>Carregando combos...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.hdr}>
        <div className={styles.hdrLeft}>
          <h2 className={styles.title}>Combos destinados ao seu setor</h2>
          <div className={styles.subtitle}>Prazo destacado — escolha o combo e preencha os itens</div>
        </div>
      </div>

      {combos.length === 0 ? (
        <div className={styles.empty}>Nenhum combo encontrado.</div>
      ) : (
        <div className={styles.listaCombos}>
          {combos.map((comboDestino) => {
            // usar dataFim direto do DTO
            const prazoCompetencia = comboDestino.dataFim;
            const prazo = prazoStatus(prazoCompetencia);

            return (
              <div
                key={`${comboDestino.id}-${comboDestino.comboId}`}
                className={styles.itemCombo}
                onClick={() => abrirCombo(comboDestino)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') abrirCombo(comboDestino); }}
                aria-label={`Abrir combo ${comboDestino.nomeCombo}`}
              >
                <div className={styles.itemHeader}>
                  <div className={styles.badge}>{(comboDestino.nomeCombo || "").slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <h3 className={styles.comboTitle}>{comboDestino.nomeCombo || "Sem nome"}</h3>
                    <p className={styles.comboDesc}>{comboDestino.nomeSetor || ""}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: 12,
                      color: prazo.color === "danger" ? "#ffb4b4" : (prazo.color === "warning" ? "#ffd8a8" : "#b8d6ff"),
                      fontWeight: 800
                    }}>{prazo.label}</div>
                    <div style={{ fontSize: 11, color: "#9fb1d2" }}>
                      {prazoCompetencia ? new Date(prazoCompetencia).toLocaleDateString('pt-BR') : 'Sem prazo'}
                    </div>
                  </div>
                </div>

                <div className={styles.itemFooter}>
                  <div className={styles.meta}>
                    {prazoCompetencia
                      ? `Prazo: ${diasRestantes(prazoCompetencia)}`
                      : (comboDestino.dataEnvio ? `Enviado: ${new Date(comboDestino.dataEnvio).toLocaleDateString('pt-BR')}` : '')
                    }
                  </div>
                  <button className={styles.openBtn} onClick={(e) => { e.stopPropagation(); abrirCombo(comboDestino); }}>
                    Abrir
                  </button>
                </div>
              </div>
            );
          })}


        </div>
      )}

      {comboSelecionado && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalPreenchimento} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div>
                  <h3 className={styles.modalTitle}>{comboSelecionado.nomeCombo}</h3>
                  <div className={styles.modalSub}>
                    {comboSelecionado.nomeSetor} •{" "}
                    {comboSelecionado.dataFim
                      ? `Prazo: ${new Date(comboSelecionado.dataFim).toLocaleDateString("pt-BR")}`
                      : comboSelecionado.dataEnvio
                        ? `Enviado: ${new Date(comboSelecionado.dataEnvio).toLocaleDateString("pt-BR")}`
                        : ""}
                    {comboSelecionado.dataFim && new Date(comboSelecionado.dataFim) < new Date() && (
                      <span style={{ color: "#ffb4b4", marginLeft: 8 }}>• Vencido</span>
                    )}
                  </div>
                </div>

                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={fecharModal}
                  aria-label="Voltar"
                  style={{
                    padding: "6px 10px",
                    minWidth: 48,
                    fontSize: 18,
                    fontWeight: 600,
                    borderRadius: 10,
                  }}
                >
                  ←
                </button>
              </div>
            </div>


            {carregandoItens ? (
              <div style={{ padding: 16, color: "#b8c6db" }}>Carregando itens...</div>
            ) : (
              <div className={styles.tabelaItens}>
                {itens.map((item) => (
                  <div key={item.id} className={styles.itemLinha}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemNome}>{item.nomeItem}</div>
                      <div className={styles.itemTipo}>{item.tipoDado ? item.tipoDado : ""}</div>
                    </div>

                    <input
                      type="number"
                      className={styles.inputCampo}
                      placeholder="Valor"
                      value={valores[item.id] || ""}
                      onChange={(e) => handleChangeValor(item.id, e.target.value)}
                    />
                    <input
                      type="text"
                      className={styles.inputCampo}
                      placeholder="Observação (opcional)"
                      value={observacoes[item.id] || ""}
                      onChange={(e) => handleChangeObs(item.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={styles.modalAcoes}>
              <div className={styles.auxInfo}>{itens.length} item(s) • {comboSelecionado.dataFim ? `Prazo: ${diasRestantes(comboSelecionado.dataFim)}` : 'Sem prazo'}</div>
              <div className={styles.actionGroup}>
                {/* Limpar modo agora limpa os campos e desliga o modo de edição, sem fechar modal */}
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => {
                    setModoEdicao(false);
                    setValores({});
                    setObservacoes({});
                  }}
                  disabled={enviando}
                >
                  Limpar campos
                </button>

                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={enviarPreenchimento} disabled={enviando}>
                  {enviando ? "Enviando..." : (modoEdicao ? "Editar Preenchimento" : "Enviar Preenchimento")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
