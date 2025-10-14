

function Input({ label, name, register, type = "text", options = {}, error }) {
  return (
    // 1. O container agora serve para posicionamento. As classes do Tailwind (flex, etc.) foram removidas.
    <div className="custom_input_container">

      {/* 2. O <input> agora vem ANTES da <label> para o CSS funcionar. */}
      <input
        id={name}
        type={type} /* 3. Pequena correção: era type="type", agora usa a prop corretamente. */
        {...register(name, options)}
        placeholder=" " /* 4. O placeholder com um espaço em branco é ESSENCIAL para o efeito. */
        className="custom_input_field"
      />

      {/* 5. A label vem depois e será posicionada sobre o input com CSS. */}
      <label htmlFor={name} className="custom_input_label">
        {label}
      </label>

      {/* Bônus: Exibe a mensagem de erro de validação, se houver. */}
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );
}

export default Input;