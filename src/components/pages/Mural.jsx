// Mural.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // IMPORT CORRETO
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

  const gerarRelatorioPDF = () => {
    if (cards.length === 0) {
      alert("Não há dados para gerar relatório.");
      return;
    }

    const doc = new jsPDF("landscape");

    // 👉 Obtém o nome da competência a partir do primeiro card
    const nomeCompetencia = cards[0]?.competenciaNome || "Relatorio";

    // Título do PDF
    doc.text(`Relatório de ${nomeCompetencia}`, 14, 15);

    // Monta a tabela
    const tabela = cards.map((card) => [
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

    // Nome do arquivo usando a competência
    doc.save(`relatorio_${nomeCompetencia}.pdf`);
  };


  return (
    <div className={styles.container} style={{ marginTop: 25 }}>
      <h2 className={styles.titulo}>Mural</h2>

      {/* BOTÃO DE RELATÓRIO */}
      <button
        className={styles.botaoRelatorio}
        onClick={gerarRelatorioPDF}
        disabled={loading}
      >
        Baixar Relatório PDF
      </button>

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
        {cards.map((card) => (
          <article key={card.preenchimentoId} className={styles.card} tabIndex={0}>
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
                {card.comboNome ?? <span className={styles["combo-empty"]}>—</span>}
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
        ))}
      </div>

      {!loading && cards.length === 0 && (
        <p className={styles.vazio}>Nenhum card para esta competência.</p>
      )}
    </div>
  );
}
