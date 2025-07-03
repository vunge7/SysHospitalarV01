import Menu from '../Menu';
import './style.css';

export default function Conteudo({ children }) {
    return (
        <div className="content">
            <Menu />
            <div className="item">{children}</div>
        </div>
    );
}
