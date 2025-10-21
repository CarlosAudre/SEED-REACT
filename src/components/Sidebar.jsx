import React from 'react';
import styles from './Sidebar.module.css'; // Importa o CSS Module
import { NavLink } from 'react-router-dom';

// Importe os ícones
import { BiPieChartAlt2, BiFile, BiBookContent, BiCheckShield, BiPaint } from 'react-icons/bi';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        SGGE
      </div>

      <h6 className={styles.menuTitle}>Menu Principal</h6>
      <ul className={styles.menuList}>
        <li>
          {/* O NavLink aplica a classe 'active' automaticamente */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <BiPieChartAlt2 size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/solicitacoes" 
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <BiFile size={20} />
            <span>Solicitações</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/catalogo" 
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <BiBookContent size={20} />
            <span>Catálogo</span>
          </NavLink>
        </li>
        {/* Adicione os outros links (Auditoria, UI Kit) */}
         <li>
          <NavLink 
            to="/auditoria" 
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <BiBookContent size={20} />
            <span>Auditoria</span>
          </NavLink>
        </li>
        {/* Adicione os outros links (Auditoria, UI Kit) */}
      </ul>

      <div className={styles.footer}>
        <p>SGGE v1.0</p>
        <p>© 2024 ...</p>
      </div>
    </aside>
  );
};

export default Sidebar;