// PanelCotas.js
import React, { useState } from "react";
import styles from "./PanelCotas.module.css";

/**
 * Panel para agregar y mostrar cotas entre nodos.
 * Calcula correctamente la cota libre restando el tamaño completo o la mitad de cada nodo según su posición (perímetro o eje secundario).
 * 
 * Props:
 * - nodos: array de posiciones de nodos [{x, y}]
 * - cotas: array de cotas actuales
 * - setCotas: función para actualizar cotas
 * - escala: factor de escala del dibujo
 * - orientacionesNodos: objeto { idx: "horizontal" | "vertical" }
 * - nivel: string del nivel actual
 * - niveles: array de niveles [{value, ancho, alto}]
 * - margen: margen del canvas
 * - ancho: ancho del área útil (en cm)
 * - largo: largo del área útil (en cm)
 * - ejesV: array de ejes secundarios verticales [{distancia}]
 * - ejesH: array de ejes secundarios horizontales [{distancia}]
 */
export default function PanelCotas({
    nodos,
    cotas,
    setCotas,
    escala,
    orientacionesNodos,
    nivel,
    niveles = [
      { value: "1 de 1", ancho: 12, alto: 20 },
      { value: "1 de 2", ancho: 20, alto: 20 },
      { value: "2 de 2", ancho: 20, alto: 20 },
      { value: "1 de 3", ancho: 30, alto: 30 },
      { value: "2 de 3", ancho: 30, alto: 30 },
      { value: "3 de 3", ancho: 20, alto: 20 },
    ],
    margen,
    ancho,
    largo,
    ejesV,
    ejesH
  }) {
  const [nodoA, setNodoA] = useState(0);
  const [nodoB, setNodoB] = useState(1);
  const [tipoCota, setTipoCota] = useState("libre");
  // Definir los ejes principales
  const ejesPrincipales = {
    superior: { x1: margen, y1: margen, x2: margen + ancho * escala, y2: margen },
    inferior: { x1: margen, y1: margen + largo * escala, x2: margen + ancho * escala, y2: margen + largo * escala },
    izquierdo: { x1: margen, y1: margen, x2: margen, y2: margen + largo * escala },
    derecho: { x1: margen + ancho * escala, y1: margen, x2: margen + ancho * escala, y2: margen + largo * escala },
  };

  // Calcular los nodos iniciales (esquinas)
  const nodosIniciales = [
    { x: ejesPrincipales.izquierdo.x1, y: ejesPrincipales.superior.y1 }, // Nodo superior izquierdo
    { x: ejesPrincipales.derecho.x1, y: ejesPrincipales.superior.y1 },  // Nodo superior derecho
    { x: ejesPrincipales.izquierdo.x1, y: ejesPrincipales.inferior.y1 }, // Nodo inferior izquierdo
    { x: ejesPrincipales.derecho.x1, y: ejesPrincipales.inferior.y1 },  // Nodo inferior derecho
  ];

  // Devuelve dimensiones del nodo según nivel y orientación
  function getDimensionesNodo(nodoN) {
    if (nivel === "1 de 1") {
      // Usar directamente orientacionesNodos[idx]
      const orient = orientacionesNodos[nodoN] || "horizontal"; // Por defecto horizontal si no está definido
      if (!orient) {
        throw new Error(`La orientación del nodo ${nodoN} no está definida en orientacionesNodos.`);
      }
  
      // Retornar dimensiones según orientación
      return orient === "horizontal"
        ? { ancho: 20, alto: 12 }
        : { ancho: 12, alto: 20 };
    } else {
      // Buscar dimensiones del nivel en el array de niveles
      const nivelObj = niveles.find(nv => nv.value === nivel) ;
      return { ancho: nivelObj.ancho, alto: nivelObj.alto };
    }
  }

  function calcularCota(
    nodoA, nodoB, idxA, idxB,
    orientacionesNodos, nivel, niveles,
    tipoCota, margen, escala, ancho, largo, ejesV, ejesH
  ) {
    // 1. Dimensiones de los nodos según orientación y nivel
    
    const dimsA =getDimensionesNodo(idxA);
    const dimsB = getDimensionesNodo(idxB);
    console.log("Dimensiones A:", dimsA, "Dimensiones B:", dimsB);
    // 2. ¿Eje secundario o perímetro?
    const tol = 0.1;

    // 3. Dirección de la cota
    const dx = Math.abs(nodoA.x - nodoB.x);
    const dy = Math.abs(nodoA.y - nodoB.y);
    const esHorizontal = dx > dy; // cota horizontal (de izquierda a derecha)
  
    // 4. Distancia entre centros (en cm)
    const distancia = (esHorizontal ? dx : dy) / escala;
  
    const comparteEjeOriginal = (nodo) => {
      const enEjeX = Math.abs(nodo.y - margen) < tol || Math.abs(nodo.y - (margen + largo * escala)) < tol;
      const enEjeY = Math.abs(nodo.x - margen) < tol || Math.abs(nodo.x - (margen + ancho * escala)) < tol;
    
      return { enEjeX, enEjeY }; // Retorna un objeto indicando si está en el eje X o Y
    };
   
    // 6. Ajuste para cada nodo
    function ajuste(nodo, dims) {
      const Peri=comparteEjeOriginal(nodo)
      if (Peri.enEjeX && Peri.enEjeY) {
        console.log("ejes ambos originales");
        if(esHorizontal){
          console.log("el cota es horizontal ambos originales");
          return dims.ancho; // Ajuste por ancho en el perímetro
          
        }else{
          console.log("el cota es vertical ambos originales");
          return dims.alto; // Ajuste por alto en el perímetro
        }
      } else if ((Peri.enEjeX && !Peri.enEjeY)|| (!Peri.enEjeX && Peri.enEjeY)) {
        console.log("eje originale y secundario");
        if (esHorizontal) {
          if(Peri.enEjeY) {
            console.log("la cota es horizontal, sobre eje original vertical");
            return dims.ancho; // Ajuste por ancho en el eje secundario horizontal
          }else{
            console.log("la cota es horizontal, sobre eje original horizontal");
            return dims.ancho/2; // Ajuste por alto en el eje secundario vertical
          }
        } else {
          if(Peri.enEjeY) {
            console.log("la cota es vertical, sobre eje original vertical");
            return dims.alto/2; // Ajuste por ancho en el eje secundario horizontal
          }else{
            console.log("la cota es vertical, sobre eje original horizontal");
            return dims.alto; // Ajuste por alto en el eje secundario vertical
          }
        }
      }else {
        if (esHorizontal) {
          return dims.ancho / 2; // Ajuste por eje secundario horizontal
        } else {
          return dims.alto / 2; // Ajuste por eje secundario vertical
        }
      }
    }
  
    // 7. Cálculo final
    if (tipoCota === "eje") {
      return Math.round(distancia);
    } else {
      const ajusteA = ajuste(nodoA, dimsA);
      const ajusteB = ajuste(nodoB, dimsB);
      
      const libre = distancia - (ajusteA + ajusteB);
      return Math.round(libre);
    }
  }

  function agregarCota() {
    if (nodoA === nodoB) return;  // Evita agregar cotas entre el mismo nodo
    const valor = calcularCota(
        nodos[nodoA], nodos[nodoB], nodoA, nodoB,
        orientacionesNodos, nivel, niveles,
        tipoCota, margen, escala, ancho, largo, ejesV, ejesH
      );
    setCotas([...cotas, { nodoA, nodoB, tipo: tipoCota, valor }]);  // Agrega la nueva cota al estado
  }

  function eliminarCota(idx) {
    setCotas(cotas.filter((_, i) => i !== idx));
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Acotar</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          agregarCota();
        }}
        className={styles.form}
      >
        <div className={styles.inputGroup}>
          <label>Nodo A</label>
          <select value={nodoA} onChange={e => setNodoA(Number(e.target.value))}>
            {nodos.map((_, idx) => (
              <option key={idx} value={idx}>{`N${idx + 1}`}</option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Nodo B</label>
          <select value={nodoB} onChange={e => setNodoB(Number(e.target.value))}>
            {nodos.map((_, idx) => (
              <option key={idx} value={idx}>{`N${idx + 1}`}</option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Tipo</label>
          <select value={tipoCota} onChange={e => setTipoCota(e.target.value)}>
            <option value="libre">Libre</option>
            <option value="eje">Eje a eje</option>
          </select>
        </div>
        <button type="submit" className={styles.btnAgregar}>Agregar cota</button>
      </form>
      {cotas && cotas.length > 0 ? (
        <ul className={styles.lista}>
          {cotas.map((c, i) => (
            <li key={i} className={styles.cotaItem}>
              <div className={styles.cotaInfo}>
                N{c.nodoA + 1} a N{c.nodoB + 1} ({c.tipo}) = <b>{c.valor} cm</b>
              </div>
              <button onClick={() => eliminarCota(i)} className={styles.btnEliminar}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyMessage}>No hay cotas agregadas</p>
      )}
    </div>
  );
}
// export { calcularCota };