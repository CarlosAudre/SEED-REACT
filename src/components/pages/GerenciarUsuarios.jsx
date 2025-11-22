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
  
  // Listas de Dados
  const [perfis, setPerfis] = useState([]);
  const [estruturas, setEstruturas] = useState([]);
  
  // Logica de Setores (Para Responsáveis)
  const [setoresDaEstrutura, setSetoresDaEstrutura] = useState([]);
  const [setoresSelecionados, setSetoresSelecionados] = useState(new Set());

  // Lógica de Estruturas (Para Diretores)
  const [estruturasSelecionadas, setEstruturasSelecionadas] = useState(new Set());

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // --- 1. Buscas Iniciais ---
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

  useEffect(() => {
    buscarUsuarios();
    buscarDadosDoModal();
  }, []);

  // --- 2. Lógica Dinâmica do Formulário ---
  const perfilIdSelecionado = watch("perfilId");
  const estruturaIdSelecionada = watch("estruturaId");

  // Helper para saber se é Diretor ou Responsável
  const getNomePerfil = (id) => {
    const p = perfis.find(p => p.id === parseInt(id));
    return p ? p.nomePerfil : "";
  };

  const isDiretor = getNomePerfil(perfilIdSelecionado) === "DIRETOR";
  const isResponsavel = getNomePerfil(perfilIdSelecionado) === "RESPONSAVEL_SETOR";

  // Busca setores quando o Responsável escolhe uma escola
  useEffect(() => {
    if (isResponsavel && estruturaIdSelecionada) {
      const buscarSetores = async () => {
        try {
          const res = await axios.get(`http://localhost:8081/adm/setores/estrutura/${estruturaIdSelecionada}`, makeConfig());
          setSetoresDaEstrutura(res.data);
        } catch (error) {
          console.error(error);
        }
      };
      buscarSetores();
    } else {
        setSetoresDaEstrutura([]);
    }
  }, [estruturaIdSelecionada, isResponsavel]);


  // --- 3. Controle do Modal ---
  const abrirModal = (usuario) => {
    reset();
    setUsuarioEmEdicao(usuario);
    setValue('perfilId', usuario.perfil?.id || ''); // Não precisa converter para string se o value do option for number, mas cuidado com types
    
    // Limpa seleções anteriores
    setSetoresSelecionados(new Set());
    setEstruturasSelecionadas(new Set());
    
    // TODO: Se o back-end retornasse os setores/estruturas atuais do usuário, 
    // aqui nós preencheríamos os Sets para edição. Por enquanto, começa limpo.
    
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setUsuarioEmEdicao(null);
  };

  // --- 4. Checkboxes ---
  const toggleSetor = (id) => {
    setSetoresSelecionados(prev => {
      const novo = new Set(prev);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  };

  const toggleEstrutura = (id) => {
    setEstruturasSelecionadas(prev => {
      const novo = new Set(prev);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  };

  // --- 5. Enviar ---
  const onSubmit = async (data) => {
    const payload = {
      perfilId: data.perfilId ? parseInt(data.perfilId) : null,
      // Envia setores apenas se for Responsável
      setorIds: isResponsavel ? Array.from(setoresSelecionados) : [],
      // Envia estruturas apenas se for Diretor
      estruturaIds: isDiretor ? Array.from(estruturasSelecionadas) : []
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
            <th>Cargo</th>
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
                  title="Editar Vínculos"
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
            <h4 className={styles.modalTitulo}>Editar: {usuarioEmEdicao.nome}</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              
              <div className={styles.formGroup}>
                <label>Selecione o Cargo</label>
                <select {...register('perfilId', { required: true })}>
                  <option value="">Selecione...</option>
                  {perfis.map(p => (
                    <option key={p.id} value={p.id}>{p.nomePerfil}</option>
                  ))}
                </select>
              </div>

              <hr className={styles.divider} />

              {/* --- ÁREA DO DIRETOR (Vínculo Direto com Escola) --- */}
              {isDiretor && (
                  <div className={styles.areaVinculo}>
                    <h5 className={styles.subtituloModal}>Vincular Escolas (Direção)</h5>
                    <div className={styles.formGroup}>
                        <label>Marque as escolas que este usuário dirige:</label>
                        <div className={styles.checkboxContainer}>
                        {estruturas.map(e => (
                            <label key={e.id} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                value={e.id}
                                onChange={() => toggleEstrutura(e.id)}
                                checked={estruturasSelecionadas.has(e.id)}
                            />
                            <span>{e.name}</span>
                            </label>
                        ))}
                        </div>
                    </div>
                  </div>
              )}

              {/* --- ÁREA DO RESPONSÁVEL (Vínculo com Setores) --- */}
              {isResponsavel && (
                  <div className={styles.areaVinculo}>
                    <h5 className={styles.subtituloModal}>Vincular Setores</h5>
                    <div className={styles.formGroup}>
                        <label>1. Filtre pela Escola:</label>
                        <select {...register('estruturaId')}>
                        <option value="">Selecione uma escola...</option>
                        {estruturas.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>2. Marque os Setores:</label>
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
                        )) : <p className={styles.mensagemVaziaCheck}>Selecione uma escola acima.</p>}
                        </div>
                    </div>
                  </div>
              )}

              {/* Se não for nem Diretor nem Responsável (ex: ADM ou RH sem vínculo específico) */}
              {!isDiretor && !isResponsavel && perfilIdSelecionado && (
                  <p className={styles.mensagemInfo}>
                      Este perfil não requer vínculo específico com escolas ou setores nesta tela.
                  </p>
              )}

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