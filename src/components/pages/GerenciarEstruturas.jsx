import React, { useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaTasks } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './GerenciarEstruturas.module.css';
import SetorManager from './SetorManager';

const API_BASE = 'http://localhost:8081';

export default function GerenciarEstruturas() {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      id: null,
      name: '',
      tipo: 'SECRETARIA',
      municipio: { id: 1 },
      ativo: true,
      cep: '',
      estruturaPaiId: null,
    },
  });

  const [estruturas, setEstruturas] = React.useState([]);
  const [municipios, setMunicipios] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSetorModalOpen, setIsSetorModalOpen] = React.useState(false);
  const [estruturaAtual, setEstruturaAtual] = React.useState(null);

  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Buscar estruturas
  const buscarEstruturas = async () => {
    try {
      const res = await axios.get(`${API_BASE}/adm/estruturas`, makeConfig());
      setEstruturas(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar estruturas.');
    }
  };

  // Buscar municípios
  const buscarMunicipios = async () => {
    try {
      const res = await axios.get(`${API_BASE}/adm/estruturas/municipios`, makeConfig());
      setMunicipios(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar municípios.');
    }
  };

  useEffect(() => {
    buscarEstruturas();
    buscarMunicipios();
  }, []);

  const abrirModal = (estrutura = null) => {
    setEstruturaAtual(estrutura);
    if (estrutura) {
      setValue('id', estrutura.id);
      setValue('name', estrutura.name);
      setValue('tipo', estrutura.tipo);
      setValue('municipio', estrutura.municipio || { id: 1 });
      setValue('ativo', estrutura.ativo ?? true);
      setValue('cep', estrutura.cep ?? '');
      setValue('estruturaPaiId', estrutura.estruturaPaiId ?? null);
    } else {
      reset({
        id: null,
        name: '',
        tipo: 'SECRETARIA',
        municipio: { id: 1 },
        ativo: true,
        cep: '',
        estruturaPaiId: null,
      });
    }
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    reset();
    setEstruturaAtual(null);
    setIsModalOpen(false);
  };

  const abrirModalSetores = (estrutura) => {
    setEstruturaAtual(estrutura);
    setIsSetorModalOpen(true);
  };

  const fecharModalSetores = () => {
    setEstruturaAtual(null);
    setIsSetorModalOpen(false);
  };

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      tipo: data.tipo,
      municipio: { id: Number(data.municipio.id || data.municipio) },
      ativo: data.ativo,
      cep: data.cep,
      estruturaPaiId: data.estruturaPaiId ? Number(data.estruturaPaiId) : null,
    };

    try {
      if (estruturaAtual) {
        await axios.put(`${API_BASE}/adm/estruturas/${estruturaAtual.id}`, payload, makeConfig());
        toast.success('Estrutura atualizada!');
      } else {
        await axios.post(`${API_BASE}/adm/estruturas`, payload, makeConfig());
        toast.success('Estrutura criada!');
      }
      fecharModal();
      buscarEstruturas();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar estrutura.');
    }
  };

  const deletarEstrutura = async (id) => {
    if (!window.confirm('Deseja realmente deletar esta estrutura?')) return;
    try {
      await axios.delete(`${API_BASE}/adm/estruturas/${id}`, makeConfig());
      toast.success('Estrutura deletada!');
      buscarEstruturas();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao deletar estrutura.');
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.titulo}>
        <FaBuilding className={styles.icone} /> Gerenciar Estruturas
      </h3>

      <div className={styles.containerBotaoTopo}>
        <button onClick={() => abrirModal()} className={styles.botaoNovo}>
          <FaPlus /> Adicionar Estrutura
        </button>
      </div>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Município</th>
            <th>Estrutura Pai</th>
            <th className={styles.colunaAcoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {estruturas.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.tipo}</td>
              <td>{e.municipio?.nome || '-'}</td>
              <td>
                {e.estruturaPaiId
                  ? estruturas.find((x) => x.id === e.estruturaPaiId)?.name || '-'
                  : '-'}
              </td>
              <td className={styles.acoes}>
                <button
                  onClick={() => abrirModalSetores(e)}
                  className={styles.botaoGerenciar}
                  title="Gerenciar Setores"
                >
                  <FaTasks />
                </button>
                <button onClick={() => abrirModal(e)} className={styles.botaoAcao} title="Editar">
                  <FaEdit />
                </button>
                <button onClick={() => deletarEstrutura(e.id)} className={styles.botaoAcao} title="Deletar">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          {estruturas.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                Nenhuma estrutura cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de criar/editar */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitulo}>{estruturaAtual ? 'Editar Estrutura' : 'Nova Estrutura'}</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGroup}>
                <label>Nome</label>
                <input {...register('name', { required: true })} />
              </div>

              <div className={styles.formGroup}>
                <label>Tipo</label>
                <select {...register('tipo', { required: true })}>
                  <option value="SECRETARIA">Secretaria</option>
                  <option value="DIRETORIA_REGIONAL">Diretoria Regional</option>
                  <option value="ESCOLA">Escola</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Município</label>
                <select {...register('municipio.id', { required: true })}>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Estrutura Pai (opcional)</label>
                <select {...register('estruturaPaiId')}>
                  <option value="">Nenhuma</option>
                  {estruturas
                    .filter((e) => !estruturaAtual || e.id !== estruturaAtual.id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.tipo})
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>CEP</label>
                <input {...register('cep')} placeholder="Opcional" />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={fecharModal} className={styles.botaoCancelar}>
                  Cancelar
                </button>
                <button type="submit" className={styles.botaoSalvar}>
                  {estruturaAtual ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de setores */}
      {isSetorModalOpen && estruturaAtual && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentLarge} style={{ width: '900px' }}>
            <SetorManager estrutura={estruturaAtual} onClose={fecharModalSetores} />
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
