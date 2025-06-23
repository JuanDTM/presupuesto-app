import logo from './logo.svg';
import './App.css';
import PlanoDemo from './components/PlanoDemo';
import PlanoMuros from './components/PlanoMuros';
import PlanoInteractivo from './components/PlanoInteractivo';
import ComponenteEjesNodos from './components/ComponenteEjesNodos';

function App() {
  return (
    <div>
      <h1>Demo de plano con React Konva</h1>
      <ComponenteEjesNodos />
    </div>
  );
}

export default App;
