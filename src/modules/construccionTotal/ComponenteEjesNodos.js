/* @jsxRuntime classic */
/* @jsx React.createElement */
// ComponenteEjesNodos.js
import React, { useRef, useEffect, useState, useMemo } from "react";
import LienzoEjesNodos from "./LienzoEjesNodos";
import PanelCotas from "../../components/PanelCotas";
import PanelMuros from "../../components/PanelMuros";
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
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Error guardando la clave "${key}" en localStorage:`, error);
    }
  };

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setStoredValue];
}

// Constantes y valores por defecto
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

export default function ComponenteEjesNodos() {
  // Estados principales
  const [altura, setAltura] = useLocalStorage("altura", 220);
  const [ancho, setAncho] = useLocalStorage("ancho", 200);
  const [largo, setLargo] = useLocalStorage("largo", 150);
  const [nivel, setNivel] = useLocalStorage("nivel", niveles[0].value);
  const [ejesSecundarios, setEjesSecundarios] = useLocalStorage("ejesSecundarios", []);
  const [orientacionesNodos, setOrientacionesNodos] = useLocalStorage("orientacionesNodos", {});
  const [cotas, setCotas] = useLocalStorage("cotas", []);
  const [muros, setMuros] = useLocalStorage("muros", []);
  const [obraNegra, setObraNegra] = useState(true);
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

  // NUEVO: Estado para inclinación cubierta
  const [inclinacionCubierta, setInclinacionCubierta] = useState(60);

  // Utilidades
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

  // Helpers para resistencias y columnas/muros (reutilizo nombres del original)
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
        tipo: "muroEntero",
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

  // ----------------------
  // CÁLCULOS GEOMÉTRICOS
  // ----------------------

  // escala, margen y dimensiones de canvas (UNA sola vez, no duplicadas)
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

  // Ejes principales en pixeles para canvas
  const eje0 = { x1: margen, y1: margen, x2: margen + ancho * escala, y2: margen };
  const eje1 = {
    x1: margen + ancho * escala,
    y1: margen,
    x2: margen + ancho * escala,
    y2: margen + largo * escala,
  };
  const eje2 = {
    x1: margen + ancho * escala,
    y1: margen + largo * escala,
    x2: margen,
    y2: margen + largo * escala,
  };
  const eje3 = { x1: margen, y1: margen + largo * escala, x2: margen, y2: margen };

  // Filtrar ejes secundarios por orientación (datos en cm)
  const ejesV = ejesSecundarios.filter((e) => e.orientacion === "V");
  const ejesH = ejesSecundarios.filter((e) => e.orientacion === "H");

  // Nodos lógicos en centímetros (para cálculos y payload)
  let nodosCm = [
    { x: 0, y: 0 },
    { x: ancho, y: 0 },
    { x: ancho, y: largo },
    { x: 0, y: largo },
  ];

  ejesV.forEach((ev) => {
    const x = ev.distancia;
    nodosCm.push({ x, y: 0 });
    nodosCm.push({ x, y: largo });
    ejesH.forEach((eh) => {
      const y = eh.distancia;
      nodosCm.push({ x, y });
    });
  });

  ejesH.forEach((eh) => {
    const y = eh.distancia;
    nodosCm.push({ x: 0, y });
    nodosCm.push({ x: ancho, y });
  });

  // Deduplicate nodosCm (tolerancia pequeña)
  nodosCm = nodosCm.filter(
    (n, idx, arr) =>
      n &&
      typeof n.x === "number" &&
      typeof n.y === "number" &&
      arr.findIndex(
        (m) =>
          m &&
          typeof m.x === "number" &&
          typeof m.y === "number" &&
          Math.abs(m.x - n.x) < 0.01 &&
          Math.abs(m.y - n.y) < 0.01
      ) === idx
  );

  // Nodos para canvas (pixeles) mapeando nodosCm
  const nodosCanvas = nodosCm.map((n) => ({
    x: margen + n.x * escala,
    y: margen + n.y * escala,
  }));

  // Función para calcular áreas resultantes por intersección de ejes
  function calcularAreas(anchoTotal, largoTotal, ejesSec) {
    const ejesVX = [0, ...ejesSec.filter((e) => e.orientacion === "V").map((e) => e.distancia), anchoTotal].sort(
      (a, b) => a - b
    );
    const ejesHY = [0, ...ejesSec.filter((e) => e.orientacion === "H").map((e) => e.distancia), largoTotal].sort(
      (a, b) => a - b
    );
    const areas = [];
    for (let i = 0; i < ejesVX.length - 1; i++) {
      for (let j = 0; j < ejesHY.length - 1; j++) {
        const anchoArea = ejesVX[i + 1] - ejesVX[i];
        const largoArea = ejesHY[j + 1] - ejesHY[j];
        areas.push({ ancho: Number(anchoArea.toFixed(2)), largo: Number(largoArea.toFixed(2)) });
      }
    }
    return areas;
  }

  const areasCalculadas = useMemo(() => calcularAreas(ancho, largo, ejesSecundarios), [ancho, largo, ejesSecundarios]);

  // Determinar tipo columna según posición (cm)
  function tipoColumnaParaNodo(nodo, anchoTotal, largoTotal) {
    const esEsquina = (Math.abs(nodo.x - 0) < 0.01 || Math.abs(nodo.x - anchoTotal) < 0.01) &&
                      (Math.abs(nodo.y - 0) < 0.01 || Math.abs(nodo.y - largoTotal) < 0.01);
    if (esEsquina) return 1;
    const esLado =
      Math.abs(nodo.x - 0) < 0.01 ||
      Math.abs(nodo.x - anchoTotal) < 0.01 ||
      Math.abs(nodo.y - 0) < 0.01 ||
      Math.abs(nodo.y - largoTotal) < 0.01;
    if (esLado) return 2;
    return 3;
  }

  // Generar columnas (payload) a partir de nodosCm
  const columnasGeneradas = nodosCm.map((nodo) => ({
    muros: 2,
    alto: altura,
    tipo_columna: tipoColumnaParaNodo(nodo, ancho, largo),
  }));

  // Muros de cubierta: generamos tramos entre nodos consecutivos por misma Y (horizontales)
  function generarMurosHorizontalesDesdeNodos(nodosList, nivelPiso, alturaMuro) {
    const murosResult = [];
    // Agrupar por Y en nodosList (en cm)
    const grupos = {};
    nodosList.forEach((n) => {
      const key = n.y.toFixed(2);
      grupos[key] = grupos[key] || [];
      grupos[key].push(n);
    });
    Object.entries(grupos).forEach(([yStr, arrN]) => {
      const arrSorted = arrN.slice().sort((a, b) => a.x - b.x);
      for (let i = 0; i < arrSorted.length - 1; i++) {
        const n1 = arrSorted[i];
        const n2 = arrSorted[i + 1];
        const anchoEstructura = Number((n2.x - n1.x).toFixed(2));
        if (anchoEstructura <= 0) continue;
        murosResult.push({
          nombre: `muro_cub_h_y${yStr}_t${i + 1}`,
          tipo: "cuchilla",
          ancho_estructura: anchoEstructura,
          piso: nivelPiso,
          ancho: anchoEstructura,
          clase: 0,
          estructura: 1,
          medida1: Number((alturaMuro / 2).toFixed(2)),
          medida2: Number((alturaMuro / 2).toFixed(2)),
          medida3: 0,
          alto: 0,
          ventana: null,
          vigaCorona: [],
          viga: [],
          enlace: [],
          cinta: [],
          columneta: [],
          riostra: [],
        });
      }
    });
    return murosResult;
  }

  // Muros verticales (entre nodos con misma X)
  function generarMurosVerticalesDesdeNodos(nodosList, nivelPiso, alturaMuro) {
    const murosResult = [];
    const grupos = {};
    nodosList.forEach((n) => {
      const key = n.x.toFixed(2);
      grupos[key] = grupos[key] || [];
      grupos[key].push(n);
    });
    Object.entries(grupos).forEach(([xStr, arrN]) => {
      const arrSorted = arrN.slice().sort((a, b) => a.y - b.y);
      for (let i = 0; i < arrSorted.length - 1; i++) {
        const n1 = arrSorted[i];
        const n2 = arrSorted[i + 1];
        const anchoEstructura = Number((n2.y - n1.y).toFixed(2));
        if (anchoEstructura <= 0) continue;
        murosResult.push({
          nombre: `muro_cub_v_x${xStr}_t${i + 1}`,
          tipo: "cuchilla",
          ancho_estructura: anchoEstructura,
          piso: nivelPiso,
          ancho: anchoEstructura,
          clase: 0,
          estructura: 1,
          medida1: Number((alturaMuro / 2).toFixed(2)),
          medida2: Number((alturaMuro / 2).toFixed(2)),
          medida3: 0,
          alto: 0,
          ventana: null,
          vigaCorona: [],
          viga: [],
          enlace: [],
          cinta: [],
          columneta: [],
          riostra: [],
        });
      }
    });
    return murosResult;
  }

  const murosCubierta = useMemo(() => {
    const nivelPiso = "4 de 4";
    const alturaMuro = inclinacionCubierta;
    const murosH = generarMurosHorizontalesDesdeNodos(nodosCm, nivelPiso, alturaMuro);
    const murosV = generarMurosVerticalesDesdeNodos(nodosCm, nivelPiso, alturaMuro);
    return [...murosH, ...murosV];
  }, [nodosCm, inclinacionCubierta]);

  // Columnas de cubierta: mismas columnas pero alto = mitad inclinación
  const columnasCubiertaGeneradas = columnasGeneradas.map((c) => ({
    ...c,
    alto: Number((inclinacionCubierta / 2).toFixed(2)),
  }));

  // Payloads auxiliares similares al original
  const columnasPayload = columnasDatosLista
    .filter((item) => item.muros !== "" || item.alto !== "" || item.tipo_columna !== "")
    .map((item) => ({
      muros: ensureNumber(item.muros),
      alto: ensureNumber(item.alto),
      tipo_columna: ensureNumber(item.tipo_columna),
    }));

  const columnasCubiertaPayload = columnasCubiertaGeneradas.map((col) => ({
    muros: col.muros,
    alto: col.alto,
    tipo_columna: col.tipo_columna,
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

  // cubTechosPayload (transformar techosLista) y cubEjesPayload (transformar cubiertaEjesLista)
  const cubTechosPayload = techosLista
    .filter((item) => item.alto !== "" || item.largo !== "" || item.ancho !== "")
    .map((item) => {
      const anchoValores =
        item.ancho && item.ancho.trim().length > 0
          ? item.ancho
              .split(",")
              .map((parte) => ensureNumber(parte.trim(), 0))
              .filter((v) => Number.isFinite(v))
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
              ...(item.ventanaAncho2 !== "" ? { ancho2: ensureNumber(item.ventanaAncho2) } : {}),
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

  // Construcción del payload final (simplificado y consistente)
  const payload = useMemo(
    () => ({
      obra_negra: {
        resistencia_terreno: resistenciaPayload,
        mamposteria: obraNegra,
        columnas: true,
        vigas: true,
        placa: true,
        cubierta: {
          cuchilla: ensureNumber(cubiertaConfig?.cuchilla, 0),
          clase: ensureNumber(cubiertaConfig?.clase, 0),
          caballete: ensureNumber(cubiertaConfig?.caballete, 0),
          flanche: ensureNumber(cubiertaConfig?.flanche, 0),
          canales: canalesValores.map((v) => ensureNumber(v, 0)),
          base: ensureNumber(cubiertaConfig?.base, 0),
          teja: 3,
          techos: cubTechosPayload,
          ejes_muros: cubEjesPayload,
          muros: murosCubierta,
          columnas: columnasCubiertaPayload,
        },
      },
      obra_gris: Boolean(obraGris),
      obra_blanca: Boolean(obraBlanca),
      lista_materiales: Boolean(listaMateriales),
      id_ladrillo: ensureNumber(idLadrillo, 1),
      ancho: ensureNumber(ancho, 0),
      largo: ensureNumber(largo, 0),
      altura: ensureNumber(altura, 0),
      columnas: {
        especialidad: ensureNumber(columnasEspecialidad, 1),
        datos: columnasPayload,
      },
      ejes_muros: [...murosPayload], // muros definidos por usuario
      niveles: [
        {
          nivel,
          dimensiones: {
            ancho: ancho,
            largo: largo,
            altura_muros: altura,
          },
          columnas: {
            especialidad: ensureNumber(columnasEspecialidad, 1),
            datos: columnasPayload,
          },
          ejes_muros: [...murosPayload, ...murosCubierta], // mezcla de muros user + muros cubierta generados
          areas_ejes: areasCalculadas,
        },
      ],
    }),
    [
      obraNegra,
      obraGris,
      obraBlanca,
      listaMateriales,
      idLadrillo,
      ancho,
      largo,
      altura,
      columnasEspecialidad,
      columnasPayload,
      murosPayload,
      nivel,
      areasCalculadas,
      resistenciaPayload,
      cubiertaConfig,
      canalesValores,
      cubTechosPayload,
      cubEjesPayload,
      murosCubierta,
      columnasCubiertaPayload,
    ]
  );

  const payloadString = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  const handleGuardarCotizacion = () => {
    try {
      window.localStorage.setItem("construccionTotal_cotizacionPayload", JSON.stringify(payload));
      setPayloadGuardado({ timestamp: Date.now() });
      setMensajeSistema("Datos de cotización guardados en localStorage.");
    } catch (error) {
      console.error("Error guardando la cotización total:", error);
      setMensajeSistema("No se pudo guardar la cotización en localStorage.");
    }
    console.log("Payload cotización total:", payload);
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
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);

  // Pan con mouse y barra espaciadora
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const stageStart = useRef({ x: 0, y: 0 });

  // Handlers de zoom/pan
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = stageScale;
    const pointer = e.target.getStage().getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
    };
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(0.05, Math.min(10, newScale));
    setStageScale(newScale);
    setStageX(pointer.x - mousePointTo.x * newScale);
    setStageY(pointer.y - mousePointTo.y * newScale);
  };

  const zoomIn = () => {
    const scaleBy = 1.1;
    let newScale = Math.min(stageScale * scaleBy, 10);
    setStageScale(newScale);
    setStageX((viewportWidth - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((viewportHeight - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const zoomOut = () => {
    const scaleBy = 1.1;
    let newScale = Math.max(stageScale / scaleBy, 0.05);
    setStageScale(newScale);
    setStageX((viewportWidth - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((viewportHeight - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const centrarVista = () => {
    setStageX((viewportWidth - stageWidth * stageScale) / 2 + offsetX * stageScale);
    setStageY((viewportHeight - stageHeight * stageScale) / 2 + offsetY * stageScale);
  };

  const handleMouseDown = (event) => {
    const evt = event?.evt || event;
    if (!spacePressed) return;
    setIsPanning(true);
    panStart.current = { x: evt.clientX, y: evt.clientY };
    stageStart.current = { x: stageX, y: stageY };
  };

  const handleMouseMove = (event) => {
    if (!isPanning) return;
    const dx = event.clientX - panStart.current.x;
    const dy = event.clientY - panStart.current.y;
    setStageX(stageStart.current.x + dx);
    setStageY(stageStart.current.y + dy);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const limpiarDatos = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar todos los datos?")) {
      localStorage.removeItem("muros");
      localStorage.removeItem("ejesSecundarios");
      setMuros([]);
      setEjesSecundarios([]);
    }
  };

  useEffect(() => {
    console.log("Muros recuperados:", muros);
    console.log("Ejes secundarios recuperados:", ejesSecundarios);
  }, []); // eslint-disable-line

  // Detectar barra espaciadora
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") setSpacePressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") setSpacePressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning]); // eslint-disable-line

  useEffect(() => {
    centrarVista();
  }, [canvasWidth, canvasHeight, stageScale, viewportWidth, viewportHeight]); // eslint-disable-line

  // Estados e inputs para agregar ejes secundarios
  const [orientacion, setOrientacion] = useState("V");
  const [distancia, setDistancia] = useState(0);

  const agregarEje = () => {
    if (
      (orientacion === "V" && distancia > 0 && distancia < ancho) ||
      (orientacion === "H" && distancia > 0 && distancia < largo)
    ) {
      setEjesSecundarios([...ejesSecundarios, { orientacion, distancia }]);
      setDistancia(0);
    }
  };

  const deshacerEje = () => {
    setEjesSecundarios(ejesSecundarios.slice(0, -1));
  };

  const handleOrientacionNodo = (idx, value) => {
    setOrientacionesNodos({ ...orientacionesNodos, [idx]: value });
  };

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
              <label htmlFor="inclinacion-cubierta">Inclinación cubierta (cm)</label>
              <input
                id="inclinacion-cubierta"
                type="number"
                min={60}
                max={170}
                value={inclinacionCubierta}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 60) val = 60;
                  else if (val > 170) val = 170;
                  setInclinacionCubierta(val);
                }}
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
                nodos={nodosCanvas.filter((n) => n && typeof n.x === "number" && typeof n.y === "number")}
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
              nodos={nodosCanvas}
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
              nodos={nodosCanvas}
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
                checked={obraNegra}
                onChange={(event) => setObraNegra(event.target.checked)}
              />
              Cotizar obra negra
            </label>
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
              {nodosCanvas.map((_, idx) => (
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