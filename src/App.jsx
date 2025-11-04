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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/solicitacoes-acesso" element={<SolicitacaoDeAcesso />} />
                <Route path="/adm/itens" element={<GerenciarItens />} />
                <Route path="/adm/combos" element={<GerenciarCombos />} />
                <Route path="/adm/combos/:comboId" element={<DetalhesCombo />} />
                <Route path="/adm/estruturas" element={<GerenciarEstruturas />} />
                <Route path="/responsavel-setor/preenchimento" element={<PreencherCombosSetor/>}/>
                <Route path="/adm/classificacoes" element={<GerenciarClassificacoes />} /> 
            </Routes>
        </Router>
    );
}

export default App;
