// src/components/pages/SetorManager.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './SetorManager.module.css';

const API_BASE = 'https://ssge.onrender.com';

export default function SetorManager({ estrutura, onClose }) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const [setores, setSetores] = React.useState([]);
  const [setorAtual, setSetorAtual] = React.useState(null);

  const buscarSetores = async () => {
    try {
      const res = await axios.get(`${API_BASE}/adm/setores/estrutura/${estrutura.id}`, makeConfig());
      setSetores(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar setores.');
    }
  };

  useEffect(() => {
    buscarSetores();
  }, [estrutura]);


  const [showForm, setShowForm] = React.useState(false);

 
const abrirForm = (setor = null) => {
  reset();
  if (setor) {
    setSetorAtual(setor);
    setValue('nomeSetor', setor.nome);
    setValue('descricao', setor.descricao || '');
  } else {
    setSetorAtual(null);
  }
  setShowForm(true); // 🔹 mostra o form
};

const fecharForm = () => {
  reset();
  setSetorAtual(null);
  setShowForm(false); // 🔹 esconde o form
};

  const onSubmit = async (data) => {
    const payload = {
      nome: data.nomeSetor,          // nome correto pro back
      descricao: data.descricao || '', 
      estruturaId: estrutura.id
    };

    try {
      if (setorAtual) {
        await axios.put(`${API_BASE}/adm/setores/${setorAtual.id}`, payload, makeConfig());
        toast.success('Setor atualizado!');
      } else {
        await axios.post(`${API_BASE}/adm/setores`, payload, makeConfig());
        toast.success('Setor criado!');
      }
      fecharForm();
      buscarSetores();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar setor.');
    }
  };

  const deletarSetor = async (id) => {
    if (!window.confirm('Deseja realmente deletar este setor?')) return;
    try {
      await axios.delete(`${API_BASE}/adm/setores/${id}`, makeConfig());
      toast.success('Setor deletado!');
      buscarSetores();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao deletar setor.');
    }
  };

  return (
  <div className={styles.setoresWrapper}>
    {/* Lista de setores */}
    <div className={styles.setoresList}>
      <h5>Setores da Estrutura: {estrutura.nomeEstrutura}</h5>
      <button className={styles.botaoNovo} onClick={() => abrirForm()}>
        <FaPlus /> Novo Setor
      </button>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome do Setor</th>
            <th>Descrição</th>
            <th className={styles.colunaAcoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {setores.map(s => (
            <tr key={s.id}>
              <td>{s.nome}</td>
              <td>{s.descricao}</td>
              <td className={styles.acoes}>
                <button onClick={() => abrirForm(s)} className={styles.botaoAcao} title="Editar">
                  <FaEdit />
                </button>
                <button onClick={() => deletarSetor(s.id)} className={styles.botaoAcao} title="Deletar">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          {setores.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                Nenhum setor cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Form de criar/editar setor */}
    {showForm && (
      <div className={styles.setorForm}>
        <h5>{setorAtual ? 'Editar Setor' : 'Novo Setor'}</h5>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label>Nome do Setor</label>
            <input {...register('nomeSetor', { required: true })} />
          </div>
          <div className={styles.formGroup}>
            <label>Descrição</label>
            <input {...register('descricao')} />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={fecharForm} className={styles.botaoCancelar}>Cancelar</button>
            <button type="submit" className={styles.botaoSalvar}>Salvar</button>
          </div>
        </form>
      </div>
    )}

    <ToastContainer position="top-right" autoClose={3000} />
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <button className={styles.botaoCancelar} onClick={onClose}>Fechar</button>
    </div>
  </div>
);

}
