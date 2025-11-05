// ComponenteEjesNodos.js
import React, { useRef, useEffect, useState } from "react";
import LienzoEjesNodos from "./LienzoEjesNodos";
import PanelCotas, { calcularCota } from "./PanelCotas"; // Importa la función
import PanelMuros from "./PanelMuros";
import CotizadorMuros from "../modules/quote/components/CotizadorMuros";
import CotizadorPiso from "../modules/quote/components/CotizadorPiso";
import CotizadorCieloRaso from "../modules/quote/components/CotizadorCieloRaso";
import styles from "./ComponenteEjesNodos.module.css";

// Hook personalizado para localStorage
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item && item !== "undefined" ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error leyendo la clave "${key}" en localStorage:`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue)); // Guardar datos en localStorage
    } catch (error) {
      console.warn(`Error guardando la clave "${key}" en localStorage:`, error);
    }
  };

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value)); // Sincronizar localStorage cada vez que el estado cambie
  }, [key, value]);

  return [value, setStoredValue];
}
//consatante niveles para definir los tamaños de los nodos
const niveles = [
  { value: "1 de 1", ancho: 12, alto: 20 },
  { value: "1 de 2", ancho: 20, alto: 20 },
  { value: "2 de 2", ancho: 20, alto: 20 },
  { value: "1 de 3", ancho: 30, alto: 30 },
  { value: "2 de 3", ancho: 30, alto: 30 },
  { value: "3 de 3", ancho: 20, alto: 20 },
];

/** * Componente principal que maneja la creación de ejes y nodos,
 * así como la interacción del usuario para agregar ejes secundarios,
 * nodos y muros.
 */
export default function ComponenteEjesNodos() {
  // Estados principales
  const [altura, setAltura] = useLocalStorage("altura", 220); // altura de los muros por defecto 220cm, se puede ajustar según el diseño
  const [ancho, setAncho] = useLocalStorage("ancho", 200); // ancho por defecto de diseño en 200cm, se puede ajustar según el diseño
  const [largo, setLargo] = useLocalStorage("largo", 150);   // largo por defecto de diseño en 150cm, se puede ajustar según el diseño
  const [nivel, setNivel] = useLocalStorage("nivel", niveles[0].value);  // nivel actual por defecto 1 de 1
  const [ejesSecundarios, setEjesSecundarios] = useLocalStorage("ejesSecundarios", []); // Ejes secundarios iniciales vacíos, con su función de agregar y deshacer
  const [orientacionesNodos, setOrientacionesNodos] = useLocalStorage("orientacionesNodos", {}); // Orientaciones de nodos, se inicializa vacío y se actualiza según el nivel
  const [cotas, setCotas] = useLocalStorage("cotas", []); // Estado para cotas entre ejes, con su funcion de agregar y eliminar cotas
  const [muros, setMuros] = useLocalStorage("muros", []); // <--- Estado para muros

  // Estados para selección de nodos de muro
  const [nodoMuroA, setNodoMuroA] = useState(0);
  const [nodoMuroB, setNodoMuroB] = useState(1);

  // Zoom y pan
  const [stageScale, setStageScale] = useState(1);  // zoom inicial, con función de zoom in y out, para minimizar y maximizar el canvas
  const [stageX, setStageX] = useState(0);          // posición X del stage, con función de centrar vista
  const [stageY, setStageY] = useState(0);          // posición Y del stage, con función de centrar vista

  // Pan con mouse y barra espaciadora
  const [isPanning, setIsPanning] = useState(false);        // Estado para saber si se está haciendo pan
  const [spacePressed, setSpacePressed] = useState(false);    // Estado para saber si la barra espaciadora está presionada
  const panStart = useRef({ x: 0, y: 0 });                    // Posición inicial del mouse al iniciar el pan
  const stageStart = useRef({ x: 0, y: 0 });                  // Posición inicial del stage al iniciar el pan

  // --- VARIABLES DE DIBUJO Y MÁRGENES (ORDEN CORRECTO) ---
  const escala = 2;         // Factor de escala para convertir cm a px, se puede ajustar según el diseño
  const margen = 50;        // Margen en px alrededor del canvas, se puede ajustar según el diseño
  const canvasWidth = margen + ancho * escala + margen;             // Ancho total del canvas en px
  const canvasHeight = margen + largo * escala + margen;             // Largo total del canvas en px
  const extraMargin = Math.max(500, Math.max(canvasWidth, canvasHeight) * 0.5);             // Margen extra para centrar el canvas en la pantalla, se puede ajustar según el diseño
  const stageWidth = canvasWidth + extraMargin * 2;                     // Ancho total del stage con margen extra
  const stageHeight = canvasHeight + extraMargin * 2;                   // largo total del stage con margen extra 
  const offsetX = extraMargin;          // Offset para centrar el canvas en la pantalla en X
  const offsetY = extraMargin;          // Offset para centrar el canvas en la pantalla en Y

  // Ejes principales
  const eje0 = { x1: margen, y1: margen, x2: margen + ancho * escala, y2: margen };       // Eje principal superior
  const eje1 = { x1: margen + ancho * escala, y1: margen, x2: margen + ancho * escala, y2: margen + largo * escala };      // Eje principal derecho
  const eje2 = { x1: margen + ancho * escala, y1: margen + largo * escala, x2: margen, y2: margen + largo * escala };       // Eje principal inferior
  const eje3 = { x1: margen, y1: margen + largo * escala, x2: margen, y2: margen };      // Eje principal izquierdo

  // Filtrar ejes secundarios por orientación
  const ejesV = ejesSecundarios.filter(e => e.orientacion === "V");     // Filtrar ejes secundarios verticales
  const ejesH = ejesSecundarios.filter(e => e.orientacion === "H");     // Filtrar ejes secundarios horizontales

  // Nodos iniciales basados en los ejes principales
  let nodos = [
    { x: eje0.x1, y: eje0.y1 },     // Nodo superior izquierdo
    { x: eje1.x1, y: eje1.y1 },     // Nodo superior derecho
    { x: eje2.x1, y: eje2.y1 },     // Nodo inferior derecho
    { x: eje3.x1, y: eje3.y1 },   // Nodo inferior izquierdo
  ];
 
  // Agregar ejes secundarios y nodos
  ejesV.forEach((ev) => {                         // Agregar nodos para ejes secundarios verticales
    const x = eje0.x1 + ev.distancia * escala;    // Calcular la posición X del eje secundario
    nodos.push({ x, y: eje0.y1 });                // Nodo superior del eje secundario
    nodos.push({ x, y: eje2.y1 });                // Nodo inferior del eje secundario
    ejesH.forEach((eh) => {                       // Agregar nodos en la intersección de ejes secundarios
      const y = eje0.y1 + eh.distancia * escala;  // Calcular la posición Y del eje secundario
      nodos.push({ x, y });                       // Nodo de intersección
    });
  });
  
  ejesH.forEach((eh) => {                         // Agregar nodos para ejes secundarios horizontales
    const y = eje0.y1 + eh.distancia * escala;    // Calcular la posición Y del eje secundario
    nodos.push({ x: eje0.x1, y });                // Nodo izquierdo del eje secundario
    nodos.push({ x: eje1.x1, y });                // Nodo derecho del eje secundario
  });
  // Eliminar nodos duplicados basados en posición (x, y) para evitar superposiciones
  nodos = nodos.filter(
    (n, idx, arr) =>
      arr.findIndex(m => Math.abs(m.x - n.x) < 1 && Math.abs(m.y - n.y) < 1) === idx  // Compara con una tolerancia de 1 px para evitar duplicados por precisión de escala
  );

  // Handlers para agregar ejes secundarios
  const [orientacion, setOrientacion] = useState("V");      // Orientación del eje secundario, por defecto vertical
  const [distancia, setDistancia] = useState(0);            // Distancia del eje secundario desde el eje principal, por defecto 0

  // Función para agregar un eje secundario
  const agregarEje = () => {
    if (
      (orientacion === "V" && distancia > 0 && distancia < ancho) ||
      (orientacion === "H" && distancia > 0 && distancia < largo)      //compara la distancia con el ancho o largo según la orientación
    ) {
      setEjesSecundarios([...ejesSecundarios, { orientacion, distancia }]);     // Agrega el nuevo eje secundario al estado
      setDistancia(0);          // Resetea la distancia a 0 después de agregar el eje
    }
  };

  // Función para deshacer el último eje secundario agregado
  const deshacerEje = () => {
    setEjesSecundarios(ejesSecundarios.slice(0, -1)); // Elimina el último eje secundario del estado
  };

  // Selector de orientación solo para 1 de 1
  const handleOrientacionNodo = (idx, value) => {
    setOrientacionesNodos({ ...orientacionesNodos, [idx]: value });   // Actualiza la orientación del nodo en el estado
  };

  // --- ZOOM CON LA RUEDA DEL MOUSE ---
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;  // Factor de zoom 
    const oldScale = stageScale;  // Escala actual 
    const pointer = e.target.getStage().getPointerPosition();   // Posición del puntero del mouse
    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,       // Punto del mouse en coordenadas del stage en X
      y: (pointer.y - stageY) / oldScale,       // Punto del mouse en coordenadas del stage en Y
    };
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;  // Zoom in/out
    newScale = Math.max(0.05, Math.min(10, newScale));  // Limita el zoom entre 0.05 y 10
    // Nuevo stageX y stageY para centrar el zoom en el mouse
    setStageScale(newScale);  // Actualiza el estado con la nueva escala
    setStageX(pointer.x - mousePointTo.x * newScale);   // Calcula la nueva posición X
    setStageY(pointer.y - mousePointTo.y * newScale);   // Calcula la nueva posición Y
  };

  // Botones de zoom
  const zoomIn = () => {    // Aumenta el zoom
    const scaleBy = 1.1;
    let newScale = Math.min(stageScale * scaleBy, 10);  // Limita el zoom máximo a 10
    setStageScale(newScale);      // Actualiza el estado con la nueva escala
    setStageX((900 - stageWidth * newScale) / 2 + offsetX * newScale);    // Calcula la nueva posición X
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);   // Calcula la nueva posición Y
  };

  const zoomOut = () => {     // Disminuye el zoom
    const scaleBy = 1.1;
    let newScale = Math.max(stageScale / scaleBy, 0.05);    // Limita el zoom mínimo a 0.05
    setStageScale(newScale);
    setStageX((900 - stageWidth * newScale) / 2 + offsetX * newScale);    // Calcula la nueva posición X
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);   // Calcula la nueva posición Y
  };

  // Botón de centrar vista
  const centrarVista = () => {
    setStageX((900 - stageWidth * stageScale) / 2 + offsetX * stageScale);      // Centra el stage en X
    setStageY((600 - stageHeight * stageScale) / 2 + offsetY * stageScale);     // Centra el stage en Y
  };

  // --- PAN CON CLIC Y BARRA ESPACIADORA ---
  const handleMouseDown = (e) => {
    if (!spacePressed) return;    // Solo permite pan si la barra espaciadora está presionada
    setIsPanning(true);         // Activa el modo de pan
    panStart.current = { x: e.clientX, y: e.clientY };      // Guarda la posición inicial del mouse
    stageStart.current = { x: stageX, y: stageY };          // Guarda la posición inicial del stage
  };

  // Maneja el movimiento del mouse durante el pan
  const handleMouseMove = (e) => {
    if (!isPanning) return;     // Solo actualiza si está en modo pan
    const dx = e.clientX - panStart.current.x;      // Diferencia en X desde el inicio
    const dy = e.clientY - panStart.current.y;      // Diferencia en Y desde el inicio
    setStageX(stageStart.current.x + dx);           // Actualiza la posición X del lienzo
    setStageY(stageStart.current.y + dy);           // Actualiza la posición Y del lienzo
  };

  // Maneja el mouse up para salir del modo pan
  const handleMouseUp = () => {
    setIsPanning(false);    // Desactiva el modo pan
  };

  const limpiarDatos = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar todos los datos?")) {
      localStorage.removeItem("muros"); // Eliminar solo los datos de muros
      localStorage.removeItem("ejesSecundarios"); // Eliminar solo los datos de ejes secundarios
      setMuros([]); // Resetear el estado de muros
      setEjesSecundarios([]); // Resetear el estado de ejes secundarios
    }
  };

  useEffect(() => {
    console.log("Muros recuperados:", muros);
    console.log("Ejes secundarios recuperados:", ejesSecundarios);
  }, []);
  // Detectar barra espaciadora
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") setSpacePressed(true);    // Activa el pan al presionar la barra espaciadora
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") setSpacePressed(false);   // Desactiva el pan al soltar la barra espaciadora
    };
    window.addEventListener("keydown", handleKeyDown);    // Escucha el evento de tecla presionada
    window.addEventListener("keyup", handleKeyUp);        // Escucha el evento de tecla soltada
    return () => {
      window.removeEventListener("keydown", handleKeyDown);   // Limpia el listener al desmontar el componente
      window.removeEventListener("keyup", handleKeyUp);     // Limpia el listener al desmontar el componente
    };
  }, []);             // Solo se ejecuta una vez al montar el componente

  // Manejar eventos de mouse para pan
  useEffect(() => {
    if (isPanning) {      // Si está en modo pan, agrega los listeners de mouse
      window.addEventListener("mousemove", handleMouseMove);    // Actualiza la posición del lienzo al mover el mouse
      window.addEventListener("mouseup", handleMouseUp);        // Sale del modo pan al soltar el mouse
    } else {
      window.removeEventListener("mousemove", handleMouseMove);   // Elimina el listener de movimiento del mouse al salir del modo pan
      window.removeEventListener("mouseup", handleMouseUp);       // Elimina el listener de mouse up al salir del modo pan
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);       // Limpia el listener de movimiento del mouse al desmontar el componente
      window.removeEventListener("mouseup", handleMouseUp);         // Limpia el listener de mouse up al desmontar el componente
    };
  }, [isPanning]);    // Solo se ejecuta cuando cambia el estado de pan

  
  // Centrar vista al cargar o cambiar tamaño/zoom
  useEffect(() => {
    centrarVista();
    // eslint-disable-next-line
  }, [canvasWidth, canvasHeight, stageScale]);


  // Renderiza el componente
  return (
    <div className={styles.container}>
      {/* Controles principales */}
      <div className={styles.controlesSuperiores}>
        <div className={styles.inputGroup}>
          <label>Ancho (cm)</label>
          <input
            type="number"
            value={ancho}
            min={100}               
            max={1000}
            onChange={e => setAncho(Number(e.target.value))}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Largo (cm)</label>
          <input
            type="number"
            value={largo}
            min={100}
            max={1000}
            onChange={e => setLargo(Number(e.target.value))}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Alto (cm)</label>
          <input
            type="number"
            value={altura}
            min={100}
            max={350}
            onChange={e => setAltura(Number(e.target.value))}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Nivel</label>
          <select value={nivel} onChange={e => { setNivel(e.target.value); setOrientacionesNodos({}); }}>
            {niveles.map(n => (
              <option key={n.value} value={n.value}>
                {n.value}
              </option>
            ))}
          </select>
        </div>
        <button onClick={zoomIn} className={styles.btnPrimary}>Zoom +</button>
        <button onClick={zoomOut} className={styles.btnPrimary}>Zoom -</button>
        <button onClick={centrarVista} className={styles.btnPrimary}>Centrar vista</button>
        <button onClick={limpiarDatos} className={styles.btnDanger}>
          Limpiar datos
        </button>
      </div>

      {/* Controles de ejes secundarios */}
      <div className={styles.controlesSecundarios}>
        <div className={styles.inputGroup}>
          <label>Eje secundario</label>
          <select value={orientacion} onChange={e => setOrientacion(e.target.value)}>
            <option value="V">Vertical</option>
            <option value="H">Horizontal</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Distancia (cm)</label>
          <input
            type="number"
            value={distancia}
            min={1}
            max={orientacion === "V" ? ancho - 1 : largo - 1}
            onChange={e => setDistancia(Number(e.target.value))}
          />
        </div>
        <button onClick={agregarEje} className={styles.btnPrimary}>Agregar eje</button>
        <button onClick={deshacerEje} disabled={ejesSecundarios.length === 0} className={styles.btnPrimary}>
          Deshacer último eje
        </button>
        <p className={styles.instrucciones}>
          <b>Zoom:</b> rueda del mouse | <b>Pan:</b> barra espaciadora + clic
        </p>
      </div>
          
      {/* Lienzo */}
      <LienzoEjesNodos
        ancho={ancho}
        largo={largo}
        nivel={nivel}
        niveles={niveles}
        ejesSecundarios={ejesSecundarios}
        orientacionesNodos={orientacionesNodos}
        escala={escala}
        margen={margen}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        stageScale={stageScale}                   //se ingresa la escala del stage con respecto al zoom
        stageX={stageX}
        stageY={stageY}
        handleWheel={handleWheel}
        handleMouseDown={handleMouseDown}
        spacePressed={spacePressed}
        isPanning={isPanning}
        nodos={nodos}
        cotas={cotas}
        muros={muros}
      />

      {/* Panel de cotas */}
      <PanelCotas
        nodos={nodos}
        cotas={cotas}
        setCotas={setCotas}
        escala={escala}
        orientacionesNodos={orientacionesNodos}
        nivel={nivel}
        niveles={niveles}
        margen={margen}
        ancho={ancho}
        largo={largo}
        ejesV={ejesV}
        ejesH={ejesH}
      />

      {/* Panel de muros */}
      <PanelMuros
        nodos={nodos}
        muros={muros}
        setMuros={setMuros}
        escala={escala}
        orientacionesNodos={orientacionesNodos}
        nivel={nivel}         // <--- ¡AQUÍ!
        niveles={niveles}     // <--- ¡Y AQUÍ!
        margen={margen}
        ancho={ancho}
        largo={largo}
        ejesV={ejesV}
        ejesH={ejesH}
        altura={altura}
      />

      {/* Cotizador de muros */}
      <CotizadorMuros
        muros={muros}
        altura={altura}
        nivel={nivel}
      />

      {/* Cotizador de pisos */}
      <CotizadorPiso largo={largo} ancho={ancho} />

      {/* Cotizador de cielo raso */}
      <CotizadorCieloRaso largo={largo} ancho={ancho} />

      {/* Selector de orientación de nodos SOLO para 1 de 1 */}
      {nivel === "1 de 1" && (
        <div className={styles.panelOrientacion}>
          <b>Orientación de nodos</b>
          <ul>
            {nodos.map((n, idx) => (
              <li key={idx}>
                Nodo {idx + 1}:
                <select
                  value={orientacionesNodos[idx] || "horizontal"}
                  onChange={e => handleOrientacionNodo(idx, e.target.value)}
                >
                  <option value="horizontal">Horizontal (20x12)</option>
                  <option value="vertical">Vertical (12x20)</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de ejes secundarios */}
      <div className={styles.listaEjes}>
        <b>Ejes secundarios</b>
        <ul>
          {ejesSecundarios.map((e, i) => (
            <li key={i}>
              {e.orientacion === "V" ? "Vertical" : "Horizontal"} a {e.distancia} cm
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}