import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserTag } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './AprovarSolicitacoesSetor.module.css'; // Novo CSS

function AprovarSolicitacoesSetor() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  
  const token = localStorage.getItem('token');
  const makeConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const buscarSolicitacoes = async () => {
    try {
      const response = await axios.get('https://sua-api-no-render.onrender.com/adm/solicitacoes-setor/pendentes', makeConfig());
      setSolicitacoes(response.data);
    } catch (error) {
      toast.error('Erro ao buscar solicitações pendentes.');
      console.error(error);
    }
  };

  useEffect(() => {
    buscarSolicitacoes();
  }, []);

  const handleAprovar = async (id) => {
    try {
      await axios.put(`https://sua-api-no-render.onrender.com/adm/solicitacoes-setor/${id}/aprovar`, null, makeConfig());
      toast.success('Solicitação APROVADA! O usuário foi vinculado ao setor.');
      buscarSolicitacoes(); // Atualiza a lista
    } catch (error) {
      toast.error('Erro ao aprovar a solicitação.');
      console.error(error);
    }
  };

  const handleReprovar = async (id) => {
    if (window.confirm('Tem certeza que deseja REPROVAR esta solicitação?')) {
      try {
        await axios.put(`https://sua-api-no-render.onrender.com/adm/solicitacoes-setor/${id}/reprovar`, null, makeConfig());
        toast.info('Solicitação REPROVADA.');
        buscarSolicitacoes(); // Atualiza a lista
      } catch (error) {
        toast.error('Erro ao reprovar a solicitação.');
        console.error(error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.titulo}>
        <FaUserTag className={styles.icone} /> Aprovar Solicitações de Setor
      </h3>

      {solicitacoes.length > 0 ? (
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>Estrutura (Escola)</th>
              <th>Setor Solicitado</th>
              <th>Justificativa</th>
              <th className={styles.colunaAcoes}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {solicitacoes.map(s => (
              <tr key={s.id}>
                <td>{s.nomeUsuario}</td>
                <td>{s.emailUsuario}</td>
                <td>{s.nomeEstrutura}</td>
                <td>{s.nomeSetor}</td>
                <td className={styles.justificativa}>{s.justificativa}</td>
                <td className={styles.acoes}>
                  <button onClick={() => handleAprovar(s.id)} className={styles.botaoAprovar}>
                    Aprovar
                  </button>
                  <button onClick={() => handleReprovar(s.id)} className={styles.botaoReprovar}>
                    Reprovar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.mensagemVazia}>Nenhuma solicitação pendente no momento.</p>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AprovarSolicitacoesSetor;