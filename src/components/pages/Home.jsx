import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import styles from "./Home.module.css";

import { FaUserCheck, FaBoxOpen, FaFolderOpen, FaBuilding, FaClipboardList, FaTags, FaUsersCog, FaUserPlus, FaUserTag } from "react-icons/fa";

function Home() {
  const [userRole, setUserRole] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        let role = decoded.role ?? decoded.roles ?? decoded.Roles ?? null;

        if (Array.isArray(role)) {
          if (role.includes("ADM")) role = "ADM";
          else if (role.includes("RESPONSAVEL_SETOR")) role = "RESPONSAVEL_SETOR";
          else role = role[0] || "USER";
        }

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

        <Link to="/adm/solicitacoes-setor" className={styles.card}>
          <FaUserTag className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Aprovar Setores</h3>
          <p className={styles.cardText}>Gerencie os pedidos de alocação de usuários em setores.</p>
        </Link>

        <Link to="/adm/usuarios" className={styles.card}>
          <FaUsersCog className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Usuários</h3>
          <p className={styles.cardText}>Atribua cargos (perfis) e setores aos usuários aprovados.</p>
        </Link>

        {/* ---- NOVO CARD AQUI ---- */}
        <Link to="/adm/competencias" className={styles.card}>
          <FaClipboardList className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Competências</h3>
          <p className={styles.cardText}>
            Crie, edite, reabra e controle as competências do sistema.
          </p>
        </Link>
        {/* ------------------------ */}

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
      <p className={styles.subtitle}>Aqui você pode gerenciar seus kits e solicitações.</p>
      <div className={styles.dashboardGrid}>
        <Link to="/responsavel-setor/preenchimento" className={styles.card}>
          <FaClipboardList className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Preencher Combos do Setor</h3>
          <p className={styles.cardText}>Abra a página para preencher os itens dos combos alocados no seu setor.</p>
        </Link>

        <Link to="/solicitar-setor" className={styles.card}>
          <FaUserPlus className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Solicitar Acesso a Setores</h3>
          <p className={styles.cardText}>Peça ao administrador para vincular você a um novo setor ou escola.</p>
        </Link>
      </div>
    </div>
  );

  const renderDefaultHome = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Bem-vindo(a) ao Portal da Escola</h1>
      <p className={styles.subtitle}>Faça login ou registre-se para continuar.</p>
    </div>
  );

  if (userRole === null) return <div className={styles.container}>Carregando...</div>;

  if (userRole === "ADM") return renderAdminDashboard();
  if (userRole === "RESPONSAVEL_SETOR") return renderResponsavelSetor();
  return renderDefaultHome();
}

export default Home;