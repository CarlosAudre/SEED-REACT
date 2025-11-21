import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar,
  Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import styles from "./Dashboard.module.css";

// Cores do Mockup
const palette = ["#3b82f6", "#8b5cf6", "#10b981", "#f43f5e"];

export default function Dashboard() {
  // Filtros
  const [estruturas, setEstruturas] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [filtroEstrutura, setFiltroEstrutura] = useState("");
  const [filtroCompetencia, setFiltroCompetencia] = useState("");

  // Dados Reais (KPIs)
  const [dados, setDados] = useState({
    totalAlunos: 0,
    gastoMateriais: 0,
    gastoPessoal: 0,
    custoTotal: 0,
    custoPorAluno: 0
  });

  const token = localStorage.getItem("token");
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // 1. Carregar Filtros
  useEffect(() => {
    async function carregarFiltros() {
      try {
        const [resEst, resComp] = await Promise.all([
          axios.get('http://localhost:8081/api/estruturas', makeConfig()),
          axios.get('http://localhost:8081/api/competencias', makeConfig())
        ]);
        setEstruturas(resEst.data);
        setCompetencias(resComp.data);
      } catch (error) {
        console.error("Erro ao carregar filtros", error);
      }
    }
    carregarFiltros();
  }, []);

  // 2. Buscar Dados Reais
  useEffect(() => {
    async function carregarDashboard() {
      try {
        const params = new URLSearchParams();
        if (filtroEstrutura) params.append('estruturaId', filtroEstrutura);
        if (filtroCompetencia) params.append('competenciaId', filtroCompetencia);

        const res = await axios.get(`http://localhost:8081/api/dashboard?${params.toString()}`, makeConfig());
        setDados(res.data);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      }
    }
    carregarDashboard();
  }, [filtroEstrutura, filtroCompetencia]);

  const formatMoney = (val) => `R$ ${val?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // --- Dados Simulados para os Gráficos (Baseados no Total Real) ---
  // Como o back-end atual retorna um resumo total, distribuímos visualmente
  // para manter o layout da imagem enquanto não temos histórico mensal no back.
  const barData = [
    { name: 'Materiais', valor: dados.gastoMateriais },
    { name: 'Folha (RH)', valor: dados.gastoPessoal },
    { name: 'Total', valor: dados.custoTotal },
  ];

  const lineData = [
    { mes: 'Jan', gasto: 0 }, { mes: 'Fev', gasto: 0 }, { mes: 'Mar', gasto: 0 },
    { mes: 'Abr', gasto: 0 }, { mes: 'Mai', gasto: 0 }, { mes: 'Jun', gasto: 0 },
    { mes: 'Jul', gasto: 0 }, { mes: 'Ago', gasto: 0 }, { mes: 'Set', gasto: 0 },
    { mes: 'Out', gasto: 0 }, { mes: 'Nov', gasto: dados.custoTotal }, { mes: 'Dez', gasto: 0 }
  ];
  // ----------------------------------------------------------------

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Painel de Gestão Financeira</h1>
            <p className={styles.subtitle}>Visão geral — filtre por escola e ano para analisar métricas</p>
          </div>

          <div className={styles.filters}>
            <select 
                className={styles.select}
                value={filtroEstrutura}
                onChange={e => setFiltroEstrutura(e.target.value)}
            >
                <option value="">Todas as escolas</option>
                {estruturas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>

            <select 
                className={styles.select}
                value={filtroCompetencia}
                onChange={e => setFiltroCompetencia(e.target.value)}
            >
                <option value="">Todas as competências</option>
                {competencias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs - DADOS REAIS DO BANCO */}
      <div className={styles.kpiGrid}>
        
        {/* Card 1: Total de Alunos */}
        <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
          <div>
            <div className={styles.kpiLabel}>Total de alunos (Censo)</div>
            <div className={styles.kpiValue}>{dados.totalAlunos?.toLocaleString()}</div>
          </div>
          <div className={styles.kpiHint}>Soma dos alunos no período selecionado</div>
        </div>

        {/* Card 2: Gasto Total */}
        <div className={`${styles.kpiCard} ${styles.kpiPurple}`}>
          <div>
            <div className={styles.kpiLabel}>Gasto total</div>
            <div className={styles.kpiValue}>{formatMoney(dados.custoTotal)}</div>
          </div>
          <div className={styles.kpiHint}>Soma de todos os materiais e folhas</div>
        </div>

        {/* Card 3: Gasto por Aluno */}
        <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
          <div>
            <div className={styles.kpiLabel}>Gasto por aluno</div>
            <div className={styles.kpiValue}>{formatMoney(dados.custoPorAluno)}</div>
          </div>
          <div className={styles.kpiHint}>Gasto total / total de alunos</div>
        </div>

        {/* Card 4: Gasto com Folha */}
        <div className={`${styles.kpiCard} ${styles.kpiPink}`}>
          <div>
            <div className={styles.kpiLabel}>Gasto com folha</div>
            <div className={styles.kpiValue}>{formatMoney(dados.gastoPessoal)}</div>
          </div>
          <div className={styles.kpiHint}>Valor total da folha de RH</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className={styles.chartsSection}>
        
        {/* Gráfico de Linha */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Evolução de gastos (Visualização)</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="mes" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="gasto" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Comparativo de Categorias</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => formatMoney(value)}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}