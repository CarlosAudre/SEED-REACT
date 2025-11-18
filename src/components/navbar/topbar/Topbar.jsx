import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "./Topbar.module.css";

export function Topbar({ usuario }) {
  const navigate = useNavigate();

  const nomeUsuario = usuario?.nome || "Usuário";
  const nomePerfil = usuario?.perfil || "Perfil";

  const inicial = nomeUsuario?.charAt(0).toUpperCase();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.logo}>SGGE</div>

      <div className={styles.userArea}>
        <div className={styles.userInfo}>
          <span className={styles.nome}>{nomeUsuario}</span>
          <span className={styles.perfil}>{nomePerfil}</span>
        </div>

        <div className={styles.avatar}>{inicial}</div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
