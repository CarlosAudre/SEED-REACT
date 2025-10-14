import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Submit from "../form/Submit";
import Input from "../form/Input";
import { FaUser, FaLock } from "react-icons/fa";

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
    <div className="login_container">
      <h3>Login</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="login_form">
        {/* Campo de email */}
        <div className="input_group">
          <FaUser className="icon" />
          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            options={{ required: "O email é obrigatório" }}
            error={errors.email}
          />
        </div>

        {/* Campo de senha */}
        <div className="input_group">
          <FaLock className="icon" />
          <Input
            label="Senha"
            name="senha"
            type="password"
            register={register}
            options={{ required: "A senha é obrigatória" }}
            error={errors.senha}
          />
        </div>

        {/* Opções e botões */}
        <div className="recall-forget">
          <label>
            <input type="checkbox" />
            Lembre de mim
          </label>
          <a href="#">Esqueceu a senha?</a>
        </div>

        <Submit label="Entrar" />

        <div className="register-link">
          <p>Não possui uma conta?</p>
          <a href="http://localhost:5173/register">Registrar</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
