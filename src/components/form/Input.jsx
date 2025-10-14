import React from "react";
import styles from "./Input.module.css";

function Input({
  label,
  name,
  register,
  type = "text",
  options = {},
  error,
  placeholder = "",
  mask, // 👈 nova prop opcional
}) {
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "") // remove tudo que não for número
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14); // limita o tamanho
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .slice(0, 15);
  };

  const handleInput = (e) => {
    let value = e.target.value;

    if (mask === "cpf") value = formatCPF(value);
    else if (mask === "telefone") value = formatTelefone(value);

    e.target.value = value; // aplica a máscara no campo
  };

  return (
    <div style={{ width: "100%" }}>
      <div className={styles.custom_input_container}>
        <input
          id={name}
          type={type}
          {...register(name, options)}
          placeholder=" "
          className={styles.custom_input_field}
          onInput={mask ? handleInput : undefined} // 👈 aplica máscara
        />

        <label htmlFor={name} className={styles.custom_input_label}>
          {label}
        </label>
      </div>

      {error && <span className={styles.error_message}>{error.message}</span>}
    </div>
  );
}

export default Input;
