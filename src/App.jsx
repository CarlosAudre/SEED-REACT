import styles from './App.module.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SolicitacaoDeAcesso from './components/pages/SolicitacaoDeAcesso';

function App(){
    return(
        <Router>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path='/login' element={<Login/>}></Route>
                <Route path='/register' element={<Register/>}></Route>
                <Route path='/solicitacoes-acesso' element={<SolicitacaoDeAcesso/>} />
            </Routes>
        </Router>
    )   
}

export default App;