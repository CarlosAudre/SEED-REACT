import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import { FaFilter, FaUsers, FaMoneyBillWave, FaBoxOpen, FaChartLine } from "react-icons/fa";
import styles from "./Dashboard.module.css";

const palette = ["#3b82f6", "#10b981"]; // Azul e Verde para os gráficos

export default function Dashboard() {
    // Filtros
    const [competencias, setCompetencias] = useState([]);
    const [estruturas, setEstruturas] = useState([]);
    const [filtroCompetencia, setFiltroCompetencia] = useState("");
    const [filtroEstrutura, setFiltroEstrutura] = useState("");

    // Dados Reais (Inicializados com 0 para não quebrar)
    const [dados, setDados] = useState({
        totalAlunos: 0,
        gastoMateriais: 0,
        gastoPessoal: 0,
        custoTotal: 0,
        custoPorAluno: 0
    });

    const token = localStorage.getItem("token");
    const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

    // 1. Carregar Filtros (Dropdowns)
    useEffect(() => {
        async function carregarFiltros() {
            try {
                const [resComp, resEst] = await Promise.all([
                    axios.get('https://ssge.onrender.com/api/competencias', makeConfig()),
                    axios.get('https://ssge.onrender.com/api/estruturas?todas=true', makeConfig()) // Usa ?todas=true se for ADM
                ]);
                setCompetencias(resComp.data);
                setEstruturas(resEst.data);
            } catch (error) {
                console.error("Erro ao carregar filtros:", error);
            }
        }
        carregarFiltros();
    }, []);

    // 2. Buscar Dados do Dashboard (Sempre que mudar o filtro)
    useEffect(() => {
        async function carregarDashboard() {
            try {
                const params = new URLSearchParams();
                if (filtroCompetencia) params.append('competenciaId', filtroCompetencia);
                if (filtroEstrutura) params.append('estruturaId', filtroEstrutura);

                const res = await axios.get(`https://ssge.onrender.com/api/dashboard?${params.toString()}`, makeConfig());
                
                // Proteção contra nulos da API
                setDados({
                    totalAlunos: res.data.totalAlunos || 0,
                    gastoMateriais: res.data.gastoMateriais || 0,
                    gastoPessoal: res.data.gastoPessoal || 0,
                    custoTotal: res.data.custoTotal || 0,
                    custoPorAluno: res.data.custoPorAluno || 0
                });
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            }
        }
        carregarDashboard();
    }, [filtroCompetencia, filtroEstrutura]);

    // 3. Preparar dados para os Gráficos
    const dadosGraficoPizza = [
        { name: "Materiais", value: dados.gastoMateriais },
        { name: "RH (Folha)", value: dados.gastoPessoal },
    ];

    // Gráfico comparativo simples
    const dadosGraficoBarra = [
        { name: "Gastos", Materiais: dados.gastoMateriais, RH: dados.gastoPessoal }
    ];

    const formatMoney = (val) => `R$ ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.headerRow}>
                <div>
                    <h1 className={styles.title}>Painel de Gestão Financeira</h1>
                    <p className={styles.subtitle}>Visão geral em tempo real baseada nos dados lançados.</p>
                </div>

                <div className={styles.filters}>
                    <div className={styles.selectWrapper}>
                        <FaFilter className={styles.filterIcon} />
                        <select 
                            value={filtroCompetencia} 
                            onChange={e => setFiltroCompetencia(e.target.value)} 
                            className={styles.select}
                        >
                            <option value="">Todas as Competências</option>
                            {competencias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>

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
                        <div className={styles.kpiValue}>{Number(dados.totalAlunos || 0).toLocaleString()}</div>
                        <div className={styles.kpiHint}>Matriculados no período</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
                    <div className={styles.kpiIcon}><FaMoneyBillWave /></div>
                    <div>
                        <div className={styles.kpiLabel}>Custo Total</div>
                        <div className={styles.kpiValue}>{formatMoney(dados.custoTotal)}</div>
                        <div className={styles.kpiHint}>Materiais + Folha</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                    <div className={styles.kpiIcon}><FaChartLine /></div>
                    <div>
                        <div className={styles.kpiLabel}>Custo por Aluno</div>
                        <div className={styles.kpiValue}>{formatMoney(dados.custoPorAluno)}</div>
                        <div className={styles.kpiHint}>Média de investimento</div>
                    </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiPink}`}>
                    <div className={styles.kpiIcon}><FaBoxOpen /></div>
                    <div>
                        <div className={styles.kpiLabel}>Gasto com Folha</div>
                        <div className={styles.kpiValue}>{formatMoney(dados.gastoPessoal)}</div>
                        <div className={styles.kpiHint}>Recursos Humanos</div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className={styles.chartsSection}>
                
                {/* Gráfico 1: Distribuição Pizza */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Distribuição do Orçamento</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dadosGraficoPizza}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dadosGraficoPizza.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatMoney(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico 2: Barras Comparativas */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Comparativo: Materiais vs RH</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dadosGraficoBarra}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#b8c6db" hide />
                            <YAxis stroke="#b8c6db" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                formatter={(value) => formatMoney(value)} 
                                cursor={{fill: 'transparent'}} 
                            />
                            <Legend />
                            <Bar dataKey="Materiais" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="RH" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>       
        </div>
    );
}