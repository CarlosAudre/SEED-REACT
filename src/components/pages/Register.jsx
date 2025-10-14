import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import Submit from "../../components/form/Submit";

import { FaUser, FaEnvelope, FaIdCard, FaLock, FaPhone, FaBriefcase } from "react-icons/fa";

import styles from "./Register.module.css";

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
          nomePerfil: data.perfil
        }),
      });

      if (response.ok) {
        setMensagem("✅ Usuário cadastrado com sucesso! Redirecionando para o login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
    <div className={styles.login_container}>
      <h3 className={styles.title}>Criar Conta</h3>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.login_form}>

        <div className={styles.input_group}>
          <FaUser className={styles.icon} />
          <Input
            label="Nome"
            name="nome"
            register={register}
            options={{ required: "O nome é obrigatório" }}
            error={errors.nome}
            placeholder="Nome Completo"
          />
        </div>

        <div className={styles.input_group}>
          <FaEnvelope className={styles.icon} />
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

        <div className={styles.input_group}>
          <FaIdCard className={styles.icon} />
          <Input
            label="CPF"
            name="cpf"
            register={register}
            options={{ 
              required: "O CPF é obrigatório",
              pattern:{
                value: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
                message: "CPF inválido. Ex: 000.000.000-00"
              }
            }}
            error={errors.cpf}
            placeholder="000.000.000-00"
            inputMode="numeric"
            mask="cpf"
          />
        </div>

        <div className={styles.input_group}>
          <FaPhone className={styles.icon} />
          <Input
            label="Telefone"
            name="telefone"
            register={register}
            options={{ 
              required: "Telefone é obrigatório",
              pattern:{
                value: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
                message: "Telefone inválido. Ex: (11) 91234-5678"
              }
             }}
            error={errors.telefone}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
            mask="telefone"
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
            placeholder="Crie uma senha forte"
          />
        </div>

        <div className={styles.input_group}>
          <FaBriefcase className={styles.icon} />
          <Select
            label="Perfil"
            name="perfil"
            register={register}
            optionsList={[
              { value: "", label: "Selecione um perfil", disabled: true },
              { value: "RESPONSAVEL_SETOR", label: "Responsável de Setor" },
              { value: "RH", label: "Recursos Humanos" },
              { value: "DIRETOR", label: "Diretor" },
            ]}
            error={errors.perfil}
            moduleStyles={styles} /* opcional: passar styles do page se quiser */
          />
        </div>

        <Submit label="Registrar" className={styles.submit_button} />

        <div className={styles.register_link}>
          <p>Já possui uma conta? <a href="/login">Entrar</a></p>
        </div>
      </form>

      {mensagem && <p className={styles.feedback_message}>{mensagem}</p>}
    </div>
  );
}

export default Register;
