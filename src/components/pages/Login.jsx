import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        alert("Credenciais inválidas");
        return;
      }

      const resData = await response.json();
      localStorage.setItem("token", resData.token);

      alert("Login realizado com sucesso!");
      navigate("/");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Erro de conexão com o servidor");
    }
  };

    return (
    <div className={styles.login_container}>
      <h3 className={styles.title}>Login</h3>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.login_form}>
        <div className={styles.input_group}>
          <FaUser className={styles.icon} />
          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            options={{ required: "O email é obrigatório" }}
            error={errors.email}
          />
        </div>

        <div className={styles.input_group}>
          <FaLock className={styles.icon} />
          <Input
            label="Senha"
            name="senha"
            type="password"
            register={register}
            options={{ required: "A senha é obrigatória" }}
            error={errors.senha}
          />
        </div>

        <div className={styles.recall_forget}>
          <label>
            <input type="checkbox" />
            Lembre de mim
          </label>
          <a href="#">Esqueceu a senha?</a>
        </div>

        <Submit label="Entrar" className={styles.submit_button} />

        <div className={styles.register_link}>
          <p>Não possui uma conta?</p>
          <a href="http://localhost:5173/register">Registrar</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
