import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdmSolicitacaoComboItem.module.css";

export function AdmSolicitacaoComboItem() {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(""); // "aprovar" ou "rejeitar"
    const [currentId, setCurrentId] = useState(null);
    const [feedback, setFeedback] = useState("");

    const token = localStorage.getItem("token");

    const makeConfig = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    const carregarSolicitacoes = async () => {
        try {
            const resp = await axios.get(
                "http://localhost:8081/solicitacoes/adm",
                makeConfig()
            );
            setSolicitacoes(resp.data);
        } catch (err) {
            console.error("Erro ao carregar solicitações", err);
        }
    };

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    const enviarFeedback = async () => {
        if (!currentId || !modalAction) return;

        try {
            await axios.put(
                `http://localhost:8081/solicitacoes/adm/${modalAction}/${currentId}`,
                { feedbackAdm: feedback },
                makeConfig()
            );
            setModalOpen(false);
            setFeedback("");
            setCurrentId(null);
            setModalAction("");
            carregarSolicitacoes();
        } catch (err) {
            console.error("Erro ao enviar feedback", err);
        }
    };

    const abrirModal = (id, action) => {
        setCurrentId(id);
        setModalAction(action);
        setModalOpen(true);
    };

    const fecharModal = () => {
        setModalOpen(false);
        setFeedback("");
        setCurrentId(null);
        setModalAction("");
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Gerenciamento de Solicitações</h1>

            <div className={styles.tableWrapper}>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Status</th>
                            <th>Setor</th>
                            <th>Estrutura</th>
                            <th>Solicitante</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitacoes.length === 0 && (
                            <tr>
                                <td colSpan={9} className={styles.mensagemVazia}>
                                    Nenhuma solicitação encontrada
                                </td>
                            </tr>
                        )}

                        {solicitacoes.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.nome}</td>
                                <td>{s.tipo}</td>
                                <td>{s.descricao ?? "-"}</td>
                                <td
                                    className={
                                        s.status === "PENDENTE"
                                            ? styles.statusPendente
                                            : s.status === "APROVADA"
                                                ? styles.statusAprovada
                                                : styles.statusRejeitada
                                    }
                                >
                                    {s.status}
                                </td>
                                <td>{s.setor ?? "-"}</td>
                                <td>{s.estrutura ?? "-"}</td>
                                <td>{s.solicitanteNome ?? "-"}</td>
                                <td>
                                    {s.status === "PENDENTE" && (
                                        <>
                                            <button
                                                onClick={() => abrirModal(s.id, "aprovar")}
                                                className={styles.botaoAprovar}
                                            >
                                                Aprovar
                                            </button>
                                            <button
                                                onClick={() => abrirModal(s.id, "rejeitar")}
                                                className={styles.botaoRejeitar}
                                            >
                                                Rejeitar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{modalAction === "aprovar" ? "Aprovar" : "Rejeitar"} Solicitação</h2>
                        <textarea
                            placeholder="Digite o feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <div className={styles.modalButtons}>
                            <button onClick={enviarFeedback} className={styles.botaoAprovar}>
                                Enviar
                            </button>
                            <button onClick={fecharModal} className={styles.botaoRejeitar}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
