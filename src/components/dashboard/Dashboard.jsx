import React from "react";
import {
    LineChart, Line, BarChart, Bar, Pie, PieChart,
    Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, Cell
} from "recharts";
import { dashboardMock as mock } from "../service/dashboardMock";
import styles from "./Dashboard.module.css";

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const palette = ["#5b8bff", "#7c6cff", "#ff9b6b", "#6fe7b3", "#ff6b8b"];

function sumArrays(arrays) {
    if (!arrays || arrays.length === 0) return Array(12).fill(0);
    return arrays.reduce((acc, cur) => acc.map((v, i) => v + (cur[i] || 0)), Array(12).fill(0));
}

export default function Dashboard() {
    const [escola, setEscola] = React.useState("all");
    const [ano, setAno] = React.useState(mock.anosDisponiveis[mock.anosDisponiveis.length - 1]);

    // cria lista de opções de escola
    const escolas = mock.escolas;

    // calcula dados agregados conforme seleção
    const aggregated = React.useMemo(() => {
        // se "all", soma todas as escolas
        if (escola === "all") {
            const schools = Object.keys(mock.dados);
            const alunosArrays = [];
            const gastosArrays = [];
            const folhaArrays = [];

            schools.forEach(sid => {
                const anos = mock.dados[sid];
                if (anos && anos[ano]) {
                    alunosArrays.push(anos[ano].alunos);
                    gastosArrays.push(anos[ano].gastos);
                    folhaArrays.push(anos[ano].folha);
                }
            });

            const alunos = sumArrays(alunosArrays);
            const gastos = sumArrays(gastosArrays);
            const folha = sumArrays(folhaArrays);

            return { alunos, gastos, folha };
        }

        // escola específica
        const data = mock.dados[escola] && mock.dados[escola][ano];
        if (!data) {
            return { alunos: Array(12).fill(0), gastos: Array(12).fill(0), folha: Array(12).fill(0) };
        }

        return { alunos: data.alunos.slice(), gastos: data.gastos.slice(), folha: data.folha.slice() };
    }, [escola, ano]);

    // dados para charts
    const lineData = meses.map((m, i) => {
        const alunos = aggregated.alunos[i] || 0;
        const gasto = aggregated.gastos[i] || 0;
        const folha = aggregated.folha[i] || 0;
        return {
            mes: m,
            gasto,
            alunos,
            gastoPorAluno: alunos > 0 ? +(gasto / alunos).toFixed(2) : 0,
            folha
        };
    });

    // KPIs (usamos o ano selecionado como base: soma dos 12 meses)
    const totalAlunos = aggregated.alunos.reduce((a, b) => a + b, 0);
    const gastoTotal = aggregated.gastos.reduce((a, b) => a + b, 0);
    const folhaTotal = aggregated.folha.reduce((a, b) => a + b, 0);
    const gastoPorAluno = totalAlunos > 0 ? gastoTotal / totalAlunos : 0;

    // dados para pie: distribuição por categoria simulada (baseado em folhas + "outros")
    // aqui a gente simula: folha vs funcionamento vs material (provisório)
    const pieData = [
        { name: "Folha", value: folhaTotal },
        { name: "Funcionamento", value: gastoTotal * 0.45 },
        { name: "Material", value: gastoTotal * 0.20 },
        { name: "Outros", value: gastoTotal * 0.35 - folhaTotal * 0 } // só balancear visual
    ];

    // transform bar data (gasto por mês)
    const barData = lineData.map(d => ({ mes: d.mes, gasto: d.gasto }));

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>Painel de Gestão Financeira</h1>
                        <p className={styles.subtitle}>Visão geral — filtra por escola e ano para analisar métricas</p>
                    </div>

                    <div className={styles.filters}>
                        <select value={escola} onChange={e => setEscola(e.target.value)} className={styles.select}>
                            {escolas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>

                        <select value={ano} onChange={e => setAno(Number(e.target.value))} className={styles.select}>
                            {mock.anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
                    <div className={styles.kpiLabel}>Total de alunos (ano)</div>
                    <div className={styles.kpiValue}>{totalAlunos.toLocaleString()}</div>
                    <div className={styles.kpiHint}>Soma dos alunos por mês no ano selecionado</div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
                    <div className={styles.kpiLabel}>Gasto total (ano)</div>
                    <div className={styles.kpiValue}>R$ {gastoTotal.toLocaleString()}</div>
                    <div className={styles.kpiHint}>Soma de todos os combos registrados no ano</div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                    <div className={styles.kpiLabel}>Gasto por aluno</div>
                    <div className={styles.kpiValue}>R$ {gastoPorAluno.toFixed(2)}</div>
                    <div className={styles.kpiHint}>Gasto total / total de alunos (ano)</div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiPink}`}>
                    <div className={styles.kpiLabel}>Gasto com folha (ano)</div>
                    <div className={styles.kpiValue}>R$ {folhaTotal.toLocaleString()}</div>
                    <div className={styles.kpiHint}>Valor total da folha cadastrado no ano</div>
                </div>
            </div>

            {/* Espaço entre KPIs e gráficos */}
            <div style={{ height: 6 }} />

            {/* Charts: Linha (esquerda) e Barra (direita) */}
            <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Evolução de gastos por aluno ({ano})</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineData}>
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip formatter={(v) => typeof v === "number" ? v.toLocaleString() : v} />
                            <Legend />
                            <Line type="monotone" dataKey="gastoPorAluno" name="Gasto por aluno" stroke={palette[0]} />
                            <Line type="monotone" dataKey="gasto" name="Gasto total (R$)" stroke={palette[1]} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Gasto total por mês ({ano})</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip formatter={(v) => v.toLocaleString()} />
                            <Bar dataKey="gasto" name="Gasto (R$)">
                                {barData.map((_, idx) => <Cell key={idx} fill={palette[idx % palette.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>       
        </div>
    );
}
