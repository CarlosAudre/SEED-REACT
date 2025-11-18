import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import styles from './Gerenciamento.module.css'; 
import {FaEdit, FaTrash} from 'react-icons/fa';

export default function GerenciarCompetencias() {
    const [competencias, setCompetencias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [edicao, setEdicao] = useState(null);

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
            setValue("dataInicio", comp.dataInicio.slice(0, 10)); // yyyy-MM-dd
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
                nome: dados.nome, // pegando o nome do input
                dataInicio: dataInicio.toISOString(),
                dataFim: dataFim.toISOString(),
                ano: dataInicio.getFullYear(),
                mes: String(dataInicio.getMonth() + 1).padStart(2, "0"),
                competenciaStatus: dados.competenciaStatus || "ABERTO" // caso não seja preenchido, default
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

            <div className={styles.containerBotaoTopo}>
                <button className={styles.botaoNovo} onClick={() => abrirModal()}>
                    + Nova Competência
                </button>
            </div>

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
                                <button onClick={() => abrirModal(c)} className={styles.botaoAcao}><FaEdit/></button>
                                <button onClick={() => deletar(c.id)} className={styles.botaoAcao}><FaTrash/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitulo}>
                            {edicao ? "Editar Competência" : "Nova Competência"}
                        </h3>

                        <form onSubmit={handleSubmit(salvar)}>
                            <div className={styles.formGroup}>
                                <label>Nome</label>
                                <input {...register("nome", { required: true })} />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Data de Início</label>
                                <input
                                    type="datetime-local"
                                    {...register("dataInicio", { required: true })}
                                    defaultValue={edicao?.dataInicio?.slice(0, 16)} // corta os segundos caso tenha
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Data de Fim</label>
                                <input
                                    type="datetime-local"
                                    {...register("dataFim", { required: true })}
                                    defaultValue={edicao?.dataFim?.slice(0, 16)}
                                />
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.botaoCancelar} onClick={fecharModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.botaoSalvar}>
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            <ToastContainer />
        </div>
    );
}
