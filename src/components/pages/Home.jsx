// src/components/pages/Home.js

import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import styles from "./Home.module.css";
import { FaUserCheck, FaBoxOpen, FaFolderOpen, FaBuilding, FaClipboardList, FaTags } from "react-icons/fa";

function Home() {
  const [userRole, setUserRole] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // aceita tanto string quanto array (só por segurança)
        let role = decoded.role ?? decoded.roles ?? decoded.Roles ?? null;

        if (Array.isArray(role)) {
          // caso o claim venha como array, pega prioridade ADM > RESPONSAVEL_SETOR > USER
          if (role.includes("ADM")) role = "ADM";
          else if (role.includes("RESPONSAVEL_SETOR")) role = "RESPONSAVEL_SETOR";
          else role = role[0] || "USER";
        }

        // normaliza pra tipos que a gente usa
        if (role === "ADM") setUserRole("ADM");
        else if (role === "RESPONSAVEL_SETOR") setUserRole("RESPONSAVEL_SETOR");
        else setUserRole("USER");
      } catch (error) {
        console.error("Token inválido:", error);
        setUserRole("GUEST");
      }
    } else {
      setUserRole("GUEST");
    }
  }, []);

  const renderAdminDashboard = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel do Administrador</h1>
      <p className={styles.subtitle}>Selecione uma das opções abaixo para gerenciar o sistema.</p>
      
      <div className={styles.dashboardGrid}>
        
        <Link to="/solicitacoes-acesso" className={styles.card}>
          <FaUserCheck className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Aprovar Acessos</h3>
          <p className={styles.cardText}>Gerencie as solicitações de acesso de novos usuários.</p>
        </Link>
        
        {/* --- NOVO CARD --- */}
        <Link to="/adm/classificacoes" className={styles.card}>
          <FaTags className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Classificações</h3>
          <p className={styles.cardText}>Defina as categorias para os itens (Ex: Eletrônicos).</p>
        </Link>

        <Link to="/adm/itens" className={styles.card}>
          <FaBoxOpen className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Itens</h3>
          <p className={styles.cardText}>Crie e edite os materiais disponíveis para solicitação.</p>
        </Link>
        
        <Link to="/adm/combos" className={styles.card}>
          <FaFolderOpen className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Kits</h3>
          <p className={styles.cardText}>Monte os kits de solicitação e adicione itens a eles.</p>
        </Link>
        
        <Link to="/adm/estruturas" className={styles.card}>
          <FaBuilding className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Estruturas</h3>
          <p className={styles.cardText}>Configure as escolas, prédios e setores da instituição.</p>
        </Link>

      </div>
    </div>
  );

  const renderResponsavelSetor = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel - Responsável de Setor</h1>
      <p className={styles.subtitle}>Aqui você preenche os combos enviados para o seu setor.</p>

      <div className={styles.dashboardGrid}>
        <Link to="/responsavel-setor/preenchimento" className={styles.card}>
          <FaClipboardList className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Preencher Combos do Setor</h3>
          <p className={styles.cardText}>Abra a página para preencher os itens dos combos alocados no seu setor.</p>
        </Link>

        {/* Se quiser, pode repetir cards úteis pro responsavel aqui */}
      </div>
    </div>
  );

  const renderDefaultHome = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Bem-vindo(a) ao Portal da Escola</h1>
      <p className={styles.subtitle}>Aqui você poderá solicitar materiais e acompanhar seus pedidos.</p>
    </div>
  );

  if (userRole === null) return <div className={styles.container}>Carregando...</div>;

  if (userRole === "ADM") return renderAdminDashboard();
  if (userRole === "RESPONSAVEL_SETOR") return renderResponsavelSetor();
  return renderDefaultHome();
}

export default Home;
