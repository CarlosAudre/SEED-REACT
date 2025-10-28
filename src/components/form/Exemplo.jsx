import { useForm } from "react-hook-form"

function Exemplo() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Nome"
        name="nome"
        register={register}
        options={{ required: "Campo obrigatório" }}
        error={errors.nome}
      />

      <Select
        label="País"
        name="pais"
        register={register}
        optionsList={[
          { value: "br", label: "Brasil" },
          { value: "us", label: "Estados Unidos" }
        ]}
        options={{ required: "Escolha um país"}}
        error={errors.pais}
      />

      <RadioGroup
        label="Sexo"
        name="sexo"
        register={register}
        optionsList={[
          { value: "M", label: "Masculino" },
          { value: "F", label: "Feminino" }
        ]}
        options={{ required: "Selecione uma opção" }}
        error={errors.sexo}
      />

      <SubmitButton label="Enviar" />
    </form>
  )
}
