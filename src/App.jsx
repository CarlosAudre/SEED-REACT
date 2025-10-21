// src/App.jsx
import React, { useState } from 'react' // <-- ADICIONE O useState
import { Routes, Route, Outlet } from 'react-router-dom'
import styles from './App.module.css'; 

// 2. Importe seus componentes
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Home from './pages/Home'

// 1. IMPORTE AS NOVAS PÁGINAS
import Solicitacoes from './pages/Solicitacoes';
import Catalogo from './pages/Catalogo';
import Auditoria from './pages/Auditoria';



  const DashboardLayout = () => {
  // 1. Nosso novo estado. Começa como 'true' (aberta)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 2. Função que inverte o estado (de true p/ false, de false p/ true)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    // 3. Adiciona a classe 'layoutGridClosed' se isSidebarOpen for false
    <div className={`${styles.layoutGrid} ${!isSidebarOpen ? styles.layoutGridClosed : ''}`}>

      {/* 4. Adiciona a classe 'layoutSidebarClosed' se isSidebarOpen for false */}
      <div className={`${styles.layoutSidebar} ${!isSidebarOpen ? styles.layoutSidebarClosed : ''}`}>
        {/* O componente <Sidebar> em si não precisa saber de nada */}
        <Sidebar />
      </div>

      <div className={styles.layoutMainContent}>
        {/* 5. Passa a função 'toggleSidebar' como uma prop para o Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className={styles.layoutPageContent}>
          <Outlet /> 
        </div>
      </div>

    </div>
  )
}


// 4. Componente App principal define as rotas
function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        
        {/* Rota Padrão */}
        <Route index element={<Home />} />

        {/* 2. ADICIONE AS NOVAS ROTAS */}
        <Route path="solicitacoes" element={<Solicitacoes />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="auditoria" element={<Auditoria />} />

      </Route>
    </Routes>
  )
}

export default App