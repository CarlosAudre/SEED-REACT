import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import styles from './Gerenciamento.module.css'; 
import { FaEdit, FaTrash } from 'react-icons/fa';
import Mural from "./Mural";

export default function GerenciarCompetencias() {
    const [competencias, setCompetencias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [edicao, setEdicao] = useState(null);

    // 👉 Agora salva o objeto inteiro
    const [competenciaSelecionada, setCompetenciaSelecionada] = useState(null);

    const { register, handleSubmit, setValue, reset } = useForm();

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const buscarCompetencias = async () => {
        try {
            const r = await axios.get("http://localhost:8081/adm/competencias", config);
            setCompetencias(r.data);
        } catch (err) {
            toast.error("Erro ao buscar competências.");
        }
    };

    useEffect(() => {
        buscarCompetencias();
    }, []);

    const abrirModal = (comp = null) => {
        reset();
        setEdicao(comp);

        if (comp) {
            setValue("ano", comp.ano);
            setValue("mes", comp.mes);
            setValue("dataInicio", comp.dataInicio.slice(0, 10));
            setValue("dataFim", comp.dataFim.slice(0, 10));
            setValue("competenciaStatus", comp.competenciaStatus);
        }

        setIsModalOpen(true);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setEdicao(null);
        reset();
    };

    const salvar = async (dados) => {
        try {
            const dataInicio = new Date(dados.dataInicio);
            const dataFim = new Date(dados.dataFim);

            const payload = {
                nome: dados.nome,
                dataInicio: dataInicio.toISOString(),
                dataFim: dataFim.toISOString(),
                ano: dataInicio.getFullYear(),
                mes: String(dataInicio.getMonth() + 1).padStart(2, "0"),
                competenciaStatus: dados.competenciaStatus || "ABERTO"
            };

            if (edicao) {
                await axios.put(
                    `http://localhost:8081/adm/competencias/${edicao.id}`,
                    payload,
                    config
                );
                toast.success("Competência atualizada!");
            } else {
                await axios.post(
                    "http://localhost:8081/adm/competencias",
                    payload,
                    config
                );
                toast.success("Competência criada!");
            }

            fecharModal();
            buscarCompetencias();
        } catch (err) {
            toast.error("Erro ao salvar competência.");
            console.error(err);
        }
    };

    const deletar = async (id) => {
        if (!window.confirm("Deseja excluir a competência?")) return;

        try {
            await axios.delete(`http://localhost:8081/adm/competencias/${id}`, config);
            toast.success("Competência deletada!");
            buscarCompetencias();
        } catch {
            toast.error("Erro ao deletar.");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.titulo}>Gerenciar Competências</h2>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Ano</th>
                        <th>Mês</th>
                        <th>Início</th>
                        <th>Fim</th>
                        <th>Status</th>
                        <th className={styles.colunaAcoes}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {competencias.map((c) => (
                        <tr key={c.id}>
                            <td>{c.nome}</td>
                            <td>{c.ano}</td>
                            <td>{c.mes}</td>
                            <td>{c.dataInicio.slice(0, 10)}</td>
                            <td>{c.dataFim.slice(0, 10)}</td>
                            <td>{c.competenciaStatus}</td>
                            <td className={styles.acoes}>
                                
                                <button onClick={() => abrirModal(c)} className={styles.botaoAcao}>
                                    <FaEdit/>
                                </button>

                                <button onClick={() => deletar(c.id)} className={styles.botaoAcao}>
                                    <FaTrash/>
                                </button>

                                {/* BOTÃO PARA ABRIR O MURAL */}
                                <button 
                                    style={{ marginLeft: "5px" }}
                                    className={styles.botaoAcao}
                                    // 👉 Agora salva o objeto inteiro
                                    onClick={() => setCompetenciaSelecionada(c)}
                                >
                                    Mural
                                </button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MOSTRAR O MURAL */}
            {competenciaSelecionada && (
                <div style={{ marginTop: "35px" }}>
                    <h2>Mural da competência {competenciaSelecionada.nome}</h2>

                    {/* Passa só o id para o componente */}
                    <Mural competenciaId={competenciaSelecionada.id} />
                </div>
            )}

            <ToastContainer />
        </div>
    );
}
