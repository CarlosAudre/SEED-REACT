// Mural.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./Mural.module.css";

export default function Mural({ competenciaId }) {
  const [perfil, setPerfil] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarMural = async () => {
    if (!competenciaId) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8081/adm/mural/${competenciaId}`,
        {
          params: { perfil: perfil || undefined },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCards(response.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar mural.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarMural();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competenciaId, perfil]);

  // ---------------------------------------------------------------
  // PDF — SOMENTE PREENCHIMENTOS
  // ---------------------------------------------------------------
  const gerarRelatorioPDF = () => {
    const preenchimentos = cards.filter(c => c.tipo === "PREENCHIMENTO");

    if (preenchimentos.length === 0) {
      alert("Não há preenchimentos para gerar relatório.");
      return;
    }

    const doc = new jsPDF("landscape");
    const nomeCompetencia = preenchimentos[0]?.competenciaNome || "Relatorio";

    doc.text(`Relatório de ${nomeCompetencia}`, 14, 15);

    const tabela = preenchimentos.map((card) => [
      card.itemNome,
      card.usuarioNome,
      card.usuarioPerfil,
      card.estruturaNome,
      card.setorNome || "—",
      card.comboNome || "—",
      card.quantidade,
      `R$ ${Number(card.valor || 0).toFixed(2)}`,
      new Date(card.dataPreenchimento).toLocaleString("pt-BR"),
    ]);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Item",
          "Usuário",
          "Perfil",
          "Estrutura",
          "Setor",
          "Combo",
          "Qtd",
          "Valor",
          "Data",
        ],
      ],
      body: tabela,
    });

    doc.save(`relatorio_${nomeCompetencia}.pdf`);
  };

  // ---------------------------------------------------------------
  // PDF — SOMENTE CENSO
  // ---------------------------------------------------------------
  const gerarRelatorioCensoPDF = () => {
    const censos = cards.filter(c => c.tipo === "CENSO");

    if (censos.length === 0) {
      alert("Não há censos para gerar relatório.");
      return;
    }

    const doc = new jsPDF("landscape");
    const nomeCompetencia = censos[0]?.competenciaNome || "Relatorio_Censo";

    doc.text(`Relatório de Censo — ${nomeCompetencia}`, 14, 15);

    const tabela = censos.map((card) => [
      card.usuarioNome,
      card.usuarioPerfil,
      card.estruturaNome,
      card.quantidadeAlunos,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Usuário",
          "Perfil",
          "Estrutura",
          "Qtd. Alunos"
        ],
      ],
      body: tabela,
    });

    doc.save(`relatorio_censo_${nomeCompetencia}.pdf`);
  };




  // ---------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------
  return (
    <div className={styles.container} style={{ marginTop: 25 }}>
      <h2 className={styles.titulo}>Mural</h2>

      {/* BOTÃO DE RELATÓRIO */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className={styles.botaoRelatorio}
          onClick={gerarRelatorioPDF}
          disabled={loading}
        >
          Relatório Preenchimentos
        </button>

        <button
          className={styles.botaoRelatorio}
          onClick={gerarRelatorioCensoPDF}
          disabled={loading}
        >
          Relatório Censo
        </button>
      </div>


      {/* FILTRO */}
      <label className={styles.filtroLabel}>
        Filtrar por perfil:
        <select
          className={styles.filtroSelect}
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="RESPONSAVEL_SETOR">Gestor</option>
          <option value="RH">Recursos humanos</option>
        </select>
      </label>

      {loading && <p className={styles.loading}>Carregando mural...</p>}

      <div className={styles["card-grid"]} aria-live="polite">
        {cards.map((card) => {

          // ---------------------------------------------------------
          // CARD DE CENSO
          // ---------------------------------------------------------
          if (card.tipo === "CENSO") {
            return (
              <article key={`censo-${card.id}`} className={styles.card}>
                <div className={styles.topo}>
                  <h3 className={styles.cardTitle}>Censo</h3>
                </div>

                <div className={styles.infoLinha}>
                  <div className={styles.label}>Usuário:</div>
                  <div className={styles.value}>{card.usuarioNome}</div>
                </div>

                <div className={styles.infoLinha}>
                  <div className={styles.label}>Perfil:</div>
                  <div className={styles.value}>{card.usuarioPerfil}</div>
                </div>

                <div className={styles.infoLinha}>
                  <div className={styles.label}>Estrutura:</div>
                  <div className={styles.value}>{card.estruturaNome}</div>
                </div>

                <div className={styles.infoLinha}>
                  <div className={styles.label}>Quantidade de alunos:</div>
                  <div className={styles.valor}>{card.quantidadeAlunos}</div>
                </div>


              </article>
            );
          }


          // ---------------------------------------------------------
          // CARD DE PREENCHIMENTO
          // ---------------------------------------------------------
          return (
            <article
              key={`pre-${card.preenchimentoId}`}
              className={styles.card}
              tabIndex={0}
            >
              <div className={styles.topo}>
                <h3 className={styles.cardTitle}>{card.itemNome}</h3>
                <div className={styles.data}>
                  {new Date(card.dataPreenchimento).toLocaleString("pt-BR")}
                </div>
              </div>

              <div className={styles.infoLinha}>
                <div className={styles.label}>Usuário:</div>
                <div className={styles.value}>{card.usuarioNome}</div>
              </div>

              <div className={styles.infoLinha}>
                <div className={styles.label}>Perfil:</div>
                <div className={styles.value}>
                  <span className={styles.badge}>{card.usuarioPerfil}</span>
                </div>
              </div>

              <div className={styles.infoLinha}>
                <div className={styles.label}>Estrutura:</div>
                <div className={styles.value}>{card.estruturaNome}</div>
              </div>

              {card.setorNome && (
                <div className={styles.infoLinha}>
                  <div className={styles.label}>Setor:</div>
                  <div className={styles.value}>{card.setorNome}</div>
                </div>
              )}

              <div className={styles.infoLinha}>
                <div className={styles.label}>Combo:</div>
                <div className={styles.value}>
                  {card.comboNome ?? (
                    <span className={styles["combo-empty"]}>—</span>
                  )}
                </div>
              </div>

              <div className={styles.infoLinha}>
                <div className={styles.label}>Quantidade:</div>
                <div className={styles.value}>{card.quantidade}</div>
              </div>

              <div className={styles.infoLinha}>
                <div className={styles.label}>Valor:</div>
                <div className={`${styles.value} ${styles.valor}`}>
                  R$ {Number(card.valor ?? 0).toFixed(2)}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && cards.length === 0 && (
        <p className={styles.vazio}>Nenhum card para esta competência.</p>
      )}
    </div>
  );
}
