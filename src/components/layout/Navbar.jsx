import styles from './Navbar.module.css'
import { Link } from "react-router-dom"

function Navbar() {
    return (
        <nav className={styles.navbar_container}>
            <ul>
                <Link to="/register">Cadastre-se</Link>
            </ul>
        </nav>
    )
}

export default Navbar