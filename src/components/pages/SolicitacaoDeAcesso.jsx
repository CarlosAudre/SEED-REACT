import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';


import { FaTasks } from "react-icons/fa";

function SolicitacaoDeAcesso() {
  const { control, setValue, handleSubmit, watch } = useForm({
    defaultValues: { usuarios: [] }
  });

  const usuarios = watch('usuarios');

  const token = localStorage.getItem('token'); // pega o JWT

  const makeConfig = () => {
    const cfg = {};
    if (token && token !== 'null') {
      cfg.headers = { Authorization: `Bearer ${token}` };
    }
    return cfg;
  };

  // Buscar usuários pendentes
  const fetchUsuarios = () => {
    axios.get('http://localhost:8081/adm/usuarios-pendentes', makeConfig())
      .then(response => {
        console.log("RESPOSTA usuarios-pendentes:", response.data);
        // continua normal pra não quebrar
        const users = (response.data || []).map(u => ({
          ...u,
          aprovado: false,
          reprovar: false
        }));
        setValue('usuarios', users);
      })
      .catch(error => console.error('Erro ao buscar usuários:', error));
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submissão do formulário
  const onSubmit = async (data) => {
    for (let u of data.usuarios) {
      try {
        if (u.aprovado) {
          await axios.put(`http://localhost:8081/adm/aprovar/${u.id}`, null, makeConfig());
        } else if (u.reprovar) {
          await axios.delete(`http://localhost:8081/adm/reprovar/${u.id}`, makeConfig());
        }
      } catch (err) {
        console.error(`Erro ao processar usuário ${u.id}:`, err);
      }
    }

    alert('Ações aplicadas!');
    fetchUsuarios(); // atualiza a lista em tempo real
  };

  // Função para marcar apenas um checkbox por usuário
  const handleCheckboxChange = (index, field) => {
    const newUsuarios = [...usuarios];
    newUsuarios[index].aprovado = field === 'aprovado';
    newUsuarios[index].reprovar = field === 'reprovar';
    setValue('usuarios', newUsuarios);
  };

  return (
    
    <div className="login_container access-request-container">
      <h3><FaTasks className="icon" /> Solicitações de Acesso</h3>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {usuarios.length > 0 ? (
          
          <table className="access-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Cargo</th>
                <th>Telefone</th>
                <th>Aprovar</th>
                <th>Reprovar</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, index) => (
                
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{u.cpf}</td>
                  <td>{u.nomePerfil}</td>
                  <td>{u.telefone}</td>
                  <td>
                    <Controller
                      name={`usuarios.${index}.aprovado`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          
                          className="custom-checkbox"
                          checked={!!field.value}
                          onChange={() => handleCheckboxChange(index, 'aprovado')}
                        />
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      name={`usuarios.${index}.reprovar`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          
                          className="custom-checkbox"
                          checked={!!field.value}
                          onChange={() => handleCheckboxChange(index, 'reprovar')}
                        />
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          
          <p className="no-requests-message">Não há solicitações pendentes</p>
        )}
        
       
        {usuarios.length > 0 && (
          <div className="submit-container">
            
            <button type="submit">Aplicar Ações</button>
          </div>
        )}
      </form>
    </div>
  );
}

export default SolicitacaoDeAcesso;