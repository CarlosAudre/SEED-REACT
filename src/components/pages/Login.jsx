import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Submit from "../form/Submit";
import Input from "../form/Input";


function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // data.email e data.senha já vêm do useForm
    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (err) {
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="login_container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <Input
          label="Email"
          name="email"
          type="email"
          register={register}
          options={{ required: "O email é obrigatório" }}
          error={errors.email}
        />

        <Input
          label="Senha"
          name="senha"
          type="password"
          register={register}
          options={{ required: "A senha é obrigatória" }}
          error={errors.senha}
        />

        <Submit label="Entrar" />
      </form>
    </div>
  );
}

export default Login;
