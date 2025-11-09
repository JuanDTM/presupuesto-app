import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext';
import ReformasModal from './ReformasModal'; // 👈 Importar el modal
import './VentanaInicio.css';

export default function VentanaInicio() {
  const { token, user } = useAuth();
  const [mostrarReformas, setMostrarReformas] = useState(false); // 👈 Estado para controlar el modal
  const [mostrarConstruccion, setMostrarConstruccion] = useState(false); // 👈 Para construcción (futuro)

  return (
    <div className="ventana-inicio">
      <h1 className="titulo">COTIZACIÓN CON ESQUEMAS DE MEDIDAS</h1>

      <p className="descripcion">
        En esta aplicación puedes realizar cotizaciones para reformas individuales o para construcción completas
        de viviendas a través de esquemas de medidas. Selecciona una de las opciones para comenzar. 
        <br />
        En reformas puedes cotizar muros individuales, pisos, techos y otros elementos. 
        En construcción total puedes diseñar planos completos con múltiples habitaciones 
        y estructuras.
      </p>

      {/* 🔹 Si el usuario NO ha iniciado sesión → mostrar enlaces de login/register */}
      {!token ? (
        <div className="acciones-auth">
          <p><strong>Accede para continuar:</strong></p>
          <div className="links-auth">
            <Link to="/login" className="link">🔑 Iniciar sesión</Link>
            <Link to="/register" className="link">🧾 Registrarse</Link>
          </div>
        </div>
      ) : (
        <>
          <p className="bienvenida">Hola {user?.nombre_usuario || 'usuario'}, elige una opción:</p>

          <div className="botones">
            <button className="boton" onClick={() => setMostrarReformas(true)}>
              reformas
            </button>
            <button className="boton" onClick={() => setMostrarConstruccion(true)}>
              construcción total
            </button>
          </div>
        </>
      )}

      {/* 🔹 Enlace extra a recuperación de contraseña visible siempre */}
      {!token && (
        <div className="enlace-extra">
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
        </div>
      )}

      {/* 🔹 Modal de Reformas */}
      {mostrarReformas && (
        <ReformasModal 
          visible={mostrarReformas} 
          onClose={() => setMostrarReformas(false)} 
        />
      )}

      {/* 🔹 Modal de Construcción (puedes crear después) */}
      {mostrarConstruccion && (
        <div className="overlay">
          <div className="modal">
            <h2>🏗️ Construcción Total</h2>
            <p>Funcionalidad en desarrollo...</p>
            <button onClick={() => setMostrarConstruccion(false)} className="btn-cerrar">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}