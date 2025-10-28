import React from 'react';

// Dados de exemplo para a auditoria
const registrosAuditoria = [
  {
    id: 1,
    data: '2025-10-28 10:00:00',
    usuario: 'admin@exemplo.com',
    acao: 'Login bem-sucedido',
    detalhes: 'IP: 192.168.1.1',
  },
  {
    id: 2,
    data: '2025-10-28 10:15:30',
    usuario: 'usuario_a@exemplo.com',
    acao: 'Criação de Produto',
    detalhes: 'Produto: "Caneta Azul", ID: 50',
  },
  {
    id: 3,
    data: '2025-10-28 11:05:45',
    usuario: 'admin@exemplo.com',
    acao: 'Atualização de Usuário',
    detalhes: 'Usuário: usuario_b@exemplo.com, Campo: Nome',
  },
  // Adicione mais registros aqui
];

const PaginaAuditoria = () => {
  return (
    <div className="pagina-auditoria">
      <h1>Auditoria de Sistema</h1>
      
      {/* Tabela de Registros */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        marginTop: '20px' 
      }}>
        
        {/* Cabeçalho da Tabela */}
        <thead>
          <tr style={{ 
            backgroundColor: '#f2f2f2', 
            borderBottom: '2px solid #ddd' 
          }}>
            <th style={tableHeaderStyle}>ID</th>
            <th style={tableHeaderStyle}>Data/Hora</th>
            <th style={tableHeaderStyle}>Usuário</th>
            <th style={tableHeaderStyle}>Ação</th>
            <th style={tableHeaderStyle}>Detalhes</th>
          </tr>
        </thead>
        
        {/* Corpo da Tabela - Mapeamento dos Dados */}
        <tbody>
          {registrosAuditoria.map((registro) => (
            <tr 
              key={registro.id} 
              style={{ 
                borderBottom: '1px solid #eee', 
                textAlign: 'left' 
              }}
            >
              <td style={tableCellStyle}>{registro.id}</td>
              <td style={tableCellStyle}>{registro.data}</td>
              <td style={tableCellStyle}>{registro.usuario}</td>
              <td style={tableCellStyle}>{registro.acao}</td>
              <td style={tableCellStyle}>{registro.detalhes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {registrosAuditoria.length === 0 && (
        <p>Nenhum registro de auditoria encontrado.</p>
      )}
    </div>
  );
};

// Estilos básicos inline (você deve usar CSS ou bibliotecas de estilo na prática)
const tableHeaderStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 'bold',
  border: '1px solid #ddd'
};

const tableCellStyle = {
  padding: '8px',
  border: '1px solid #ddd'
};

export default PaginaAuditoria;