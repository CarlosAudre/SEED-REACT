import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { FaTasks } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Mensagem ao enviar aplicar
import styles from './Aprovacao.module.css';

function SolicitacaoDeAcesso() {
  const { control, setValue, handleSubmit, watch } = useForm({
    defaultValues: { usuarios: [] }
  });

  const usuarios = watch('usuarios');
  const token = localStorage.getItem('token');

  const makeConfig = () => {
    const cfg = {};
    if (token && token !== 'null') {
      cfg.headers = { Authorization: `Bearer ${token}` };
    }
    return cfg;
  };

  const buscarUsuarios = () => {
    axios.get('https://ssge.onrender.com/adm/usuarios-pendentes', makeConfig())
      .then(response => {
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
    buscarUsuarios();
  }, []);

  const aoEnviar = async (data) => {
    for (let u of data.usuarios) {
      try {
        if (u.aprovado) {
          await axios.put(`https://ssge.onrender.com/adm/aprovar/${u.id}`, null, makeConfig());
        } else if (u.reprovar) {
          await axios.delete(`https://ssge.onrender.com/adm/reprovar/${u.id}`, makeConfig());
        }
      } catch (err) {
        console.error(`Erro ao processar usuário ${u.id}:`, err);
        toast.error(`Erro ao processar ${u.nome}`, { autoClose: 4000 });
      }
    }
    toast.success('Ações aplicadas com sucesso!', { autoClose: 3000 });
    buscarUsuarios();
  };

  const alterarCheckbox = (index, campo) => {
    const novosUsuarios = [...usuarios];
    novosUsuarios[index].aprovado = campo === 'aprovado';
    novosUsuarios[index].reprovar = campo === 'reprovar';
    setValue('usuarios', novosUsuarios);
  };

  return (
    <div className={styles.containerSolicitacao}>
      <h3 className={styles.titulo}>
        <FaTasks className={styles.icone} /> Solicitações de Acesso
      </h3>

      <form onSubmit={handleSubmit(aoEnviar)}>
        {usuarios.length > 0 ? (
          <table className={styles.tabela}>
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
                          className={styles.checkboxPersonalizado}
                          checked={!!field.value}
                          onChange={() => alterarCheckbox(index, 'aprovado')}
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
                          className={styles.checkboxPersonalizado}
                          checked={!!field.value}
                          onChange={() => alterarCheckbox(index, 'reprovar')}
                        />
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.mensagemVazia}>Não há solicitações pendentes</p>
        )}

        {usuarios.length > 0 && (
          <div className={styles.containerBotao}>
            <button type="submit">Aplicar Ações</button>
          </div>
        )}
      </form>

      {/* Toasts */}
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}

export default SolicitacaoDeAcesso;
