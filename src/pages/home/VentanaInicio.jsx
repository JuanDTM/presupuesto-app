import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import ReformasModal from '../../components/ReformasModal';
import { useNavigate } from 'react-router-dom';
import './VentanaInicio.css';

export default function VentanaInicio() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [mostrarReformas, setMostrarReformas] = useState(false);
  const [mostrarConstruccion, setMostrarConstruccion] = useState(false);

  return (
    <div className="ventana-inicio">
      <div className="inicio-card">
        <div className="inicio-card__left">
          <div className="inicio-card__brand">
            <span className="inicio-card__logo">COTIZACIÓN CON ESQUEMAS DE MEDIDAS</span>
          </div>
          <p className="inicio-card__copy">
            Transformando ideas en realidad. Cotiza, diseña y gestiona tus proyectos de
            construcción.
          </p>
          <div className="inicio-card__blueprint" />
          <p className="inicio-card__legal">© 2025 COTIZACIÓN CON ESQUEMAS DE MEDIDAS. Todos los derechos reservados.</p>
        </div>

        <div className="inicio-card__right">
          {!token ? (
            <>
              <p className="inicio-card__eyebrow">Accede a tu cuenta</p>
              <h1 className="inicio-card__title">Inicia sesión para continuar</h1>
              <div className="inicio-card__actions">
                <button className="auth-button auth-button--login" onClick={() => navigate('/login')}>
                  <span aria-hidden="true">Iniciar sesión</span>
                </button>
              </div>
              <div className="inicio-card__divider">
                <span />
                <p>¿Eres nuevo aquí?</p>
                <span />
              </div>
              <Link to="/register" className="register-link">
                Crear una cuenta nueva
              </Link>
              <Link to="/recuperar" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </>
          ) : (
            <>
              <p className="inicio-card__eyebrow">Bienvenido</p>
              <h1 className="inicio-card__title">
                Hola {user?.nombre_usuario || 'usuario'}, elige una opción para empezar
              </h1>
              <div className="inicio-card__app-actions">
                <button className="app-button" onClick={() => setMostrarReformas(true)}>
                  Cotizar reformas
                </button>
                <button className="app-button" onClick={() => setMostrarConstruccion(true)}>
                  Construcción total
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {mostrarReformas && (
        <ReformasModal visible={mostrarReformas} onClose={() => setMostrarReformas(false)} />
      )}

      {mostrarConstruccion && (
        <div className="overlay">
          <div className="modal">
            <h2>🏗️ Construcción Total</h2>
            <p>Funcionalidad en desarrollo...</p>
            <button onClick={() => setMostrarConstruccion(false)} className="btn-cerrar">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}