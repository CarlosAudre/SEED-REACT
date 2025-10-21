import React from 'react';
import styles from './Navbar.module.css'; 


import { BiMenu, BiSearch, BiBell, BiUser } from 'react-icons/bi';


const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className={styles.navbar}>
      <button className={styles.toggleButton} onClick={onToggleSidebar}>
        <BiMenu />
      </button>

      <div className={styles.navbarRight}>
        <button className={styles.iconButton}>
          <BiBell />
        </button>
        <div className={styles.profile}>
          <div className={styles.profileAvatar}>
          </div>
          <div className={styles.profileInfo}>
            <span>Admin</span>
            <small>Administrador</small>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;