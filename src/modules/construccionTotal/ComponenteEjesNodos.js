/* @jsxRuntime classic */
/* @jsx React.createElement */
// ComponenteEjesNodos.js
import React, { useRef, useEffect, useState, useMemo } from "react";
import LienzoEjesNodos from "./LienzoEjesNodos";
import PanelCotas, { calcularCota } from "../../components/PanelCotas"; // Importa la función
import PanelMuros from "../../components/PanelMuros";
import CotizadorMuros from "../quote/components/CotizadorMuros";
import CotizadorPiso from "../quote/components/CotizadorPiso";
import CotizadorCieloRaso from "../quote/components/CotizadorCieloRaso";
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

const defaultResistenciasTerreno = [
  { profundidad: "0.2", resistencia: "30" },
  { profundidad: "1.2", resistencia: "165" },
  { profundidad: "4.5", resistencia: "180" },
  { profundidad: "8.0", resistencia: "195" },
  { profundidad: "15.0", resistencia: "205" },
];

const defaultColumnasDatos = [
  { muros: "2", alto: "220", tipo_columna: "1" },
  { muros: "3", alto: "220", tipo_columna: "2" },
];

const defaultColumnasCubiertaDatos = [
  { muros: "2", alto: "50", tipo_columna: "1" },
  { muros: "3", alto: "115", tipo_columna: "2" },
];

const defaultCubiertaConfig = {
  cuchilla: "1",
  clase: "1",
  caballete: "1",
  flanche: "0",
  base: "0",
  canales: ["0", "0", "0"],
};

const defaultCubiertaTechos = [
  { tipo: "1", alto: "100", largo: "550", ancho: "344,356", teja: "6" },
];

const defaultCubiertaEjesMuros = [];

const defaultMurosCotizacion = [];

const emptyTecho = { tipo: "1", alto: "", largo: "", ancho: "", teja: "" };

const emptyMuroCotizacion = {
  nombre: "",
  tipo: "muroEntero",
  piso: "1 de 1",
  ancho_estructura: "",
  ancho: "",
  clase: "0",
  estructura: "1",
  medida1: "",
  medida2: "",
  medida3: "",
  alto: "",
  ventanaTipo: "",
  ventanaUbicacion: "centro",
  ventanaAncho: "",
  ventanaAlto: "",
  ventanaAncho2: "",
};

const emptyCubiertaMuro = {
  nombre: "",
  tipo: "cuchilla",
  piso: "4 de 4",
  ancho_estructura: "",
  ancho: "",
  clase: "0",
  estructura: "1",
  medida1: "",
  medida2: "",
  medida3: "",
  alto: "",
  ventanaTipo: "",
  ventanaUbicacion: "centro",
  ventanaAncho: "",
  ventanaAlto: "",
  ventanaAncho2: "",
};

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

  const [obraGris, setObraGris] = useLocalStorage("construccionTotal_obraGris", false);
  const [obraBlanca, setObraBlanca] = useLocalStorage("construccionTotal_obraBlanca", false);
  const [listaMateriales, setListaMateriales] = useLocalStorage("construccionTotal_listaMateriales", true);
  const [idLadrillo, setIdLadrillo] = useLocalStorage("construccionTotal_idLadrillo", "1");
  const [resistenciasTerreno, setResistenciasTerreno] = useLocalStorage(
    "construccionTotal_resistencias",
    defaultResistenciasTerreno
  );
  const [columnasEspecialidad, setColumnasEspecialidad] = useLocalStorage(
    "construccionTotal_columnasEspecialidad",
    "1"
  );
  const [columnasDatos, setColumnasDatos] = useLocalStorage(
    "construccionTotal_columnasDatos",
    defaultColumnasDatos
  );
  const [columnasCubiertaEspecialidad, setColumnasCubiertaEspecialidad] = useLocalStorage(
    "construccionTotal_columnasCubiertaEspecialidad",
    "1"
  );
  const [columnasCubiertaDatos, setColumnasCubiertaDatos] = useLocalStorage(
    "construccionTotal_columnasCubiertaDatos",
    defaultColumnasCubiertaDatos
  );
  const [cubiertaConfig, setCubiertaConfig] = useLocalStorage(
    "construccionTotal_cubiertaConfig",
    defaultCubiertaConfig
  );
  const [cubiertaTechos, setCubiertaTechos] = useLocalStorage(
    "construccionTotal_cubiertaTechos",
    defaultCubiertaTechos
  );
  const [cubiertaEjesMuros, setCubiertaEjesMuros] = useLocalStorage(
    "construccionTotal_cubiertaEjesMuros",
    defaultCubiertaEjesMuros
  );
  const [murosCotizacion, setMurosCotizacion] = useLocalStorage(
    "construccionTotal_murosCotizacion",
    defaultMurosCotizacion
  );
  const [payloadGuardado, setPayloadGuardado] = useState(null);
  const [mensajeSistema, setMensajeSistema] = useState("");

  const resistencias = Array.isArray(resistenciasTerreno) ? resistenciasTerreno : [];
  const columnasDatosLista = Array.isArray(columnasDatos) ? columnasDatos : [];
  const columnasCubiertaLista = Array.isArray(columnasCubiertaDatos) ? columnasCubiertaDatos : [];
  const techosLista = Array.isArray(cubiertaTechos) ? cubiertaTechos : [];
  const cubiertaEjesLista = Array.isArray(cubiertaEjesMuros) ? cubiertaEjesMuros : [];
  const murosCotizacionLista = Array.isArray(murosCotizacion) ? murosCotizacion : [];
  const canalesValores =
    Array.isArray(cubiertaConfig?.canales) && cubiertaConfig.canales.length
      ? cubiertaConfig.canales
      : ["0", "0", "0"];

  const parseNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const ensureNumber = (value, fallback = 0) => {
    const parsed = parseNumber(value);
    return parsed === null ? fallback : parsed;
  };

  const addResistencia = () =>
    setResistenciasTerreno([...resistencias, { profundidad: "", resistencia: "" }]);

  const updateResistencia = (index, field, value) => {
    const next = [...resistencias];
    next[index] = { ...next[index], [field]: value };
    setResistenciasTerreno(next);
  };

  const removeResistencia = (index) =>
    setResistenciasTerreno(resistencias.filter((_, i) => i !== index));

  const addColumnaDato = () =>
    setColumnasDatos([...columnasDatosLista, { muros: "", alto: "", tipo_columna: "" }]);

  const updateColumnaDato = (index, field, value) => {
    const next = [...columnasDatosLista];
    next[index] = { ...next[index], [field]: value };
    setColumnasDatos(next);
  };

  const removeColumnaDato = (index) =>
    setColumnasDatos(columnasDatosLista.filter((_, i) => i !== index));

  const addColumnaCubiertaDato = () =>
    setColumnasCubiertaDatos([
      ...columnasCubiertaLista,
      { muros: "", alto: "", tipo_columna: "" },
    ]);

  const updateColumnaCubiertaDato = (index, field, value) => {
    const next = [...columnasCubiertaLista];
    next[index] = { ...next[index], [field]: value };
    setColumnasCubiertaDatos(next);
  };

  const removeColumnaCubiertaDato = (index) =>
    setColumnasCubiertaDatos(columnasCubiertaLista.filter((_, i) => i !== index));

  const handleCubiertaConfigChange = (field, value) => {
    setCubiertaConfig({ ...cubiertaConfig, [field]: value });
  };

  const handleCubiertaCanalChange = (index, value) => {
    const next = [...canalesValores];
    next[index] = value;
    setCubiertaConfig({ ...cubiertaConfig, canales: next });
  };

  const addCubiertaTecho = () => setCubiertaTechos([...techosLista, { ...emptyTecho }]);

  const updateCubiertaTecho = (index, field, value) => {
    const next = [...techosLista];
    next[index] = { ...next[index], [field]: value };
    setCubiertaTechos(next);
  };

  const removeCubiertaTecho = (index) =>
    setCubiertaTechos(techosLista.filter((_, i) => i !== index));

  const addCubiertaMuro = () =>
    setCubiertaEjesMuros([...cubiertaEjesLista, { ...emptyCubiertaMuro }]);

  const updateCubiertaMuro = (index, field, value) => {
    const next = [...cubiertaEjesLista];
    next[index] = { ...next[index], [field]: value };
    setCubiertaEjesMuros(next);
  };

  const removeCubiertaMuro = (index) =>
    setCubiertaEjesMuros(cubiertaEjesLista.filter((_, i) => i !== index));

  const addMuroCotizacion = () =>
    setMurosCotizacion([...murosCotizacionLista, { ...emptyMuroCotizacion }]);

  const updateMuroCotizacion = (index, field, value) => {
    const next = [...murosCotizacionLista];
    next[index] = { ...next[index], [field]: value };
    setMurosCotizacion(next);
  };

  const removeMuroCotizacion = (index) =>
    setMurosCotizacion(murosCotizacionLista.filter((_, i) => i !== index));

  const panelTipoToPayload = (tipo = "") => {
    switch (tipo) {
      case "entero":
        return "muroEntero";
      case "ventana":
        return "muroVentana";
      case "puerta":
        return "muroPuerta";
      case "puertaventana":
        return "muroPuertaVentana";
      case "sinMuro":
        return "sinMuro";
      default:
        return tipo || "muroEntero";
    }
  };

  const importarMurosDesdePanel = () => {
    if (!muros || muros.length === 0) {
      setMensajeSistema("No hay muros definidos en el panel para importar.");
      return;
    }
    const convertidos = muros.map((muro, index) => {
      const cotaLibre = parseNumber(muro?.cotaLibre) ?? 0;
      return {
        ...emptyMuroCotizacion,
        nombre: `Muro ${index + 1}`,
        tipo: panelTipoToPayload(muro?.tipo),
        ancho_estructura: String(cotaLibre || 0),
        ancho: String(cotaLibre || 0),
        clase: "0",
        estructura: "1",
        alto: String(altura),
      };
    });
    setMurosCotizacion(convertidos);
    setMensajeSistema("Se importaron los muros del panel. Revisa y completa la información antes de cotizar.");
  };

  const columnasPayload = columnasDatosLista
    .filter(
      (item) => item.muros !== "" || item.alto !== "" || item.tipo_columna !== ""
    )
    .map((item) => ({
      muros: ensureNumber(item.muros),
      alto: ensureNumber(item.alto),
      tipo_columna: ensureNumber(item.tipo_columna),
    }));

  const columnasCubiertaPayload = columnasCubiertaLista
    .filter(
      (item) => item.muros !== "" || item.alto !== "" || item.tipo_columna !== ""
    )
    .map((item) => ({
      muros: ensureNumber(item.muros),
      alto: ensureNumber(item.alto),
      tipo_columna: ensureNumber(item.tipo_columna),
    }));

  const murosPayload = murosCotizacionLista
    .filter(
      (item) =>
        item.nombre !== "" ||
        item.ancho_estructura !== "" ||
        item.ancho !== "" ||
        item.tipo !== ""
    )
    .map((item, index) => {
      const ventana =
        item.ventanaTipo && item.ventanaTipo !== "ninguna"
          ? {
              tipo: item.ventanaTipo,
              ubicacion: item.ventanaUbicacion || "centro",
              ancho: ensureNumber(item.ventanaAncho),
              alto: ensureNumber(item.ventanaAlto),
              ...(item.ventanaAncho2 !== ""
                ? { ancho2: ensureNumber(item.ventanaAncho2) }
                : {}),
            }
          : null;

      if (ventana && ventana.ancho === 0 && ventana.alto === 0) {
        ventana.ancho = ensureNumber(item.ventanaAncho, 0);
        ventana.alto = ensureNumber(item.ventanaAlto, 0);
        if (!item.ventanaAncho && !item.ventanaAlto) {
          ventana.ancho = undefined;
          ventana.alto = undefined;
        }
        if (ventana.ancho === undefined && ventana.alto === undefined) {
          ventana.ancho = 0;
          ventana.alto = 0;
        }
        if (ventana && ventana.ancho2 === undefined) {
          delete ventana.ancho2;
        }
      }

      return {
        nombre: item.nombre || `M${index + 1}`,
        tipo: item.tipo || "muroEntero",
        ancho_estructura: ensureNumber(item.ancho_estructura),
        piso: item.piso || nivel,
        ancho: ensureNumber(item.ancho),
        clase: ensureNumber(item.clase),
        estructura: ensureNumber(item.estructura, 1),
        medida1: ensureNumber(item.medida1),
        medida2: ensureNumber(item.medida2),
        medida3: ensureNumber(item.medida3),
        alto: ensureNumber(item.alto, altura),
        ventana,
        vigaCorona: [],
        viga: [],
        enlace: [],
        cinta: [],
        columneta: [],
        riostra: [],
      };
    });

  const cubTechosPayload = techosLista
    .filter((item) => item.alto !== "" || item.largo !== "" || item.ancho !== "")
    .map((item) => {
      const anchoValores =
        item.ancho && item.ancho.trim().length > 0
          ? item.ancho
              .split(",")
              .map((parte) => ensureNumber(parte.trim(), 0))
              .filter((valor) => Number.isFinite(valor))
          : [];
      return {
        tipo: ensureNumber(item.tipo),
        alto: ensureNumber(item.alto),
        largo: ensureNumber(item.largo),
        ancho: anchoValores,
        teja: ensureNumber(item.teja),
      };
    });

  const cubEjesPayload = cubiertaEjesLista
    .filter(
      (item) =>
        item.nombre !== "" ||
        item.ancho_estructura !== "" ||
        item.ancho !== "" ||
        item.tipo !== ""
    )
    .map((item, index) => {
      const ventana =
        item.ventanaTipo && item.ventanaTipo !== "ninguna"
          ? {
              tipo: item.ventanaTipo,
              ubicacion: item.ventanaUbicacion || "centro",
              ancho: ensureNumber(item.ventanaAncho),
              alto: ensureNumber(item.ventanaAlto),
              ...(item.ventanaAncho2 !== ""
                ? { ancho2: ensureNumber(item.ventanaAncho2) }
                : {}),
            }
          : null;

      return {
        nombre: item.nombre || `Cubierta ${index + 1}`,
        tipo: item.tipo || "cuchilla",
        ancho_estructura: ensureNumber(item.ancho_estructura),
        piso: item.piso || "4 de 4",
        ancho: ensureNumber(item.ancho),
        clase: ensureNumber(item.clase),
        estructura: ensureNumber(item.estructura, 1),
        medida1: ensureNumber(item.medida1),
        medida2: ensureNumber(item.medida2),
        medida3: ensureNumber(item.medida3),
        alto: ensureNumber(item.alto),
        ventana,
        vigaCorona: [],
        viga: [],
        enlace: [],
        cinta: [],
        columneta: [],
        riostra: [],
      };
    });

  const resistenciaPayload = resistencias
    .filter((item) => item.profundidad !== "" && item.resistencia !== "")
    .map((item) => ({
      profundidad: ensureNumber(item.profundidad),
      resistencia: ensureNumber(item.resistencia),
    }));

  const payload = useMemo(
    () => ({
      obra_gris: Boolean(obraGris),
      obra_blanca: Boolean(obraBlanca),
      lista_materiales: Boolean(listaMateriales),
      ancho: ensureNumber(ancho, 0),
      largo: ensureNumber(largo, 0),
      altura: ensureNumber(altura, 0),
      resistencia_terreno: resistenciaPayload,
      id_ladrillo: ensureNumber(idLadrillo, 1),
      columnas: {
        especialidad: ensureNumber(columnasEspecialidad, 1),
        datos: columnasPayload,
      },
      ejes_muros: murosPayload,
      cubierta: {
        cuchilla: ensureNumber(cubiertaConfig?.cuchilla, 0),
        clase: ensureNumber(cubiertaConfig?.clase, 0),
        caballete: ensureNumber(cubiertaConfig?.caballete, 0),
        flanche: ensureNumber(cubiertaConfig?.flanche, 0),
        canales: canalesValores.map((valor) => ensureNumber(valor, 0)),
        base: ensureNumber(cubiertaConfig?.base, 0),
        techos: cubTechosPayload,
        ejes_muros: cubEjesPayload,
      },
      columnas_cubierta: {
        especialidad: ensureNumber(columnasCubiertaEspecialidad, 1),
        datos: columnasCubiertaPayload,
      },
    }),
    [
      obraGris,
      obraBlanca,
      listaMateriales,
      ancho,
      largo,
      altura,
      resistenciaPayload,
      idLadrillo,
      columnasEspecialidad,
      columnasPayload,
      murosPayload,
      cubiertaConfig,
      canalesValores,
      cubTechosPayload,
      cubEjesPayload,
      columnasCubiertaEspecialidad,
      columnasCubiertaPayload,
    ]
  );

  const payloadString = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  const handleGuardarCotizacion = () => {
    const data = payload;
    try {
      window.localStorage.setItem("construccionTotal_cotizacionPayload", JSON.stringify(data));
      setPayloadGuardado({ timestamp: Date.now() });
      setMensajeSistema("Datos de cotización guardados en localStorage.");
    } catch (error) {
      console.error("Error guardando la cotización total:", error);
      setMensajeSistema("No se pudo guardar la cotización en localStorage.");
    }
    console.log("Payload cotización total:", data);
  };

  const handleCopiarPayload = async () => {
    try {
      await navigator.clipboard.writeText(payloadString);
      setMensajeSistema("JSON copiado al portapapeles.");
    } catch (error) {
      console.error("Error copiando el payload:", error);
      setMensajeSistema("No fue posible copiar el JSON automáticamente.");
    }
  };

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

  // --- VARIABLES DE DIBUJO Y MÁRGENES ---
  const dimensionMaxima = Math.max(ancho, largo, 1);
  const escalaCalculada = 780 / dimensionMaxima;
  const escala = Number.isFinite(escalaCalculada) ? Math.min(2, Math.max(0.45, escalaCalculada)) : 2;
  const margen = 50;
  const canvasWidth = margen + ancho * escala + margen;
  const canvasHeight = margen + largo * escala + margen;
  const extraMargin = Math.max(420, Math.max(canvasWidth, canvasHeight) * 0.6);
  const stageWidth = canvasWidth + extraMargin * 2;
  const stageHeight = canvasHeight + extraMargin * 2;
  const offsetX = extraMargin;
  const offsetY = extraMargin;
  const stageContainerRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 650 });
  useEffect(() => {
    const updateViewport = () => {
      if (stageContainerRef.current) {
        const { clientWidth, clientHeight } = stageContainerRef.current;
        setViewportSize({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const viewportWidth = viewportSize.width || 1200;
  const viewportHeight = viewportSize.height || 650;


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
    let newScale = Math.min(stageScale * scaleBy, 10);
    setStageScale(newScale);
    setStageX((viewportWidth - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((viewportHeight - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const zoomOut = () => {     // Disminuye el zoom
    const scaleBy = 1.1;
    let newScale = Math.max(stageScale / scaleBy, 0.05);
    setStageScale(newScale);
    setStageX((viewportWidth - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((viewportHeight - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  // Botón de centrar vista
  const centrarVista = () => {
    setStageX((viewportWidth - stageWidth * stageScale) / 2 + offsetX * stageScale);
    setStageY((viewportHeight - stageHeight * stageScale) / 2 + offsetY * stageScale);
  };

  // --- PAN CON CLIC Y BARRA ESPACIADORA ---
  const handleMouseDown = (event) => {
    const evt = event?.evt || event;
    if (!spacePressed) return;    // Solo permite pan si la barra espaciadora está presionada
    setIsPanning(true);         // Activa el modo de pan
    panStart.current = { x: evt.clientX, y: evt.clientY };      // Guarda la posición inicial del mouse
    stageStart.current = { x: stageX, y: stageY };          // Guarda la posición inicial del stage
  };

  // Maneja el movimiento del mouse durante el pan
  const handleMouseMove = (event) => {
    if (!isPanning) return;     // Solo actualiza si está en modo pan
    const dx = event.clientX - panStart.current.x;      // Diferencia en X desde el inicio
    const dy = event.clientY - panStart.current.y;      // Diferencia en Y desde el inicio
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
  }, [canvasWidth, canvasHeight, stageScale, viewportWidth, viewportHeight]);


  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Planeación integral</p>
          <h2 className={styles.title}>Esquema de ejes y nodos</h2>
          <p className={styles.hint}>
            Configura la retícula estructural base y alimenta los cotizadores con dimensiones fiables.
          </p>
        </div>
        <div className={styles.headerActions}>
          {/* <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={centrarVista}>
            Centrar vista
          </button> */}
          <button type="button" className={`${styles.button} ${styles.buttonDanger}`} onClick={limpiarDatos}>
            Limpiar datos
          </button>
        </div>
      </header>

      <div className={styles.sections}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Dimensiones del proyecto</h3>
            <p className={styles.cardHint}>Define las medidas generales para escalar el plano.</p>
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="ejes-ancho">Ancho (cm)</label>
              <input
                id="ejes-ancho"
                type="number"
                min={100}
                max={1000}
                value={ancho}
                onChange={(event) => setAncho(Number(event.target.value))}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="ejes-largo">Largo (cm)</label>
              <input
                id="ejes-largo"
                type="number"
                min={100}
                max={1000}
                value={largo}
                onChange={(event) => setLargo(Number(event.target.value))}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="ejes-alto">Alto (cm)</label>
              <input
                id="ejes-alto"
                type="number"
                min={100}
                max={350}
                value={altura}
                onChange={(event) => setAltura(Number(event.target.value))}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="ejes-nivel">Nivel</label>
              <select
                id="ejes-nivel"
                value={nivel}
                onChange={(event) => {
                  setNivel(event.target.value);
                  setOrientacionesNodos({});
                }}
              >
                {niveles.map((nivelItem) => (
                  <option key={nivelItem.value} value={nivelItem.value}>
                    {nivelItem.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Ejes secundarios</h3>
            <p className={styles.cardHint}>
              Divide la planta en franjas para identificar muros interiores y apoyos.
            </p>
          </div>
          <div className={styles.inlineGrid}>
            <div className={styles.field}>
              <label htmlFor="ejes-orientacion">Orientación</label>
              <select
                id="ejes-orientacion"
                value={orientacion}
                onChange={(event) => setOrientacion(event.target.value)}
              >
                <option value="V">Vertical</option>
                <option value="H">Horizontal</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="ejes-distancia">Distancia (cm)</label>
              <input
                id="ejes-distancia"
                type="number"
                min={1}
                max={orientacion === "V" ? ancho - 1 : largo - 1}
                value={distancia}
                onChange={(event) => setDistancia(Number(event.target.value))}
              />
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={agregarEje}
              >
                Añadir eje
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonGhost}`}
                onClick={deshacerEje}
                disabled={ejesSecundarios.length === 0}
              >
                Deshacer último
              </button>
            </div>
          </div>
          <p className={styles.helper}>
            <strong>Tip:</strong> Usa la rueda del mouse para acercar/alejar y mantén la barra espaciadora
            presionada para mover el plano.
          </p>
          {ejesSecundarios.length > 0 ? (
            <ul className={styles.ejesList}>
              {ejesSecundarios.map((eje, index) => (
                <li key={`${eje.orientacion}-${eje.distancia}-${index}`}>
                  <span>{eje.orientacion === "V" ? "Vertical" : "Horizontal"}</span>
                  <strong>{eje.distancia} cm</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              Aún no has agregado ejes secundarios. Puedes dejar esta sección vacía si el proyecto no los requiere.
            </p>
          )}
        </section>

        <section className={`${styles.card} ${styles.cardStage}`}>
          <div className={styles.cardHeader}>
            <h3>Plano interactivo</h3>
            <p className={styles.cardHint}>
              Visualiza la retícula con sus nodos, cotas automáticas y componentes estructurales.
            </p>
          </div>
          <div
            className={styles.stageContainer}
            ref={stageContainerRef}
            style={{ cursor: spacePressed ? (isPanning ? "grabbing" : "grab") : "default" }}
            onMouseDown={handleMouseDown}
          >
            <div className={styles.stageInner}>
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
                stageScale={stageScale}
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
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={zoomIn}>
              Zoom +
            </button>
            <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={zoomOut}>
              Zoom -
            </button>
            <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={centrarVista}>
              Centrar vista
            </button>
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardEmbed}`}>
          <div className={styles.cardHeader}>
            <h3>Cotas personalizadas</h3>
            <p className={styles.cardHint}>Calcula distancias libres o entre ejes para documentación.</p>
          </div>
          <div className={styles.embed}>
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
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardEmbed}`}>
          <div className={styles.cardHeader}>
            <h3>Gestión de muros</h3>
            <p className={styles.cardHint}>
              Define muros por tramos, puertas y ventanas para alimentar el cotizador.
            </p>
          </div>
          <div className={styles.embed}>
            <PanelMuros
              nodos={nodos}
              muros={muros}
              setMuros={setMuros}
              escala={escala}
              orientacionesNodos={orientacionesNodos}
              nivel={nivel}
              niveles={niveles}
              margen={margen}
              ancho={ancho}
              largo={largo}
              ejesV={ejesV}
              ejesH={ejesH}
              altura={altura}
            />
          </div>
        </section>

        {/* <section className={`${styles.card} ${styles.cardEmbed}`}>
          <div className={styles.cardHeader}>
            <h3>Cotizaciones rápidas</h3>
            <p className={styles.cardHint}>
              Envía los datos actuales a los módulos de muros, pisos y cielo raso para obtener valores estimados.
            </p>
          </div>
          <div className={styles.embedQuotes}>
            <CotizadorMuros muros={muros} altura={altura} nivel={nivel} />
            <CotizadorPiso largo={largo} ancho={ancho} />
            <CotizadorCieloRaso largo={largo} ancho={ancho} />
          </div>
        </section> */}

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Parámetros generales de cotización</h3>
            <p className={styles.cardHint}>
              Define el alcance de la obra y los materiales base que se incluirán en la cotización.
            </p>
          </div>
          <div className={styles.toggleGroup}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={Boolean(obraGris)}
                onChange={(event) => setObraGris(event.target.checked)}
              />
              Cotizar obra gris
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={Boolean(obraBlanca)}
                onChange={(event) => setObraBlanca(event.target.checked)}
              />
              Cotizar obra blanca
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={Boolean(listaMateriales)}
                onChange={(event) => setListaMateriales(event.target.checked)}
              />
              Incluir lista de materiales
            </label>
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="cotizacion-ladrillo">Tipo de ladrillo</label>
              <select
                id="cotizacion-ladrillo"
                value={idLadrillo}
                onChange={(event) => setIdLadrillo(event.target.value)}
              >
                <option value="1">Farol 10×20×30</option>
                <option value="4">Farol 12×20×30</option>
                <option value="6">Tolete 10×6×20</option>
              </select>
            </div>
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardTable}`}>
          <div className={styles.cardHeader}>
            <h3>Resistencia del terreno</h3>
            <p className={styles.cardHint}>
              Ingresa los resultados del estudio de suelos para definir la capacidad portante a diferentes profundidades.
            </p>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Profundidad (m)</th>
                <th>Resistencia (kPa)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resistencias.map((item, index) => (
                <tr key={`res-${index}`}>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={item.profundidad}
                      onChange={(event) =>
                        updateResistencia(index, "profundidad", event.target.value)
                      }
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={item.resistencia}
                      onChange={(event) =>
                        updateResistencia(index, "resistencia", event.target.value)
                      }
                      className={styles.tableInput}
                    />
                  </td>
                  <td className={styles.tableActions}>
                    <button
                      type="button"
                      className={styles.buttonSmall}
                      onClick={() => removeResistencia(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {resistencias.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.emptyRow}>
                    No se han registrado valores de resistencia. Añade al menos uno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={addResistencia}
            >
              Añadir punto
            </button>
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardTable}`}>
          <div className={styles.cardHeader}>
            <h3>Columnas estructurales</h3>
            <p className={styles.cardHint}>
              Define las columnas principales de la estructura y su relación con los muros que soportan.
            </p>
          </div>
          <div className={styles.inlineGrid}>
            <div className={styles.field}>
              <label htmlFor="columnas-especialidad">Especialidad</label>
              <input
                id="columnas-especialidad"
                type="number"
                min={0}
                value={columnasEspecialidad}
                onChange={(event) => setColumnasEspecialidad(event.target.value)}
              />
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Muros que amarra</th>
                <th>Alto (cm)</th>
                <th>Tipo de columna</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {columnasDatosLista.map((item, index) => (
                <tr key={`col-${index}`}>
                  <td>
                    <input
                      type="number"
                      value={item.muros}
                      onChange={(event) => updateColumnaDato(index, "muros", event.target.value)}
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.alto}
                      onChange={(event) => updateColumnaDato(index, "alto", event.target.value)}
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <select
                      value={item.tipo_columna}
                      onChange={(event) =>
                        updateColumnaDato(index, "tipo_columna", event.target.value)
                      }
                      className={styles.tableInput}
                    >
                      <option value="">Selecciona</option>
                      <option value="1">Esquina (1)</option>
                      <option value="2">Orilla (2)</option>
                      <option value="3">Central (3)</option>
                    </select>
                  </td>
                  <td className={styles.tableActions}>
                    <button
                      type="button"
                      className={styles.buttonSmall}
                      onClick={() => removeColumnaDato(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {columnasDatosLista.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    No se han definido columnas. Añade al menos una fila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={addColumnaDato}
            >
              Añadir columna
            </button>
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardTable}`}>
          <div className={styles.cardHeader}>
            <h3>Columnas de cubierta</h3>
            <p className={styles.cardHint}>
              Registra las columnas utilizadas para apoyar la estructura de la cubierta.
            </p>
          </div>
          <div className={styles.inlineGrid}>
            <div className={styles.field}>
              <label htmlFor="columnas-cubierta-especialidad">Especialidad</label>
              <input
                id="columnas-cubierta-especialidad"
                type="number"
                min={0}
                value={columnasCubiertaEspecialidad}
                onChange={(event) => setColumnasCubiertaEspecialidad(event.target.value)}
              />
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Muros que amarra</th>
                <th>Alto (cm)</th>
                <th>Tipo de columna</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {columnasCubiertaLista.map((item, index) => (
                <tr key={`col-cub-${index}`}>
                  <td>
                    <input
                      type="number"
                      value={item.muros}
                      onChange={(event) =>
                        updateColumnaCubiertaDato(index, "muros", event.target.value)
                      }
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.alto}
                      onChange={(event) =>
                        updateColumnaCubiertaDato(index, "alto", event.target.value)
                      }
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <select
                      value={item.tipo_columna}
                      onChange={(event) =>
                        updateColumnaCubiertaDato(index, "tipo_columna", event.target.value)
                      }
                      className={styles.tableInput}
                    >
                      <option value="">Selecciona</option>
                      <option value="1">Esquina (1)</option>
                      <option value="2">Orilla (2)</option>
                      <option value="3">Central (3)</option>
                    </select>
                  </td>
                  <td className={styles.tableActions}>
                    <button
                      type="button"
                      className={styles.buttonSmall}
                      onClick={() => removeColumnaCubiertaDato(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {columnasCubiertaLista.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    No se han definido columnas de cubierta. Añade al menos una fila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={addColumnaCubiertaDato}
            >
              Añadir columna de cubierta
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Configuración de cubierta</h3>
            <p className={styles.cardHint}>
              Completa la información estructural de la cubierta, sus canales y los tramos de techo.
            </p>
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="cubierta-cuchilla">Cuchilla</label>
              <input
                id="cubierta-cuchilla"
                type="number"
                value={cubiertaConfig?.cuchilla ?? ""}
                onChange={(event) => handleCubiertaConfigChange("cuchilla", event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cubierta-clase">Clase</label>
              <input
                id="cubierta-clase"
                type="number"
                value={cubiertaConfig?.clase ?? ""}
                onChange={(event) => handleCubiertaConfigChange("clase", event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cubierta-caballete">Caballete</label>
              <input
                id="cubierta-caballete"
                type="number"
                value={cubiertaConfig?.caballete ?? ""}
                onChange={(event) => handleCubiertaConfigChange("caballete", event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cubierta-flanche">Flanche</label>
              <input
                id="cubierta-flanche"
                type="number"
                value={cubiertaConfig?.flanche ?? ""}
                onChange={(event) => handleCubiertaConfigChange("flanche", event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cubierta-base">Base</label>
              <input
                id="cubierta-base"
                type="number"
                value={cubiertaConfig?.base ?? ""}
                onChange={(event) => handleCubiertaConfigChange("base", event.target.value)}
              />
            </div>
          </div>
          <div className={styles.inlineGrid}>
            {canalesValores.map((valor, index) => (
              <div key={`canal-${index}`} className={styles.field}>
                <label htmlFor={`cubierta-canal-${index}`}>Canal {index + 1}</label>
                <input
                  id={`cubierta-canal-${index}`}
                  type="number"
                  value={valor ?? ""}
                  onChange={(event) => handleCubiertaCanalChange(index, event.target.value)}
                />
              </div>
            ))}
          </div>
          <h4 className={styles.subheading}>Segmentos de techo</h4>
          <div className={styles.dynamicList}>
            {techosLista.map((techo, index) => (
              <div key={`techo-${index}`} className={styles.dynamicCard}>
                <div className={styles.dynamicGrid}>
                  <label className={styles.dynamicField}>
                    <span>Tipo</span>
                    <input
                      type="number"
                      value={techo.tipo}
                      onChange={(event) => updateCubiertaTecho(index, "tipo", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Alto (cm)</span>
                    <input
                      type="number"
                      value={techo.alto}
                      onChange={(event) => updateCubiertaTecho(index, "alto", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Largo (cm)</span>
                    <input
                      type="number"
                      value={techo.largo}
                      onChange={(event) => updateCubiertaTecho(index, "largo", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho (cm) por tramo</span>
                    <input
                      type="text"
                      value={techo.ancho}
                      onChange={(event) => updateCubiertaTecho(index, "ancho", event.target.value)}
                      placeholder="Ej: 344,356"
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Teja</span>
                    <input
                      type="number"
                      value={techo.teja}
                      onChange={(event) => updateCubiertaTecho(index, "teja", event.target.value)}
                    />
                  </label>
                </div>
                <div className={styles.listActions}>
                  <button
                    type="button"
                    className={styles.buttonSmall}
                    onClick={() => removeCubiertaTecho(index)}
                  >
                    Eliminar segmento
                  </button>
                </div>
              </div>
            ))}
            {techosLista.length === 0 && (
              <div className={styles.helper}>Añade uno o más tramos para describir la cubierta.</div>
            )}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={addCubiertaTecho}
            >
              Añadir segmento de techo
            </button>
          </div>

          <h4 className={styles.subheading}>Muros de cubierta</h4>
          <div className={styles.dynamicList}>
            {cubiertaEjesLista.map((item, index) => (
              <div key={`cubierta-muro-${index}`} className={styles.dynamicCard}>
                <div className={styles.dynamicGrid}>
                  <label className={styles.dynamicField}>
                    <span>Nombre</span>
                    <input
                      type="text"
                      value={item.nombre}
                      onChange={(event) => updateCubiertaMuro(index, "nombre", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Tipo</span>
                    <select
                      value={item.tipo}
                      onChange={(event) => updateCubiertaMuro(index, "tipo", event.target.value)}
                    >
                      <option value="cuchilla">Cuchilla</option>
                      <option value="muroEntero">Muro entero</option>
                      <option value="sinMuro">Sin muro</option>
                    </select>
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho estructura</span>
                    <input
                      type="number"
                      value={item.ancho_estructura}
                      onChange={(event) =>
                        updateCubiertaMuro(index, "ancho_estructura", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Piso</span>
                    <input
                      type="text"
                      value={item.piso}
                      onChange={(event) => updateCubiertaMuro(index, "piso", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho libre</span>
                    <input
                      type="number"
                      value={item.ancho}
                      onChange={(event) => updateCubiertaMuro(index, "ancho", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Clase</span>
                    <input
                      type="number"
                      value={item.clase}
                      onChange={(event) => updateCubiertaMuro(index, "clase", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Estructura</span>
                    <input
                      type="number"
                      value={item.estructura}
                      onChange={(event) =>
                        updateCubiertaMuro(index, "estructura", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Medida 1</span>
                    <input
                      type="number"
                      value={item.medida1}
                      onChange={(event) => updateCubiertaMuro(index, "medida1", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Medida 2</span>
                    <input
                      type="number"
                      value={item.medida2}
                      onChange={(event) => updateCubiertaMuro(index, "medida2", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Medida 3</span>
                    <input
                      type="number"
                      value={item.medida3}
                      onChange={(event) => updateCubiertaMuro(index, "medida3", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Alto</span>
                    <input
                      type="number"
                      value={item.alto}
                      onChange={(event) => updateCubiertaMuro(index, "alto", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Tipo de ventana</span>
                    <input
                      type="text"
                      value={item.ventanaTipo}
                      onChange={(event) =>
                        updateCubiertaMuro(index, "ventanaTipo", event.target.value)
                      }
                      placeholder="Ej: ventana, luceta..."
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ubicación de ventana</span>
                    <input
                      type="text"
                      value={item.ventanaUbicacion}
                      onChange={(event) =>
                        updateCubiertaMuro(index, "ventanaUbicacion", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho ventana</span>
                    <input
                      type="number"
                      value={item.ventanaAncho}
                      onChange={(event) =>
                        updateCubiertaMuro(index, "ventanaAncho", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Alto ventana</span>
                    <input
                      type="number"
                      value={item.ventanaAlto}
                      onChange={(event) =>
                        updateCubiertaMuro(index, "ventanaAlto", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho 2 ventana</span>
                    <input
                      type="number"
                      value={item.ventanaAncho2}
                      onChange={(event) =>
                        updateCubiertaMuro(index, "ventanaAncho2", event.target.value)
                      }
                    />
                  </label>
                </div>
                <div className={styles.listActions}>
                  <button
                    type="button"
                    className={styles.buttonSmall}
                    onClick={() => removeCubiertaMuro(index)}
                  >
                    Eliminar muro
                  </button>
                </div>
              </div>
            ))}
            {cubiertaEjesLista.length === 0 && (
              <div className={styles.helper}>
                Añade los muros de cubierta que requieran cálculo de alturas y pendientes.
              </div>
            )}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={addCubiertaMuro}
            >
              Añadir muro de cubierta
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Muros para la cotización total</h3>
            <p className={styles.cardHint}>
              Complementa la información de los muros que se enviarán a la API general. Puedes importar los muros
              creados en el panel y enriquecerlos con los datos necesarios.
            </p>
          </div>
          <div className={styles.dynamicList}>
            {murosCotizacionLista.map((item, index) => (
              <div key={`muro-cot-${index}`} className={styles.dynamicCard}>
                <div className={styles.dynamicGrid}>
                  <label className={styles.dynamicField}>
                    <span>Nombre</span>
                    <input
                      type="text"
                      value={item.nombre}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "nombre", event.target.value)
                      }
                      placeholder="Ej: muro eje 1 número 1"
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Tipo</span>
                    <select
                      value={item.tipo}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "tipo", event.target.value)
                      }
                    >
                      <option value="muroEntero">Muro entero</option>
                      <option value="muroPuerta">Muro puerta</option>
                      <option value="muroVentana">Muro ventana</option>
                      <option value="muroPuertaVentana">Muro puerta ventana</option>
                      <option value="sinMuro">Sin muro</option>
                    </select>
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho estructura</span>
                    <input
                      type="number"
                      value={item.ancho_estructura}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "ancho_estructura", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho libre</span>
                    <input
                      type="number"
                      value={item.ancho}
                      onChange={(event) => updateMuroCotizacion(index, "ancho", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Piso</span>
                    <input
                      type="text"
                      value={item.piso}
                      onChange={(event) => updateMuroCotizacion(index, "piso", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Clase</span>
                    <input
                      type="number"
                      value={item.clase}
                      onChange={(event) => updateMuroCotizacion(index, "clase", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Estructura</span>
                    <input
                      type="number"
                      value={item.estructura}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "estructura", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Medida 1</span>
                    <input
                      type="number"
                      value={item.medida1}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "medida1", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Medida 2</span>
                    <input
                      type="number"
                      value={item.medida2}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "medida2", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Medida 3</span>
                    <input
                      type="number"
                      value={item.medida3}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "medida3", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Alto</span>
                    <input
                      type="number"
                      value={item.alto}
                      onChange={(event) => updateMuroCotizacion(index, "alto", event.target.value)}
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Tipo de ventana</span>
                    <input
                      type="text"
                      value={item.ventanaTipo}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "ventanaTipo", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ubicación ventana</span>
                    <input
                      type="text"
                      value={item.ventanaUbicacion}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "ventanaUbicacion", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho ventana</span>
                    <input
                      type="number"
                      value={item.ventanaAncho}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "ventanaAncho", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Alto ventana</span>
                    <input
                      type="number"
                      value={item.ventanaAlto}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "ventanaAlto", event.target.value)
                      }
                    />
                  </label>
                  <label className={styles.dynamicField}>
                    <span>Ancho 2 ventana</span>
                    <input
                      type="number"
                      value={item.ventanaAncho2}
                      onChange={(event) =>
                        updateMuroCotizacion(index, "ventanaAncho2", event.target.value)
                      }
                    />
                  </label>
                </div>
                <div className={styles.listActions}>
                  <button
                    type="button"
                    className={styles.buttonSmall}
                    onClick={() => removeMuroCotizacion(index)}
                  >
                    Eliminar muro
                  </button>
                </div>
              </div>
            ))}
            {murosCotizacionLista.length === 0 && (
              <div className={styles.helper}>
                Aún no has agregado muros a la cotización total. Puedes crearlos manualmente o importar los
                definidos en el panel.
              </div>
            )}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={addMuroCotizacion}
            >
              Añadir muro manualmente
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonGhost}`}
              onClick={importarMurosDesdePanel}
              disabled={!muros || muros.length === 0}
            >
              Importar muros del panel
            </button>
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardSummary}`}>
          <div className={styles.cardHeader}>
            <h3>Resumen de la cotización total</h3>
            <p className={styles.cardHint}>
              El siguiente JSON es el cuerpo que se enviará al endpoint general de cotización. Puedes guardarlo en
              localStorage o copiarlo para usarlo en otra herramienta.
            </p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={handleGuardarCotizacion}>
              Guardar en localStorage
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonGhost}`}
              onClick={handleCopiarPayload}
            >
              Copiar JSON
            </button>
          </div>
          {mensajeSistema && <p className={styles.helper}>{mensajeSistema}</p>}
          {payloadGuardado?.timestamp && (
            <p className={styles.helper}>
              Último guardado: {new Date(payloadGuardado.timestamp).toLocaleTimeString()}
            </p>
          )}
          <pre className={styles.payloadPreview}>{payloadString}</pre>
        </section>

        {nivel === "1 de 1" && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Orientación de nodos</h3>
              <p className={styles.cardHint}>
                Ajusta la orientación de cada nodo para controlar el ancho disponible en muros y cotas.
              </p>
            </div>
            <ul className={styles.orientationList}>
              {nodos.map((_, idx) => (
                <li key={`orient-${idx}`}>
                  <span>Nodo {idx + 1}</span>
                  <select
                    value={orientacionesNodos[idx] || "horizontal"}
                    onChange={(event) => handleOrientacionNodo(idx, event.target.value)}
                  >
                    <option value="horizontal">Horizontal (20×12)</option>
                    <option value="vertical">Vertical (12×20)</option>
                  </select>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}