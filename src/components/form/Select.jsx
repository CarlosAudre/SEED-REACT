import React from "react";

function Select({
  label,
  name,
  register,
  optionsList = [],
  options = {},
  error,
  hideLabel = false,
  className = "",
  moduleStyles = null,
  icon = null,
}) {
  const selectClass = moduleStyles ? moduleStyles.select_field : "select_field";
  const containerClass = moduleStyles ? moduleStyles.select_container : "select_container";
  const inlineClass = moduleStyles ? moduleStyles.inline_group : "inline_group";

  return (
    <div className={containerClass}>
      <div className={inlineClass}>
        {icon && <span className={moduleStyles ? moduleStyles.icon : "icon"}>{icon}</span>}
        {!hideLabel && (
          <label htmlFor={name} className={moduleStyles ? moduleStyles.select_label : "select_label"}>
            {label}
          </label>
        )}

        <select id={name} {...register(name, options)} className={selectClass}>
          {optionsList.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <span className={moduleStyles ? moduleStyles.error_text : "error_text"}>{error.message}</span>}
    </div>
  );
}

export default Select;
