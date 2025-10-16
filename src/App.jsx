import styles from './App.module.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SolicitacaoDeAcesso from './components/pages/SolicitacaoDeAcesso';
import GerenciarItens from './components/pages/GerenciarItens';
import GerenciarCombos from './components/pages/GerenciarCombos'; 
import DetalhesCombo from './components/pages/DetalhesCombo';

function App(){
    return(
        <Router>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path='/login' element={<Login/>}></Route>
                <Route path='/register' element={<Register/>}></Route>
                <Route path='/solicitacoes-acesso' element={<SolicitacaoDeAcesso/>} />
                <Route path='/adm/itens' element={<GerenciarItens/>} />
                <Route path='/adm/combos' element={<GerenciarCombos/>} />
                <Route path='/adm/combos/:comboId' element={<DetalhesCombo />} />
                
            </Routes>
        </Router>
    )   
}

export default App;