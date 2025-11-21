import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { menuADM, menuResponsavel, menuRh, menuDiretor } from "./MenuConfig"; // <-- IMPORTADO
import { FaBars } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    // pega o role
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return setUserRole(null);

        try {
            const decoded = jwtDecode(token);
            let role = decoded.role ?? decoded.roles ?? decoded.Roles ?? null;

            // Se vier array
            if (Array.isArray(role)) {
                if (role.includes("ADM")) role = "ADM";
                else if (role.includes("RESPONSAVEL_SETOR")) role = "RESPONSAVEL_SETOR";
                else if (role.includes("RH")) role = "RH";
                else role = "USER";
            }

            setUserRole(role);
        } catch {
            setUserRole("USER");
        }
    }, []);

    const getMenu = () => { 
        if (userRole === "ADM") return menuADM;
        if (userRole === "RESPONSAVEL_SETOR") return menuResponsavel;
        if (userRole === "RH") return menuRh;     
        if (userRole === "DIRETOR") return menuDiretor;
        return [];
    };

    const menu = getMenu();

    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <div className={styles.top}>
                <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
                    <FaBars />
                </button>
            </div>

            <ul className={styles.menuList}>
                {menu.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <li key={index}>
                            <Link
                                to={item.path}
                                className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ""}`}
                            >
                                <Icon className={styles.icon} />
                                {isOpen && <span className={styles.text}>{item.label}</span>}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
