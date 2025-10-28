function Input({label, name, register, type = "text", options = {}, error, placeholder}){
    return(
        <div className="flex flex-col gap-2">
            <label htmlFor={name}>{label}</label>
            <input id={name} type="type"{...register(name, options)} />
        </div>
    )
}

export default Input 