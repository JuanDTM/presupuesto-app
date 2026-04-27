import React, { useMemo, useState } from 'react';
import LogoutButton from '../../modules/auth/components/LogoutButton';
import ClientesAdmin from '../../modules/admin/components/ClientesAdmin';
import ManoObraAdmin from '../../modules/admin/components/ManoObraAdmin';
import MaterialesAdmin from '../../modules/admin/components/MaterialesAdmin';
import styles from './Administrador.module.css';

const OPCIONES_ADMIN = [
  {
    id: 'clientes',
    label: 'Clientes',
    descripcion: 'Gestion de clientes registrados y estado de sus cuentas.',
  },
  {
    id: 'mano-obra',
    label: 'Mano de obra',
    descripcion: 'Configuracion de costos, perfiles y disponibilidad de cuadrillas.',
  },
  {
    id: 'materiales',
    label: 'Materiales',
    descripcion: 'Catalogo de materiales, precios y unidades de medida.',
  },
];

export default function Administrador() {
  const [opcionActiva, setOpcionActiva] = useState('clientes');

  const contenidoActivo = useMemo(
    () => OPCIONES_ADMIN.find((opcion) => opcion.id === opcionActiva),
    [opcionActiva]
  );

  const renderVentana = () => {
    if (opcionActiva === 'clientes') {
      return <ClientesAdmin />;
    }

    if (opcionActiva === 'mano-obra') {
      return <ManoObraAdmin />;
    }

    return <MaterialesAdmin />;
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel de Administrador</h1>
        <LogoutButton />
      </header>

      <section className={styles.card}>
        <h2 className={styles.subtitle}>Selecciona una ventana administrativa</h2>
        <p className={styles.text}>Cada campo abre una ventana diferente dentro del panel.</p>

        <div className={styles.selectorGrid}>
          {OPCIONES_ADMIN.map((opcion) => {
            const activa = opcion.id === opcionActiva;
            return (
              <button
                key={opcion.id}
                type="button"
                className={`${styles.selectorButton} ${activa ? styles.selectorButtonActive : ''}`}
                onClick={() => setOpcionActiva(opcion.id)}
                aria-pressed={activa}
              >
                <span className={styles.selectorLabel}>{opcion.label}</span>
                <span className={styles.selectorDescription}>{opcion.descripcion}</span>
              </button>
            );
          })}
        </div>

        <section className={styles.window}>
          <h3 className={styles.windowTitle}>Ventana: {contenidoActivo?.label}</h3>
          <p className={styles.windowText}>{contenidoActivo?.descripcion}</p>
          <div className={styles.windowBody}>{renderVentana()}</div>
        </section>
      </section>
    </main>
  );
}
