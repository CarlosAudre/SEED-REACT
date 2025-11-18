import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.css";
import { Topbar } from "../navbar/topbar/Topbar";
import { Sidebar } from "../navbar/sidebar/Sidebar";

export default function MainLayout() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // Se quiser redirecionar ao login quando não houver token:
          // navigate("/login");
          setLoading(false);
          return;
        }

        const resposta = await fetch("http://localhost:8081/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resposta.ok) {
          // token inválido / erro do servidor
          console.error("Resposta não OK:", resposta.status);
          // opcional: limpar token e redirecionar
          // localStorage.removeItem("token");
          // navigate("/login");
          setLoading(false);
          return;
        }

        const data = await resposta.json();
        setUsuario(data);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarUsuario();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <Topbar usuario={usuario} />

      <div className={styles.contentWrapper}>
        <Sidebar usuario={usuario} />

        <main className={styles.main}>
          {/* opcional: mostrar loader enquanto busca */}
          {loading ? <p>Carregando...</p> : <Outlet context={{ usuario }} />}
        </main>
      </div>
    </div>
  );
}
