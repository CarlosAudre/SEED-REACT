// src/components/pages/Home.js

import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import styles from "./Home.module.css";
import { 
  FaUserCheck, FaBoxOpen, FaFolderOpen, FaBuilding, FaClipboardList, 
  FaTags, FaUsersCog, FaUserPlus, FaUserTag, FaUsers, FaMoneyBillWave 
} from "react-icons/fa";

function Home() {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.sub); // Pega o email/nome do usuário

        // Lógica robusta para encontrar a role
        let roleClaim = decoded.role ?? decoded.roles ?? decoded.authorities ?? decoded.Roles ?? decoded.Authorities ?? null;
        let finalRole = "USER";

        // Função auxiliar para verificar a role
        const checkRole = (roleToCheck) => {
          if (Array.isArray(roleClaim)) {
             return roleClaim.includes(roleToCheck) || roleClaim.includes(`ROLE_${roleToCheck}`);
          } else if (typeof roleClaim === 'string') {
             return roleClaim === roleToCheck || roleClaim === `ROLE_${roleToCheck}`;
          }
          return false;
        };

        if (checkRole("ADM")) {
            finalRole = "ADM";
        } else if (checkRole("DIRETOR")) {
            finalRole = "DIRETOR";
        } else if (checkRole("RH")) {
            finalRole = "RH";
        } else if (checkRole("RESPONSAVEL_SETOR")) {
            finalRole = "RESPONSAVEL_SETOR";
        }
        
        setUserRole(finalRole);

      } catch (error) {
        console.error("Token inválido:", error);
        setUserRole("GUEST");
      }
    } else {
      setUserRole("GUEST");
    }
  }, []);

  // --- 1. Painel do ADM ---
  const renderAdminDashboard = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel do Administrador</h1>
      <p className={styles.subtitle}>Bem-vindo(a), {userName}. Gerencie o sistema abaixo.</p>
      
      <div className={styles.dashboardGrid}>
        <Link to="/solicitacoes-acesso" className={styles.card}>
          <FaUserCheck className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Aprovar Acessos</h3>
        </Link>
        <Link to="/adm/solicitacoes-setor" className={styles.card}>
          <FaUserTag className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Aprovar Setores</h3>
        </Link>
        <Link to="/adm/usuarios" className={styles.card}>
          <FaUsersCog className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Usuários</h3>
        </Link>
        <Link to="/adm/competencias" className={styles.card}>
          <FaClipboardList className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Competências</h3>
        </Link>
        <Link to="/adm/estruturas" className={styles.card}>
          <FaBuilding className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Estruturas</h3>
        </Link>
        <Link to="/adm/combos" className={styles.card}>
          <FaFolderOpen className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Kits</h3>
        </Link>
        <Link to="/adm/itens" className={styles.card}>
          <FaBoxOpen className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Itens</h3>
        </Link>
        <Link to="/adm/classificacoes" className={styles.card}>
          <FaTags className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Classificações</h3>
        </Link>
      </div>
    </div>
  );

  // --- 2. Painel do DIRETOR ---
  const renderDiretorDashboard = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel do Diretor</h1>
      <p className={styles.subtitle}>Bem-vindo(a), {userName}. Gestão da unidade.</p>
      <div className={styles.dashboardGrid}>
        <Link to="/censo" className={styles.card}>
          <FaUsers className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Censo Escolar</h3>
          <p className={styles.cardText}>Informar quantidade de alunos por competência.</p>
        </Link>
      </div>
    </div>
  );

  // --- 3. Painel do RH (NOVO) ---
  const renderRhDashboard = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel de Recursos Humanos</h1>
      <p className={styles.subtitle}>Bem-vindo(a), {userName}. Gestão de pessoal e folha.</p>
      <div className={styles.dashboardGrid}>
        <Link to="/rh/folha" className={styles.card}>
          <FaMoneyBillWave className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Lançar Folha</h3>
          <p className={styles.cardText}>Lance valores e quantidades de professores por escola.</p>
        </Link>
      </div>
    </div>
  );

  // --- 4. Painel do Responsável de Setor ---
  const renderResponsavelSetor = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel do Responsável</h1>
      <p className={styles.subtitle}>Bem-vindo(a), {userName}. Gerencie suas solicitações.</p>
      <div className={styles.dashboardGrid}>
        <Link to="/responsavel-setor/preenchimento" className={styles.card}>
          <FaClipboardList className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Preencher Kits</h3>
          <p className={styles.cardText}>Preencha os itens dos combos do seu setor.</p>
        </Link>
        <Link to="/solicitar-setor" className={styles.card}>
          <FaUserPlus className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Solicitar Setor</h3>
          <p className={styles.cardText}>Solicite vínculo a um novo setor.</p>
        </Link>
      </div>
    </div>
  );

  // --- 5. Painel Padrão ---
  const renderDefaultHome = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Bem-vindo(a) ao Portal da Escola</h1>
      <p className={styles.subtitle}>Faça login ou registre-se para continuar.</p>
      <div style={{marginTop: '20px'}}>
        <Link to="/login" style={{color: 'white', fontWeight: 'bold', fontSize: '1.2rem'}}>Fazer Login</Link>
      </div>
    </div>
  );

  if (userRole === null) return <div className={styles.container}><h1>Carregando...</h1></div>;
  
  if (userRole === "ADM") return renderAdminDashboard();
  if (userRole === "DIRETOR") return renderDiretorDashboard();
  if (userRole === "RH") return renderRhDashboard(); // <--- NOVO
  if (userRole === "RESPONSAVEL_SETOR") return renderResponsavelSetor();
  
  return renderDefaultHome();
}

export default Home;