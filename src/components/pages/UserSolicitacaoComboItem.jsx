import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./UserSolicitacaoComboItem.module.css";
import { jwtDecode } from "jwt-decode";

export function UserSolicitacaoComboItem() {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [setoresUsuario, setSetoresUsuario] = useState([]);
    const [form, setForm] = useState({
        tipo: "",
        nome: "",
        descricao: "",
        setor: "",
        estrutura: ""
    });

    const token = localStorage.getItem("token");
    const makeConfig = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    // BUSCA AS SOLICITAÇÕES DO USUÁRIO
    const carregarSolicitacoes = async () => {
        try {
            const resp = await axios.get(
                "https://ssge.onrender.com/solicitacoes/responsavel-setor/me",
                makeConfig()
            );
            setSolicitacoes(resp.data);
        } catch (err) {
            console.error("Erro ao carregar solicitações", err);
        }
    };

    // BUSCA OS SETORES DO USUÁRIO
    const carregarSetoresUsuario = async () => {
        try {
            const resp = await axios.get(
                "https://ssge.onrender.com/solicitacoes/responsavel-setor/setores",
                makeConfig()
            );
            setSetoresUsuario(resp.data);
        } catch (err) {
            console.error("Erro ao carregar setores do usuário", err);
        }
    };

    useEffect(() => {
        carregarSolicitacoes();
        carregarSetoresUsuario();
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
        };

        try {
            await axios.post(
                "https://ssge.onrender.com/solicitacoes/responsavel-setor/criar",
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

    // QUANDO MUDAR O SETOR, PREENCHER A ESTRUTURA AUTOMATICAMENTE
    const handleSetorChange = (e) => {
        const setorId = e.target.value;
        const setorSelecionado = setoresUsuario.find(s => s.id === parseInt(setorId));
        setForm({
            ...form,
            setor: setorId,
            estrutura: setorSelecionado ? setorSelecionado.estruturaId : ""
        });
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

                <select
                    value={form.setor}
                    onChange={handleSetorChange}
                    className={styles.select}
                >
                    <option value="">Selecione o setor</option>
                    {setoresUsuario.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.nome}
                        </option>
                    ))}
                </select>


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
                                <td>{s.setorNome ?? "-"}</td>
                                <td>{s.estruturaNome ?? "-"}</td>
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
