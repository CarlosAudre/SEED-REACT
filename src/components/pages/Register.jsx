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
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setMensagem("");
    try {
      setLoading(true);
      const response = await fetch("https://sua-api-no-render.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          nomePerfil: data.perfil
        }),
      });

      if (response.ok) {
        setMensagem("✅ Usuário cadastrado com sucesso! Redirecionando para o login...");
        setTimeout(() => navigate("/login"), 1600);
      } else {
        const errorText = await response.text();
        setMensagem(`❌ Erro: ${errorText}`);
      }
    } catch (error) {
      setMensagem("⚠️ Erro de conexão com o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.centerCard}>
        <div className={styles.brand}>
          <div className={styles.logo}>SGGE</div>
          <h3 className={styles.title}>Criar Conta</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.login_form} noValidate>
          <div className={styles.input_group}>
            <FaUser className={styles.icon} />
            <Input
              placeholder="Nome completo"
              label="Nome"
              name="nome"
              register={register}
              options={{ required: "O nome é obrigatório" }}
              error={errors.nome}
            />
          </div>
          {errors.nome && <div className={styles.error}>{errors.nome.message}</div>}

          <div className={styles.input_group}>
            <FaEnvelope className={styles.icon} />
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
          {errors.email && <div className={styles.error}>{errors.email.message}</div>}

          <div className={styles.twoColumns}>
            <label className={styles.labelInline}>
              <div className={styles.input_group_small}>
                <FaIdCard className={styles.icon_small} />
                <Input
                  placeholder="000.000.000-00"
                  label="CPF"
                  name="cpf"
                  register={register}
                  options={{
                    required: "O CPF é obrigatório",
                    pattern: {
                      value: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
                      message: "CPF inválido. Ex: 000.000.000-00"
                    }
                  }}
                  error={errors.cpf}
                  inputMode="numeric"
                  mask="cpf"
                />
              </div>
              {errors.cpf && <div className={styles.error}>{errors.cpf.message}</div>}
            </label>

            <label className={styles.labelInline}>
              <div className={styles.input_group_small}>
                <FaPhone className={styles.icon_small} />
                <Input
                  placeholder="(00) 00000-0000"
                  label="Telefone"
                  name="telefone"
                  register={register}
                  options={{
                    required: "Telefone é obrigatório",
                    pattern: {
                      value: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
                      message: "Telefone inválido. Ex: (11) 91234-5678"
                    }
                  }}
                  error={errors.telefone}
                  inputMode="numeric"
                  mask="telefone"
                />
              </div>
              {errors.telefone && <div className={styles.error}>{errors.telefone.message}</div>}
            </label>
          </div>

          <div className={styles.input_group}>
            <FaLock className={styles.icon} />
            <Input
              placeholder="Crie uma senha forte"
              label="Senha"
              name="senha"
              type="password"
              register={register}
              options={{ required: "A senha é obrigatória" }}
              error={errors.senha}
            />
          </div>
          {errors.senha && <div className={styles.error}>{errors.senha.message}</div>}

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
            />
          </div>
          {errors.perfil && <div className={styles.error}>{errors.perfil.message}</div>}

          <div className={styles.submitWrap}>
            <Submit label={loading ? "Registrando..." : "Registrar"} className={styles.submit_button} disabled={loading} aria-busy={loading} />
          </div>

          <div className={styles.register_link}>
            <p>Já possui uma conta? <a href="/login">Entrar</a></p>
          </div>
        </form>

        {mensagem && <p className={styles.feedback_message}>{mensagem}</p>}
      </div>
    </div>
  );
}

export default Register;
