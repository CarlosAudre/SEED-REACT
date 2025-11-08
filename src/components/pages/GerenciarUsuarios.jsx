import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { FaEdit, FaUsers } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './GerenciarUsuarios.module.css';

function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);
  const [perfis, setPerfis] = useState([]);
  const [estruturas, setEstruturas] = useState([]);
  const [setoresDaEstrutura, setSetoresDaEstrutura] = useState([]);
  const [setoresSelecionados, setSetoresSelecionados] = useState(new Set());

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const buscarUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:8081/adm/usuarios', makeConfig());
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Erro ao buscar usuários.');
    }
  };

  const buscarDadosDoModal = async () => {
    try {
      const [resPerfis, resEstruturas] = await Promise.all([
        axios.get('http://localhost:8081/adm/perfis', makeConfig()),
        axios.get('http://localhost:8081/adm/estruturas', makeConfig())
      ]);
      setPerfis(resPerfis.data);
      setEstruturas(resEstruturas.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do formulário.');
    }
  };

  const buscarSetores = async (estruturaId) => {
    if (!estruturaId) {
      setSetoresDaEstrutura([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8081/adm/setores/estrutura/${estruturaId}`, makeConfig());
      setSetoresDaEstrutura(res.data);
    } catch (error) {
      toast.error('Erro ao buscar setores da estrutura.');
    }
  };

  useEffect(() => {
    buscarUsuarios();
    buscarDadosDoModal();
  }, []);

  const estruturaIdSelecionada = watch("estruturaId");
  useEffect(() => {
    if (estruturaIdSelecionada) {
      buscarSetores(estruturaIdSelecionada);
    }
  }, [estruturaIdSelecionada]);

  const abrirModal = (usuario) => {
    reset();
    setUsuarioEmEdicao(usuario);
    setValue('perfilId', usuario.perfil?.id || ''); 
    setSetoresDaEstrutura([]);
    setSetoresSelecionados(new Set()); 
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setUsuarioEmEdicao(null);
  };

  const toggleSetor = (setorId) => {
    setSetoresSelecionados(prev => {
      const novosSetores = new Set(prev);
      if (novosSetores.has(setorId)) {
        novosSetores.delete(setorId);
      } else {
        novosSetores.add(setorId);
      }
      return novosSetores;
    });
  };

  const onSubmit = async (data) => {
    const payload = {
      perfilId: data.perfilId ? parseInt(data.perfilId) : null,
      setorIds: Array.from(setoresSelecionados)
    };

    try {
      await axios.put(`http://localhost:8081/adm/usuarios/${usuarioEmEdicao.id}`, payload, makeConfig());
      toast.success('Usuário atualizado com sucesso!');
      fecharModal();
      buscarUsuarios();
    } catch (error) {
      toast.error('Erro ao atualizar o usuário.');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.titulo}>
        <FaUsers className={styles.icone} /> Gerenciar Usuários
      </h3>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>CPF</th>
            <th>Cargo (Perfil)</th>
            <th>Status</th>
            <th className={styles.colunaAcoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(user => (
            <tr key={user.id}>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.cpf}</td>
              <td>{user.nomePerfil || 'N/D'}</td>
              <td>
                <span className={user.ativo ? styles.statusAtivo : styles.statusPendente}>
                  {user.ativo ? 'Ativo' : 'Pendente'}
                </span>
              </td>
              <td className={styles.acoes}>
                <button 
                  onClick={() => abrirModal(user)} 
                  className={styles.botaoAcao} 
                  title="Editar Perfil e Setores"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>Editar Usuário: {usuarioEmEdicao.nome}</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              
              <div className={styles.formGroup}>
                <label>Cargo (Perfil)</label>
                <select {...register('perfilId', { required: true })}>
                  <option value="">Selecione um perfil...</option>
                  {perfis.map(p => (
                    <option key={p.id} value={p.id}>{p.nomePerfil}</option>
                  ))}
                </select>
              </div>

              <hr className={styles.divider} />

              <h5 className={styles.subtituloModal}>Atribuir Setores</h5>
              <div className={styles.formGroup}>
                <label>1. Selecione a Estrutura (Escola)</label>
                <select {...register('estruturaId')}>
                  <option value="">Selecione uma estrutura...</option>
                  {estruturas.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>2. Marque os Setores (Departamentos)</label>
                <div className={styles.checkboxContainer}>
                  {setoresDaEstrutura.length > 0 ? setoresDaEstrutura.map(setor => (
                    <label key={setor.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        value={setor.id}
                        onChange={() => toggleSetor(setor.id)}
                        checked={setoresSelecionados.has(setor.id)}
                      />
                      <span>{setor.nome}</span>
                    </label>
                  )) : <p className={styles.mensagemVaziaCheck}>Selecione uma estrutura acima.</p>}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={fecharModal} className={styles.botaoCancelar}>Cancelar</button>
                <button type="submit" className={styles.botaoSalvar}>Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default GerenciarUsuarios;