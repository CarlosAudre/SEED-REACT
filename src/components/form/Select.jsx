function Select({ label, name, register, optionsList = [], options = {}, error }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name}>{label}</label>
      <select id={name} {...register(name, options)} className="border p-2 rounded">
        {optionsList.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
}

export default Select;
