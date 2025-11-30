import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import Input from "../form/Input";
import Submit from "../form/Submit";
import styles from "./Login.module.css";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await fetch("https://ssge.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // aqui tu pode mapear status pra mensagens melhores
        alert("Credenciais inválidas");
        setLoading(false);
        return;
      }

      const resData = await response.json();
      localStorage.setItem("token", resData.token);

      // feedback mais bonito: toast/alert custom
  
      navigate("/");
    } catch (err) {
      alert("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.centerCard}>
        <div className={styles.brand}>
          <div className={styles.logo}>SGGE</div>
          <h3 className={styles.title}>Entrar na sua conta</h3>
          <p className={styles.subtitle}>Bem-vindo de volta — continue de onde parou</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.login_form}>
          <label className={styles.label}>
            <div className={styles.input_group}>
              <FaUser className={styles.icon} />
              <Input
                placeholder="seu@email.com"
                label="Email"
                name="email"
                type="email"
                register={register}
                options={{ required: "O email é obrigatório" }}
                error={errors.email}
              />
            </div>
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </label>

          <label className={styles.label}>
            <div className={styles.input_group}>
              <FaLock className={styles.icon} />
              <Input
                placeholder="••••••••"
                label="Senha"
                name="senha"
                type="password"
                register={register}
                options={{ required: "A senha é obrigatória" }}
                error={errors.senha}
              />
            </div>
            {errors.senha && <span className={styles.error}>{errors.senha.message}</span>}
          </label>

          <div className={styles.recall_forget}>
            <label className={styles.remember}>
              <input type="checkbox" />
              <span>Lembre de mim</span>
            </label>
          </div>

          <div className={styles.submitWrap}>
            <Submit label={loading ? "Entrando..." : "Entrar"} className={styles.submit_button} />
          </div>

          <div className={styles.register_link}>
            <p>Não possui uma conta?</p>
            <Link to="/register">Criar conta</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
