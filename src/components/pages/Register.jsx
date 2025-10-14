import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "../form/Input";
import Select from "../form/Select";
import Submit from "../form/Submit";

// Importando os ícones necessários
import { FaUser, FaEnvelope, FaIdCard, FaLock, FaPhone, FaBriefcase } from "react-icons/fa";

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState("");

  const onSubmit = async (data) => {
    setMensagem("");
    try {
      const response = await fetch("http://localhost:8081/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          nomePerfil: data.perfil // Garante que o nome do campo seja o esperado pelo backend
        }),
      });

      if (response.ok) {
        setMensagem("✅ Usuário cadastrado com sucesso! Redirecionando para o login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Aguarda 2 segundos antes de redirecionar
      } else {
        const errorText = await response.text();
        setMensagem(`❌ Erro: ${errorText}`);
      }
    } catch (error) {
      setMensagem("⚠️ Erro de conexão com o servidor.");
      console.error(error);
    }
  };

  return (
    
    <div className="login_container">
      <h3>Criar Conta</h3>

      
      <form onSubmit={handleSubmit(onSubmit)} className="login_form">

        
        <div className="input_group">
          <FaUser className="icon" />
          <Input
            label="Nome"
            name="nome"
            register={register}
            options={{ required: "O nome é obrigatório" }}
            error={errors.nome}
            placeholder="Nome Completo" 
          />
        </div>

        <div className="input_group">
          <FaEnvelope className="icon" />
          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            options={{ required: "O email é obrigatório" }}
            error={errors.email}
            placeholder="seu@email.com"
          />
        </div>

        <div className="input_group">
          <FaIdCard className="icon" />
          <Input
            label="CPF"
            name="cpf"
            register={register}
            options={{ required: "O CPF é obrigatório" }}
            error={errors.cpf}
            placeholder="000.000.000-00"
          />
        </div>

        <div className="input_group">
          <FaPhone className="icon" />
          <Input
            label="Telefone"
            name="telefone"
            register={register}
            options={{ required: "Telefone é obrigatório" }}
            error={errors.telefone}
            placeholder="(00) 00000-0000"
          />
        </div>
        
        <div className="input_group">
          <FaLock className="icon" />
          <Input
            label="Senha"
            name="senha"
            type="password"
            register={register}
            options={{ required: "A senha é obrigatória" }}
            error={errors.senha}
            placeholder="Crie uma senha forte"
          />
        </div>

        
        <div className="input_group">
          <FaBriefcase className="icon" />
          <Select
            label="Perfil"
            name="perfil"
            register={register}
            optionsList={[
              { value: "", label: "Selecione um perfil", disabled: true }, // Adicionado placeholder
              { value: "RESPONSAVEL_SETOR", label: "Responsável de Setor" },
              { value: "RH", label: "Recursos Humanos" },
              { value: "DIRETOR", label: "Diretor" },
            ]}
            error={errors.perfil}
          />
        </div>

        <Submit label="Registrar" />

        
        <div className="register-link">
          <p>Já possui uma conta? <a href="/login">Entrar</a></p>
        </div>
      </form>

      
      {mensagem && <p className="feedback-message">{mensagem}</p>}
    </div>
  );
}

export default Register;