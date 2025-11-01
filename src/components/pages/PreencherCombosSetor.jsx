import { useEffect, useState } from "react";
import styles from "./PreencherCombosSetor.module.css";

function PreencherCombosSetor() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comboSelecionado, setComboSelecionado] = useState(null);

  useEffect(() => {
    async function carregarCombos() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:8081/responsavel-setor/combos", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao carregar combos");
        const data = await response.json();
        setCombos(data);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarCombos();
  }, []);

  function abrirModal(combo) {
    setComboSelecionado(combo);
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false);
    setComboSelecionado(null);
  }

  if (loading) {
    return <p className={styles.loading}>Carregando combos...</p>;
  }

  return (
    <div className={styles.container}>
      <h2>Combos Disponíveis</h2>

      <div className={styles.listaSetores}>
        {combos.length === 0 ? (
          <p>Nenhum combo encontrado.</p>
        ) : (
          combos.map((combo) => (
            <div
              key={combo.id}
              className={styles.itemSetor}
              onClick={() => abrirModal(combo)}
            >
              {combo.nomeCombo}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>{comboSelecionado?.nomeCombo}</h4>
            
            <div className={styles.modalMensagem}>
              🧩 Preenchimento em criação
            </div>

            <div className={styles.modalFooter}>
              <button onClick={fecharModal} className={styles.botaoCancelar}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreencherCombosSetor;
