import React from "react";
import styles from "./Select.module.css";

function Select({
  label,
  name,
  register,
  optionsList = [],
  options = {},
  error,
  hideLabel = false,
  className = "",
  icon = null,
}) {
  return (
    <div className={`${styles.select_container} ${className}`}>
      {!hideLabel && (
        <label htmlFor={name} className={styles.select_label}>
          {label}
        </label>
      )}

      <div className={styles.inline_group}>
        {icon && <span className={styles.icon}>{icon}</span>}

        <select
          id={name}
          {...register(name, options)}
          className={styles.select_field}
        >
          {optionsList.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <span className={styles.error_text}>{error.message}</span>}
    </div>
  );
}

export default Select;
