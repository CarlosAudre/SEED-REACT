// src/components/pages/Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importa a função para decodificar
import { FaUserCheck, FaBoxOpen, FaFolderOpen } from 'react-icons/fa';
import styles from './Home.module.css'; // Vamos criar este CSS

function Home() {
  const [userRole, setUserRole] = React.useState(null);

  // CÓDIGO CORRIGIDO PARA O Home.js ✅
React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        // Agora lemos a claim "role" que acabamos de adicionar
        const userRole = decodedToken.role; 

        if (userRole === 'ADM') {
          setUserRole('ADM');
        } else {
          setUserRole('USER');
        }
      } catch (error) {
        console.error("Token inválido:", error);
        setUserRole('GUEST');
      }
    } else {
      setUserRole('GUEST');
    }
}, []);

  // Renderiza o Painel do Administrador
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
        
        <Link to="/adm/itens" className={styles.card}>
          <FaBoxOpen className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Itens</h3>
          <p className={styles.cardText}>Crie, edite e remova os materiais disponíveis para solicitação.</p>
        </Link>
        
        <Link to="/adm/combos" className={styles.card}>
          <FaFolderOpen className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Gerenciar Kits</h3>
          <p className={styles.cardText}>Monte e organize os kits de solicitação para os professores.</p>
        </Link>
      </div>
    </div>
  );

  // Renderiza a Home Padrão para outros usuários ou convidados
  const renderDefaultHome = () => (
    <div className={styles.container}>
      <h1 className={styles.title}>Bem-vindo(a) ao Portal da Escola</h1>
      <p className={styles.subtitle}>Aqui você poderá solicitar materiais e acompanhar seus pedidos.</p>
      {/* Aqui você pode adicionar o conteúdo para o usuário comum no futuro */}
    </div>
  );

  // Lógica de renderização
  if (userRole === null) {
    return <div className={styles.container}>Carregando...</div>; // Estado de carregamento
  }

  return userRole === 'ADM' ? renderAdminDashboard() : renderDefaultHome();
}

export default Home;