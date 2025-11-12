import React, { useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Text } from "react-konva";
import "./TechosModal.css";

// Hook para localStorage
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item && item !== "undefined" ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error leyendo "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Error guardando "${key}":`, error);
    }
  };

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setStoredValue];
}

export default function TechosModal({ onClose, onVolver }) {
  // Estados principales
  const [ancho, setAncho] = useLocalStorage("techo_ancho", 250);
  const [largo, setLargo] = useLocalStorage("techo_largo", 300);
  const [altoInclinacion, setAltoInclinacion] = useLocalStorage("techo_alto", 100);
  const [tipoTeja, setTipoTeja] = useLocalStorage("techo_teja", 2);
  const [tipoLadrillo, setTipoLadrillo] = useLocalStorage("techo_ladrillo", 1);
  const [flanche, setFlanche] = useLocalStorage("techo_flanche", 1);
  const [ejesSecundarios, setEjesSecundarios] = useLocalStorage("techo_ejes", []);
  const [cotizacion, setCotizacion] = useState(null);

  // Nuevos estados para habilitar/deshabilitar techo y muros
  const [cotizarTecho, setCotizarTecho] = useLocalStorage("techo_cotizar_techo", true);
  const [cotizarMuros, setCotizarMuros] = useLocalStorage("techo_cotizar_muros", false);

  // Estados para agregar ejes
  const [orientacion, setOrientacion] = useState("V");
  const [distancia, setDistancia] = useState(0);

  // Zoom y pan
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);

  // Variables de dibujo
  const escala = 2;
  const margen = 50;
  const canvasWidth = margen + ancho * escala + margen;
  const canvasHeight = margen + largo * escala + margen;
  const extraMargin = Math.max(500, Math.max(canvasWidth, canvasHeight) * 0.5);
  const stageWidth = canvasWidth + extraMargin * 2;
  const stageHeight = canvasHeight + extraMargin * 2;
  const offsetX = extraMargin;
  const offsetY = extraMargin;

  // Ejes principales
  const eje0 = { x1: margen, y1: margen, x2: margen + ancho * escala, y2: margen };
  const eje1 = { x1: margen + ancho * escala, y1: margen, x2: margen + ancho * escala, y2: margen + largo * escala };
  const eje2 = { x1: margen + ancho * escala, y1: margen + largo * escala, x2: margen, y2: margen + largo * escala };
  const eje3 = { x1: margen, y1: margen + largo * escala, x2: margen, y2: margen };

  // Filtrar ejes secundarios
  const ejesV = ejesSecundarios.filter(e => e.orientacion === "V");
  const ejesH = ejesSecundarios.filter(e => e.orientacion === "H");

  // Calcular nodos (siempre verticales 12x20)
  let nodos = [
    { x: eje0.x1, y: eje0.y1 }, // Esquina superior izquierda
    { x: eje1.x1, y: eje1.y1 }, // Esquina superior derecha
    { x: eje2.x1, y: eje2.y1 }, // Esquina inferior derecha
    { x: eje3.x1, y: eje3.y1 }, // Esquina inferior izquierda
  ];
  
  ejesV.forEach((ev) => {
    const x = eje0.x1 + ev.distancia * escala;
    nodos.push({ x, y: eje0.y1 }); // Nodo superior
    nodos.push({ x, y: eje2.y1 }); // Nodo inferior
    ejesH.forEach((eh) => {
      const y = eje0.y1 + eh.distancia * escala;
      nodos.push({ x, y });
    });
  });
  
  ejesH.forEach((eh) => {
    const y = eje0.y1 + eh.distancia * escala;
    nodos.push({ x: eje0.x1, y }); // Nodo izquierdo
    nodos.push({ x: eje1.x1, y }); // Nodo derecho
  });
  
  // Eliminar duplicados
  nodos = nodos.filter(
    (n, idx, arr) =>
      arr.findIndex(m => Math.abs(m.x - n.x) < 1 && Math.abs(m.y - n.y) < 1) === idx
  );
  
  // Identificar tipo de columna (esquina o no)
  const identificarTipoColumna = (nodo) => {
    const esEsquina =
      (Math.abs(nodo.x - eje0.x1) < 1 || Math.abs(nodo.x - eje1.x1) < 1) &&
      (Math.abs(nodo.y - eje0.y1) < 1 || Math.abs(nodo.y - eje2.y1) < 1);
    return esEsquina ? 2 : 3;
  };

  // Calcular secciones de ancho para el techo basado en ejes verticales
  const calcularAnchosTecho = () => {
    if (ejesV.length === 0) {
      return [Number(ancho)];
    }

    // Ordenar ejes verticales por distancia
    const ejesOrdenados = [...ejesV].sort((a, b) => a.distancia - b.distancia);
    const anchos = [];

    // Primera sección: desde 0 hasta el primer eje
    anchos.push(ejesOrdenados[0].distancia);

    // Secciones intermedias: entre ejes consecutivos
    for (let i = 0; i < ejesOrdenados.length - 1; i++) {
      anchos.push(ejesOrdenados[i + 1].distancia - ejesOrdenados[i].distancia);
    }

    // Última sección: desde el último eje hasta el final
    anchos.push(ancho - ejesOrdenados[ejesOrdenados.length - 1].distancia);

    return anchos;
  };

  // Calcular distancias entre nodos para ejes_muros
  const calcularEjesMuros = () => {
    const ejesMuros = [];
    
    // Alto de muros es la mitad de la altura de inclinación
    const altoMuros = Math.round(altoInclinacion / 2);
    
    // Dimensiones de los nodos
    const anchoNodo = 12;
    const largoNodo = 20;
    
    // Ordenar ejes secundarios
    const ejesVOrdenados = [...ejesV].sort((a, b) => a.distancia - b.distancia);
    const ejesHOrdenados = [...ejesH].sort((a, b) => a.distancia - b.distancia);
    
    // Calcular secciones horizontales (basadas en ejes verticales)
    const seccionesHorizontales = [];
    if (ejesVOrdenados.length === 0) {
      seccionesHorizontales.push({ inicio: 0, fin: ancho, distancia: ancho });
    } else {
      // Primera sección
      seccionesHorizontales.push({ 
        inicio: 0, 
        fin: ejesVOrdenados[0].distancia, 
        distancia: ejesVOrdenados[0].distancia 
      });
      
      // Secciones intermedias
      for (let i = 0; i < ejesVOrdenados.length - 1; i++) {
        seccionesHorizontales.push({
          inicio: ejesVOrdenados[i].distancia,
          fin: ejesVOrdenados[i + 1].distancia,
          distancia: ejesVOrdenados[i + 1].distancia - ejesVOrdenados[i].distancia
        });
      }
      
      // Última sección
      seccionesHorizontales.push({
        inicio: ejesVOrdenados[ejesVOrdenados.length - 1].distancia,
        fin: ancho,
        distancia: ancho - ejesVOrdenados[ejesVOrdenados.length - 1].distancia
      });
    }
    
    // Calcular secciones verticales (basadas en ejes horizontales)
    const seccionesVerticales = [];
    if (ejesHOrdenados.length === 0) {
      seccionesVerticales.push({ inicio: 0, fin: largo, distancia: largo });
    } else {
      // Primera sección
      seccionesVerticales.push({ 
        inicio: 0, 
        fin: ejesHOrdenados[0].distancia, 
        distancia: ejesHOrdenados[0].distancia 
      });
      
      // Secciones intermedias
      for (let i = 0; i < ejesHOrdenados.length - 1; i++) {
        seccionesVerticales.push({
          inicio: ejesHOrdenados[i].distancia,
          fin: ejesHOrdenados[i + 1].distancia,
          distancia: ejesHOrdenados[i + 1].distancia - ejesHOrdenados[i].distancia
        });
      }
      
      // Última sección
      seccionesVerticales.push({
        inicio: ejesHOrdenados[ejesHOrdenados.length - 1].distancia,
        fin: largo,
        distancia: largo - ejesHOrdenados[ejesHOrdenados.length - 1].distancia
      });
    }
    
    // Generar muros horizontales (paralelos al ancho)
    seccionesHorizontales.forEach((seccion, idx) => {
      const anchoEstructura = seccion.distancia;
      let anchoLibre;
      
      if (ejesVOrdenados.length === 0) {
        // Sin ejes secundarios verticales: restar nodos completos en ambos extremos
        anchoLibre = anchoEstructura - anchoNodo - anchoNodo;
      } else {
        // Con ejes secundarios: restar nodo completo + medio nodo
        anchoLibre = anchoEstructura - anchoNodo - (anchoNodo / 2);
      }
      
      if (anchoLibre > 0) {
        // Cantidad de muros = cantidad de secciones verticales + 1
        const cantidadMuros = seccionesVerticales.length + 1;
        
        for (let i = 0; i < cantidadMuros; i++) {
          ejesMuros.push({
            nombre: `muro horizontal sección ${idx + 1} - ${i + 1}`,
            tipo: "cuchilla",
            ancho_estructura: anchoEstructura,
            piso: "4 de 4",
            ancho: anchoLibre,
            clase: 0,
            estructura: 1,
            medida1: 50,
            medida2: 50,
            medida3: 0,
            alto: altoMuros,
            ventana: null,
            vigaCorona: [],
            viga: [],
            enlace: [],
            cinta: [],
            columneta: [],
            riostra: []
          });
        }
      }
    });
    
    // Generar muros verticales (paralelos al largo)
    seccionesVerticales.forEach((seccion, idx) => {
      const anchoEstructura = seccion.distancia;
      let anchoLibre;
      
      if (ejesHOrdenados.length === 0) {
        // Sin ejes secundarios horizontales: restar nodos completos en ambos extremos
        anchoLibre = anchoEstructura - largoNodo - largoNodo;
      } else {
        // Con ejes secundarios: restar nodo completo + medio nodo
        anchoLibre = anchoEstructura - largoNodo - (largoNodo / 2);
      }
      
      if (anchoLibre > 0) {
        // Cantidad de muros = cantidad de secciones horizontales + 1
        const cantidadMuros = seccionesHorizontales.length + 1;
        
        for (let i = 0; i < cantidadMuros; i++) {
          ejesMuros.push({
            nombre: `muro vertical sección ${idx + 1} - ${i + 1}`,
            tipo: "cuchilla",
            ancho_estructura: anchoEstructura,
            piso: "4 de 4",
            ancho: anchoLibre,
            clase: 0,
            estructura: 1,
            medida1: 50,
            medida2: 50,
            medida3: 0,
            alto: altoMuros,
            ventana: null,
            vigaCorona: [],
            viga: [],
            enlace: [],
            cinta: [],
            columneta: [],
            riostra: []
          });
        }
      }
    });
    
    return ejesMuros;
  };

  // Calcular columnas_cubierta
  const calcularColumnasCubierta = () => {
    // Alto de columnas es la mitad de la altura de inclinación
    const altoColumnas = Math.round(altoInclinacion / 2);
    
    return {
      especialidad: 1,
      datos: nodos.map(nodo => ({
        muros: identificarTipoColumna(nodo),
        alto: altoColumnas,
        tipo_columna: 1
      }))
    };
  };

  // Agregar eje secundario
  const agregarEje = () => {
    if (
      (orientacion === "V" && distancia > 0 && distancia < ancho) ||
      (orientacion === "H" && distancia > 0 && distancia < largo)
    ) {
      setEjesSecundarios([...ejesSecundarios, { orientacion, distancia }]);
      setDistancia(0);
    }
  };

  // Deshacer eje
  const deshacerEje = () => {
    setEjesSecundarios(ejesSecundarios.slice(0, -1));
  };

  // Limpiar datos
  const limpiarDatos = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar todos los datos?")) {
      localStorage.removeItem("techo_ejes");
      setEjesSecundarios([]);
    }
  };

  // Enviar cotización
  const enviarCotizacion = async () => {
    // Validar que al menos una opción esté seleccionada
    if (!cotizarTecho && !cotizarMuros) {
      alert("⚠️ Debes seleccionar al menos una opción: Cotizar Techo o Cotizar Muros/Columnas");
      return;
    }

    const anchosTecho = calcularAnchosTecho();
    const ejesMuros = calcularEjesMuros();
    const columnasCubierta = calcularColumnasCubierta();

    const payload = {
      cuchilla: 1,
      clase: 1,
      caballete: 0,
      flanche: Number(flanche),
      base: 0,
      ladrillo: Number(tipoLadrillo),
      techos: cotizarTecho ? [
        {
          tipo: 0,
          alto: Number(altoInclinacion),
          largo: Number(largo),
          ancho: anchosTecho,
          teja: Number(tipoTeja)
        }
      ] : null,
      ejes_muros: cotizarMuros ? ejesMuros : null,
      columnas_cubierta: cotizarMuros ? columnasCubierta : null
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://174.129.83.62/api/cotizacion-techo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Status de respuesta:", res.status);

      if (!res.ok) {
        let errorMsg = `Error ${res.status}`;
        try {
          let errorText = await res.text();
          if (errorText.startsWith("a{")) {
            errorText = errorText.substring(1);
          }
          const errorData = JSON.parse(errorText);
          console.error("❌ Error de la API:", errorData);

          if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          } else if (errorData.errors) {
            errorMsg = Object.values(errorData.errors).flat().join("\n");
          } else {
            errorMsg = JSON.stringify(errorData, null, 2);
          }
        } catch (e) {
          console.error("Error al parsear respuesta:", e);
          errorMsg = await res.text();
        }

        alert(`❌ Error al enviar la cotización:\n\n${errorMsg}`);
        return;
      }

      let responseText = await res.text();
      console.log("📥 Respuesta cruda:", responseText);

      if (responseText.startsWith("a{")) {
        console.warn("⚠️ Se detectó 'a' al inicio de la respuesta, limpiando...");
        responseText = responseText.substring(1);
      }

      const data = JSON.parse(responseText);
      console.log("✅ Respuesta API parseada:", data);
      setCotizacion(data);
      alert("Cotización recibida con éxito ✅");
    } catch (err) {
      console.error("❌ Error de red:", err);
      alert(`❌ Error de conexión:\n\n${err.message}\n\nVerifica que la API esté disponible.`);
    }
  };

  // Descargar PDF
  const descargarPDF = () => {
    if (!cotizacion) return;

    const contenido = `
COTIZACIÓN DE CUBIERTA/TECHO
=============================

${cotizacion.mano_obra}

-----------------------------------
RESUMEN FINANCIERO
-----------------------------------
Valor Total Mano de Obra: $${cotizacion.valor_total_mano_obra}
Valor Total Materiales: $${cotizacion.Valor_total_Materiales}
Valor Total Obra a Todo Costo: $${cotizacion.Valor_total_obra_a_todo_costo}
    `;

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cotizacion_techo.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Zoom
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
    setStageX((1200 - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const zoomOut = () => {
    const scaleBy = 1.1;
    let newScale = Math.max(stageScale / scaleBy, 0.05);
    setStageScale(newScale);
    setStageX((1200 - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const centrarVista = () => {
    setStageX((1200 - stageWidth * stageScale) / 2 + offsetX * stageScale);
    setStageY((600 - stageHeight * stageScale) / 2 + offsetY * stageScale);
  };

  // Pan
  const panStart = React.useRef({ x: 0, y: 0 });
  const stageStart = React.useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!spacePressed) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    stageStart.current = { x: stageX, y: stageY };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setStageX(stageStart.current.x + dx);
    setStageY(stageStart.current.y + dy);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

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
  }, [isPanning]);

  useEffect(() => {
    centrarVista();
  }, [canvasWidth, canvasHeight, stageScale]);

  if (cotizacion) {
    return (
      <div className="cotizacion-resultado">
        <h2>✅ Cotización de Cubierta Recibida</h2>
        <pre className="mano-obra">{cotizacion.mano_obra}</pre>
        <div className="resumen">
          <p><strong>Valor Total Mano de Obra:</strong> ${cotizacion.valor_total_mano_obra}</p>
          <p><strong>Valor Total Materiales:</strong> ${cotizacion.Valor_total_Materiales}</p>
          <p><strong>Valor Total Obra a Todo Costo:</strong> ${cotizacion.Valor_total_obra_a_todo_costo}</p>
        </div>
        <div className="acciones">
          <button onClick={descargarPDF} className="btn-descargar">📄 Descargar PDF</button>
          <button onClick={() => setCotizacion(null)} className="btn-volver">Nueva cotización</button>
          <button onClick={onClose} className="btn-cerrar">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-techos">
      <h2>🏠 Cotización de Cubierta/Techo</h2>

      {/* Casillas para habilitar/deshabilitar techo y muros */}
      <div className="opciones-cotizacion">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={cotizarTecho}
            onChange={(e) => setCotizarTecho(e.target.checked)}
          />
          <span>Cotizar Techo</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={cotizarMuros}
            onChange={(e) => setCotizarMuros(e.target.checked)}
          />
          <span>Cotizar Muros y Columnas</span>
        </label>
      </div>

      {/* Controles principales */}
      <div className="controles-superiores">
        <div className="input-group">
          <label>Ancho (cm)</label>
          <input type="number" value={ancho} min={100} max={1000} onChange={e => setAncho(Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label>Largo (cm)</label>
          <input type="number" value={largo} min={100} max={1000} onChange={e => setLargo(Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label>Alto inclinación (cm)</label>
          <input type="number" value={altoInclinacion} min={50} max={300} onChange={e => setAltoInclinacion(Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label>Tipo de teja</label>
          <select value={tipoTeja} onChange={e => setTipoTeja(Number(e.target.value))}>
            <option value="2">Teja #5</option>
            <option value="3">Teja #6</option>
            <option value="4">Teja #8</option>
            <option value="5">Teja #10</option>
          </select>
        </div>
        <div className="input-group">
          <label>Tipo de ladrillo</label>
          <select value={tipoLadrillo} onChange={e => setTipoLadrillo(Number(e.target.value))}>
            <option value="1">Farol 10x20x30</option>
            <option value="4">Farol 12x20x30</option>
            <option value="6">Tolete 10x6x20</option>
            <option value="7">Tolete 12x6x24.5</option>
          </select>
        </div>
        <div className="input-group">
          <label>Flanche</label>
          <select value={flanche} onChange={e => setFlanche(Number(e.target.value))}>
            <option value="0">Ninguna</option>
            <option value="1">Encajonado</option>
            <option value="2">Esquina</option>
          </select>
        </div>
        <button onClick={zoomIn} className="btn-primary">Zoom +</button>
        <button onClick={zoomOut} className="btn-primary">Zoom -</button>
        <button onClick={centrarVista} className="btn-primary">Centrar vista</button>
        <button onClick={limpiarDatos} className="btn-danger">Limpiar datos</button>
      </div>

      {/* Controles de ejes secundarios */}
      <div className="controles-secundarios">
        <div className="input-group">
          <label>Eje secundario</label>
          <select value={orientacion} onChange={e => setOrientacion(e.target.value)}>
            <option value="V">Vertical</option>
            <option value="H">Horizontal</option>
          </select>
        </div>
        <div className="input-group">
          <label>Distancia (cm)</label>
          <input
            type="number"
            value={distancia}
            min={1}
            max={orientacion === "V" ? ancho - 1 : largo - 1}
            onChange={e => setDistancia(Number(e.target.value))}
          />
        </div>
        <button onClick={agregarEje} className="btn-primary">Agregar eje</button>
        <button onClick={deshacerEje} disabled={ejesSecundarios.length === 0} className="btn-primary">
          Deshacer último eje
        </button>
        <p className="instrucciones">
          <b>Zoom:</b> rueda del mouse | <b>Pan:</b> barra espaciadora + clic
        </p>
      </div>

      {/* Lienzo */}
      <div
        style={{
          width: 1200,
          height: 600,
          overflow: "auto",
          border: "1px solid #aaa",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: 16,
          position: "relative",
          cursor: spacePressed ? (isPanning ? "grabbing" : "grab") : "default"
        }}
        onMouseDown={handleMouseDown}
      >
        <Stage
          width={stageWidth}
          height={stageHeight}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stageX}
          y={stageY}
          onWheel={handleWheel}
          style={{ background: "#000", position: "absolute", left: 0, top: 0 }}
        >
          <Layer>
            {/* Borde del área útil */}
            <Rect
              x={margen + offsetX}
              y={margen + offsetY}
              width={ancho * escala}
              height={largo * escala}
              stroke="#00ff00"
              strokeWidth={4}
              listening={false}
            />
            {/* Ejes principales */}
            {[eje0, eje1, eje2, eje3].map((eje, i) => (
              <Line
                key={`ejeP-${i}`}
                points={[eje.x1 + offsetX, eje.y1 + offsetY, eje.x2 + offsetX, eje.y2 + offsetY]}
                stroke="#1976d2"
                strokeWidth={4}
              />
            ))}
            {/* Ejes secundarios */}
            {ejesV.map((ev, i) => {
              const x = margen + ev.distancia * escala + offsetX;
              return (
                <Line
                  key={`ejeV-${i}`}
                  points={[x, eje0.y1 + offsetY, x, eje2.y1 + offsetY]}
                  stroke="#43a047"
                  strokeWidth={2}
                  dash={[8, 8]}
                />
              );
            })}
            {ejesH.map((eh, i) => {
              const y = margen + eh.distancia * escala + offsetY;
              return (
                <Line
                  key={`ejeH-${i}`}
                  points={[eje0.x1 + offsetX, y, eje1.x1 + offsetX, y]}
                  stroke="#fbc02d"
                  strokeWidth={2}
                  dash={[8, 8]}
                />
              );
            })}
            {/* Nodos (siempre verticales 12x20, DENTRO del rectángulo) */}
            {nodos.map((n, idx) => {
              const w = 12;
              const h = 20;
              const muros = identificarTipoColumna(n);
              
              // Determinar posición del nodo DENTRO del rectángulo
              let rectX, rectY;
              
              // Esquina superior izquierda
              if (Math.abs(n.x - eje0.x1) < 1 && Math.abs(n.y - eje0.y1) < 1) {
                rectX = n.x + offsetX;
                rectY = n.y + offsetY;
              }
              // Esquina superior derecha
              else if (Math.abs(n.x - eje1.x1) < 1 && Math.abs(n.y - eje1.y1) < 1) {
                rectX = n.x - (w * escala) + offsetX;
                rectY = n.y + offsetY;
              }
              // Esquina inferior derecha
              else if (Math.abs(n.x - eje2.x1) < 1 && Math.abs(n.y - eje2.y1) < 1) {
                rectX = n.x - (w * escala) + offsetX;
                rectY = n.y - (h * escala) + offsetY;
              }
              // Esquina inferior izquierda
              else if (Math.abs(n.x - eje3.x1) < 1 && Math.abs(n.y - eje3.y1) < 1) {
                rectX = n.x + offsetX;
                rectY = n.y - (h * escala) + offsetY;
              }
              // Borde superior (no esquina)
              else if (Math.abs(n.y - eje0.y1) < 1) {
                rectX = n.x - (w * escala) / 2 + offsetX;
                rectY = n.y + offsetY;
              }
              // Borde inferior (no esquina)
              else if (Math.abs(n.y - eje2.y1) < 1) {
                rectX = n.x - (w * escala) / 2 + offsetX;
                rectY = n.y - (h * escala) + offsetY;
              }
              // Borde izquierdo (no esquina)
              else if (Math.abs(n.x - eje0.x1) < 1) {
                rectX = n.x + offsetX;
                rectY = n.y - (h * escala) / 2 + offsetY;
              }
              // Borde derecho (no esquina)
              else if (Math.abs(n.x - eje1.x1) < 1) {
                rectX = n.x - (w * escala) + offsetX;
                rectY = n.y - (h * escala) / 2 + offsetY;
              }
              // Nodo interior (centrado)
              else {
                rectX = n.x - (w * escala) / 2 + offsetX;
                rectY = n.y - (h * escala) / 2 + offsetY;
              }
              
              return (
                <React.Fragment key={`nodo-${idx}`}>
                  <Rect
                    x={rectX}
                    y={rectY}
                    width={w * escala}
                    height={h * escala}
                    fill={muros === 2 ? "#ff0000" : "#6E6E6E"}
                    stroke="#1976d2"
                    strokeWidth={2}
                  />
                  <Text
                    x={rectX + 2}
                    y={rectY + 2}
                    text={`N${idx + 1}\n${muros}M`}
                    fontSize={10}
                    fill="#fff"
                    fontStyle="bold"
                  />
                </React.Fragment>
              );
            })}
            {/* Cotas de distancia entre nodos */}
            {nodos.map((n1, i) =>
              nodos.slice(i + 1).map((n2, j) => {
                const esHorizontal = Math.abs(n1.y - n2.y) < 1;
                const esVertical = Math.abs(n1.x - n2.x) < 1;
                if (esHorizontal || esVertical) {
                  const distPx = Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2));
                  const distCm = Math.round(distPx / escala);
                  const midX = (n1.x + n2.x) / 2 + offsetX;
                  const midY = (n1.y + n2.y) / 2 + offsetY;
                  return (
                    <Text
                      key={`dist-${i}-${j}`}
                      x={midX - 30}
                      y={midY - 12}
                      width={60}
                      align="center"
                      text={`${distCm} cm`}
                      fontSize={14}
                      fill="#ffff00"
                      fontStyle="bold"
                    />
                  );
                }
                return null;
              })
            )}
          </Layer>
        </Stage>
      </div>

      {/* Lista de ejes secundarios */}
      <div className="lista-ejes">
        <b>Ejes secundarios</b>
        <ul>
          {ejesSecundarios.map((e, i) => (
            <li key={i}>
              {e.orientacion === "V" ? "Vertical" : "Horizontal"} a {e.distancia} cm
            </li>
          ))}
        </ul>
      </div>

      <div className="acciones">
        <button onClick={enviarCotizacion} className="btn-aceptar">Enviar cotización</button>
        <button onClick={onVolver} className="btn-volver">Volver</button>
      </div>
    </div>
  );
}