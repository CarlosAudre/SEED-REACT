import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import Input from "../form/Input";
import Select from "../form/Select";
import Submit from "../form/Submit";


function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const navigate = useNavigate();

  const [mensagem, setMensagem] = useState("");

  const onSubmit = async (data) => {
    setMensagem("");
    try {
      const response = await fetch("http://localhost:8081/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          ...data,
          nomePerfil: data.perfil // deve bater com o enum do backend
        }),
      });

      if (response.ok) {
        setMensagem("✅ Usuário cadastrado com sucesso!");
        navigate("/login");
      } else {
        const errorText = await response.text();
        setMensagem("❌ Erro: " + errorText);
      }
    } catch (error) {
      setMensagem("⚠️ Erro de conexão com o servidor.");
      console.error(error);
    }
  };

  return (
    <div className="register_container">
      <h2>Cadastrar</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nome"
          name="nome"
          register={register}
          options={{ required: "O nome é obrigatório" }}
          error={errors.nome}
          placeholder="Nome"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          register={register}
          options={{ required: "O email é obrigatório" }}
          error={errors.email}
          placeholder="Email"
        />
        <Input
          label="CPF"
          name="cpf"
          register={register}
          options={{ required: "O CPF é obrigatório" }}
          error={errors.cpf}
          placeholder="CPF"
        />
        <Input
          label="Senha"
          name="senha"
          type="password"
          register={register}
          options={{ required: "A senha é obrigatória"}}
          error={errors.senha}
          placeholder="Senha"
        />
        <Select
          label="Perfil"
          name="perfil"
          register={register}
          optionsList={[
            { value: "RESPONSAVEL_SETOR", label: "Responsável de Setor" },
            { value: "RH", label: "Recursos Humanos" },
            { value: "DIRETOR", label: "Diretor" },
          ]}
          error={errors.perfil}
        />
        <Submit label="Registrar" />
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default Register;
