function Radios({
    label,
    name,
    register,
    optionList = [],
    options = {},
    error
}){
    return(
        <div className="flex flex-col gap-2">
            <p>{label}</p>
            {optionList.map((opt) => 
                <label key={opt.value} className="flex items-center gap-2">
                    <input
                    type="radio"
                    value={opt.value}
                    {...register(name, options)}
                    />
                    {opt.label}
                </label>
            )}
            {error && <span className="text-red-500 text-sm">{error.message}</span>}
        </div>
    )
}