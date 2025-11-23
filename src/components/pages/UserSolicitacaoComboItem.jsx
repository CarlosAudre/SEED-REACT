import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./UserSolicitacaoComboItem.module.css";
import { jwtDecode } from "jwt-decode";

export function UserSolicitacaoComboItem() {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [form, setForm] = useState({
        tipo: "",
        nome: "",
        descricao: "",
        setor: "",
        estrutura: ""
    });

    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    // const userId = decoded.id ?? decoded.userId ?? decoded.sub; // não precisamos mais

    const makeConfig = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    // BUSCA AS SOLICITAÇÕES DO RESPONSÁVEL DO SETOR
    const carregarSolicitacoes = async () => {
        try {
            const resp = await axios.get(
                "http://localhost:8081/solicitacoes/responsavel-setor/me",
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

    // CRIA UMA NOVA SOLICITAÇÃO
    const criar = async (e) => {
        e.preventDefault();

        const dto = {
            tipo: form.tipo,
            nome: form.nome,
            descricao: form.descricao,
            setor: form.setor,
            estrutura: form.estrutura
            // solicitanteId não precisa mais
        };

        try {
            await axios.post(
                "http://localhost:8081/solicitacoes/responsavel-setor/criar",
                dto,
                makeConfig()
            );

            carregarSolicitacoes();
            setForm({
                tipo: "",
                nome: "",
                descricao: "",
                setor: "",
                estrutura: ""
            });
        } catch (err) {
            console.error("Erro ao criar solicitação", err);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Minhas Solicitações de Combos</h1>

            {/* FORM */}
            <form onSubmit={criar} className={styles.form}>
                <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className={styles.select}
                >
                    <option value="">Selecione o tipo</option>
                    <option value="COMBO">Combo</option>
                    <option value="ITEM">Item</option>
                </select>

                <input
                    placeholder="Nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />

                <textarea
                    placeholder="Descrição"
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />

                <input
                    placeholder="Setor"
                    value={form.setor}
                    onChange={(e) => setForm({ ...form, setor: e.target.value })}
                />

                <input
                    placeholder="Estrutura"
                    value={form.estrutura}
                    onChange={(e) => setForm({ ...form, estrutura: e.target.value })}
                />

                <button type="submit" className={styles.botaoCriar}>
                    Criar Solicitação
                </button>
            </form>

            {/* TABELA */}
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
                            <th>Data</th>
                            <th>Feedback</th>
                        </tr>
                    </thead>

                    <tbody>
                        {solicitacoes.length === 0 && (
                            <tr>
                                <td colSpan={8} className={styles.mensagemVazia}>
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
                                <td>{new Date(s.dataCriacao).toLocaleDateString()}</td>
                                <td>{s.feedbackAdm ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
