import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import { FaFilter, FaUsers, FaMoneyBillWave, FaBoxOpen, FaChartLine } from "react-icons/fa";
import styles from "./Dashboard.module.css";

const palette = ["#3b82f6", "#10b981"]; // Azul e Verde

export default function Dashboard() {
    const [competencias, setCompetencias] = useState([]);
    const [estruturas, setEstruturas] = useState([]);
    
    const [filtroCompetencia, setFiltroCompetencia] = useState("");
    const [filtroEstrutura, setFiltroEstrutura] = useState("");

    // 1. Dados dos Cards (Resumo)
    const [dadosResumo, setDadosResumo] = useState({
        totalAlunos: 0,
        gastoMateriais: 0,
        gastoPessoal: 0,
        custoTotal: 0,
        custoPorAluno: 0
    });

    // 2. Dados do Gráfico de Linha (Histórico)
    const [dadosHistorico, setDadosHistorico] = useState([]);

    const token = localStorage.getItem("token");
    const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

    // --- A. Carregar Filtros Iniciais ---
    useEffect(() => {
        async function carregarFiltros() {
            try {
                const [resComp, resEst] = await Promise.all([
                    axios.get('https://ssge.onrender.com/api/competencias', makeConfig()),
                    axios.get('https://ssge.onrender.com/api/estruturas?todas=true', makeConfig())
                ]);
                
                // Ordena competências por data
                const compsOrdenadas = resComp.data.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
                setCompetencias(compsOrdenadas);
                setEstruturas(resEst.data);
                
                // Se quiser carregar histórico inicial automaticamente:
                carregarHistorico(compsOrdenadas, "");
            } catch (error) {
                console.error("Erro filtros:", error);
            }
        }
        carregarFiltros();
    }, []);

    // --- B. Carregar Resumo (Cards) ---
    useEffect(() => {
        async function carregarResumo() {
            try {
                const params = new URLSearchParams();
                if (filtroCompetencia) params.append('competenciaId', filtroCompetencia);
                if (filtroEstrutura) params.append('estruturaId', filtroEstrutura);

                const res = await axios.get(`https://ssge.onrender.com/api/dashboard?${params.toString()}`, makeConfig());
                setDadosResumo(res.data);
            } catch (error) {
                console.error("Erro resumo:", error);
            }
        }
        carregarResumo();
    }, [filtroCompetencia, filtroEstrutura]);

    // --- C. Carregar Histórico (Gráfico de Linha) ---
    // Dispara quando muda a ESCOLA (mas ignora o filtro de mês, pois queremos ver o ano todo)
    useEffect(() => {
        if (competencias.length > 0) {
            carregarHistorico(competencias, filtroEstrutura);
        }
    }, [filtroEstrutura, competencias]);

    const carregarHistorico = async (listaCompetencias, idEscola) => {
        // Filtra apenas competências de 2025 (ou do ano atual) para não ficar gigante
        // Aqui estou pegando todas que vieram da API
        const anoAtual = new Date().getFullYear(); // 2025
        const mesesDoAno = listaCompetencias.filter(c => c.ano === anoAtual || c.ano === 2025);

        try {
            // Faz várias chamadas em paralelo (uma para cada mês)
            const promessas = mesesDoAno.map(comp => {
                const params = new URLSearchParams();
                params.append('competenciaId', comp.id);
                if (idEscola) params.append('estruturaId', idEscola);
                
                return axios.get(`https://ssge.onrender.com/api/dashboard?${params.toString()}`, makeConfig())
                    .then(res => ({
                        mes: comp.nome.split('/')[0], // Pega só "January" de "January/2025"
                        gasto: res.data.custoTotal,
                        alunos: res.data.totalAlunos
                    }));
            });

            const resultados = await Promise.all(promessas);
            setDadosHistorico(resultados);

        } catch (error) {
            console.error("Erro histórico:", error);
        }
    };

    const formatMoney = (val) => `R$ ${val?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Dados para Gráficos de Barras e Pizza (Baseado no Resumo Atual)
    const dadosPizza = [
        { name: "Materiais", value: dadosResumo.gastoMateriais },
        { name: "RH (Folha)", value: dadosResumo.gastoPessoal },
    ];
    const dadosBarra = [
        { name: "Gastos", Materiais: dadosResumo.gastoMateriais, RH: dadosResumo.gastoPessoal }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.headerRow}>
                <div>
                    <h1 className={styles.title}>Painel de Gestão Financeira</h1>
                    <p className={styles.subtitle}>Visão geral em tempo real.</p>
                </div>

                <div className={styles.filters}>
                    {/* Filtro de Mês (Afeta Cards e Pizza) */}
                    <div className={styles.selectWrapper}>
                        <FaFilter className={styles.filterIcon} />
                        <select 
                            value={filtroCompetencia} 
                            onChange={e => setFiltroCompetencia(e.target.value)} 
                            className={styles.select}
                        >
                            <option value="">Todos os Meses (Acumulado)</option>
                            {competencias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>

                    {/* Filtro de Escola (Afeta TUDO) */}
                    <div className={styles.selectWrapper}>
                        <FaFilter className={styles.filterIcon} />
                        <select 
                            value={filtroEstrutura} 
                            onChange={e => setFiltroEstrutura(e.target.value)} 
                            className={styles.select}
                        >
                            <option value="">Todas as Escolas</option>
                            {estruturas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
                    <div className={styles.kpiIcon}><FaUsers /></div>
                    <div>
                        <div className={styles.kpiLabel}>Total de Alunos</div>
                        <div className={styles.kpiValue}>{dadosResumo.totalAlunos?.toLocaleString()}</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
                    <div className={styles.kpiIcon}><FaMoneyBillWave /></div>
                    <div>
                        <div className={styles.kpiLabel}>Custo Total</div>
                        <div className={styles.kpiValue}>{formatMoney(dadosResumo.custoTotal)}</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                    <div className={styles.kpiIcon}><FaChartLine /></div>
                    <div>
                        <div className={styles.kpiLabel}>Custo por Aluno</div>
                        <div className={styles.kpiValue}>{formatMoney(dadosResumo.custoPorAluno)}</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiPink}`}>
                    <div className={styles.kpiIcon}><FaBoxOpen /></div>
                    <div>
                        <div className={styles.kpiLabel}>Gasto com Folha</div>
                        <div className={styles.kpiValue}>{formatMoney(dadosResumo.gastoPessoal)}</div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className={styles.chartsSection}>
                
                {/* 1. Evolução Mensal (NOVO - Usa dadosHistorico) */}
                <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}> 
                {/* span 2 faz ele ocupar a largura total em telas grandes */}
                    <div className={styles.chartTitle}>Evolução de Gastos (2025)</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dadosHistorico}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="mes" stroke="#b8c6db" />
                            <YAxis stroke="#b8c6db" tickFormatter={(v) => `R$${v}`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                formatter={(value) => formatMoney(value)} 
                            />
                            <Line type="monotone" dataKey="gasto" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} name="Gasto Total" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Pizza */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Distribuição do Orçamento</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dadosPizza}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={90}
                                paddingAngle={5} dataKey="value"
                            >
                                {dadosPizza.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatMoney(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Barras */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Comparativo: Materiais vs RH</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dadosBarra}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#b8c6db" hide />
                            <YAxis stroke="#b8c6db" />
                            <Tooltip formatter={(value) => formatMoney(value)} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="Materiais" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="RH" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>       
        </div>
    );
}