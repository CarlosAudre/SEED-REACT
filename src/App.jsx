import styles from './App.module.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SolicitacaoDeAcesso from './components/pages/SolicitacaoDeAcesso';
import GerenciarItens from './components/pages/GerenciarItens';
import GerenciarCombos from './components/pages/GerenciarCombos';
import DetalhesCombo from './components/pages/DetalhesCombo';
import GerenciarEstruturas from './components/pages/GerenciarEstruturas';
import PreencherCombosSetor from './components/pages/PreencherCombosSetor';
import GerenciarClassificacoes from './components/pages/GerenciarClassificacoes';
import GerenciarUsuarios from './components/pages/GerenciarUsuarios';
import SolicitarSetor from './components/pages/SolicitarSetor';
import AprovarSolicitacoesSetor from './components/pages/AprovarSolicitacoesSetor';
import GerenciarCompetencias from './components/pages/GerenciarCompetencias';
import MainLayout from './components/layout/MainLayout';
import FolhaPagamentoRh from './components/pages/FolhaPagamentoRh';
import InformarCenso from './components/pages/InformarCenso';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/solicitacoes-acesso" element={<SolicitacaoDeAcesso />} />
                    <Route path="/adm/itens" element={<GerenciarItens />} />
                    <Route path="/adm/combos" element={<GerenciarCombos />} />
                    <Route path="/adm/combos/:comboId" element={<DetalhesCombo />} />
                    <Route path="/adm/estruturas" element={<GerenciarEstruturas />} />
                    <Route path="/adm/classificacoes" element={<GerenciarClassificacoes />} />
                    <Route path="/adm/usuarios" element={<GerenciarUsuarios />} />
                    <Route path="/adm/solicitacoes-setor" element={<AprovarSolicitacoesSetor />} />
                    <Route path="/adm/competencias" element={<GerenciarCompetencias />} />

                    <Route path="/responsavel-setor/preenchimento" element={<PreencherCombosSetor />} />
                    <Route path="/solicitar-setor" element={<SolicitarSetor />} /> 
                    <Route path="/diretor/censo" element={<InformarCenso />} />
                    <Route path="/rh/folha" element={<FolhaPagamentoRh/>} />
                </Route>


            </Routes>
        </Router>
    );
}

export default App;