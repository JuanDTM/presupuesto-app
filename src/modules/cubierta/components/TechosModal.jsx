import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import { Stage, Layer, Line, Rect, Text as KonvaText } from "react-konva";
import "./TechosModal.css";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";
import { createTechoDefaultValues, techoSchema } from "../validation/schemas";
import CotizacionTechoPDF from "./CotizacionTechoPDF";
import TutorialButton from "../../../components/TutorialButton";

const readNumberAsString = (key, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null || stored === "undefined") return fallback;
    const parsed = JSON.parse(stored);
    if (typeof parsed === "number" || typeof parsed === "string") {
      return String(parsed);
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const readBoolean = (key, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null || stored === "undefined") return fallback;
    return Boolean(JSON.parse(stored));
  } catch {
    return fallback;
  }
};

const readArray = (key, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null || stored === "undefined") return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const storeValue = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorar errores de almacenamiento
  }
};

export default function TechosModal({ onClose, onVolver }) {
  const storedDefaults = useMemo(() => {
    const defaults = createTechoDefaultValues();
    return {
      ...defaults,
      ancho: readNumberAsString("techo_ancho", defaults.ancho),
      largo: readNumberAsString("techo_largo", defaults.largo),
      altoInclinacion: readNumberAsString("techo_alto", defaults.altoInclinacion),
      tipoTeja: readNumberAsString("techo_teja", defaults.tipoTeja),
      tipoLadrillo: readNumberAsString("techo_ladrillo", defaults.tipoLadrillo),
      flanche: readNumberAsString("techo_flanche", defaults.flanche),
      cotizarTecho: readBoolean("techo_cotizar_techo", defaults.cotizarTecho),
      cotizarMuros: readBoolean("techo_cotizar_muros", defaults.cotizarMuros),
    };
  }, []);

  const [cotizacion, setCotizacion] = useState(null);
  const [ultimoFormulario, setUltimoFormulario] = useState(null);
  const [ejesSecundarios, setEjesSecundarios] = useState(() => readArray("techo_ejes", []));
  const [imagenGuia, setImagenGuia] = useState(() => {
    try {
      return window.localStorage.getItem("imagenGuiaTecho") ?? null;
    } catch {
      return null;
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(techoSchema),
    defaultValues: storedDefaults,
    mode: "onBlur",
  });

  const anchoWatch = watch("ancho");
  const largoWatch = watch("largo");
  const altoInclinacionWatch = watch("altoInclinacion");
  const tipoTejaWatch = watch("tipoTeja");
  const tipoLadrilloWatch = watch("tipoLadrillo");
  const flancheWatch = watch("flanche");
  const cotizarTechoWatch = watch("cotizarTecho");
  const cotizarMurosWatch = watch("cotizarMuros");

  useEffect(() => {
    storeValue("techo_ancho", Number(anchoWatch) || 0);
  }, [anchoWatch]);

  useEffect(() => {
    storeValue("techo_largo", Number(largoWatch) || 0);
  }, [largoWatch]);

  useEffect(() => {
    storeValue("techo_alto", Number(altoInclinacionWatch) || 0);
  }, [altoInclinacionWatch]);

  useEffect(() => {
    storeValue("techo_teja", Number(tipoTejaWatch) || 0);
  }, [tipoTejaWatch]);

  useEffect(() => {
    storeValue("techo_ladrillo", Number(tipoLadrilloWatch) || 0);
  }, [tipoLadrilloWatch]);

  useEffect(() => {
    storeValue("techo_flanche", Number(flancheWatch) || 0);
  }, [flancheWatch]);

  useEffect(() => {
    storeValue("techo_cotizar_techo", cotizarTechoWatch);
  }, [cotizarTechoWatch]);

  useEffect(() => {
    storeValue("techo_cotizar_muros", cotizarMurosWatch);
  }, [cotizarMurosWatch]);

  useEffect(() => {
    storeValue("techo_ejes", ejesSecundarios);
  }, [ejesSecundarios]);

  const [nuevoEjeOrientacion, setNuevoEjeOrientacion] = useState("V");
  const [nuevoEjeDistancia, setNuevoEjeDistancia] = useState("");

  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);

  const panStart = useRef({ x: 0, y: 0 });
  const stageStart = useRef({ x: 0, y: 0 });

  const anchoValue = Number(anchoWatch) || 0;
  const largoValue = Number(largoWatch) || 0;
  const altoInclinacionValue = Number(altoInclinacionWatch) || 0;

  const dimensionMaxima = Math.max(anchoValue, largoValue, 1);
  const escalaCalculada = 780 / dimensionMaxima;
  const escala = Number.isFinite(escalaCalculada)
    ? Math.min(2, Math.max(0.45, escalaCalculada))
    : 2;
  const margen = 50;
  const canvasWidth = margen + anchoValue * escala + margen;
  const canvasHeight = margen + largoValue * escala + margen;
  const extraMargin = 140;
  const stageWidth = canvasWidth + extraMargin * 2;
  const stageHeight = canvasHeight + extraMargin * 2;
  const offsetX = extraMargin;
  const offsetY = extraMargin;

  const ejesV = useMemo(
    () =>
      ejesSecundarios
        .filter((eje) => eje.orientacion === "V")
        .map((eje) => ({ ...eje, distancia: Number(eje.distancia) || 0 }))
        .filter((eje) => eje.distancia > 0 && eje.distancia < anchoValue),
    [ejesSecundarios, anchoValue]
  );

  const ejesH = useMemo(
    () =>
      ejesSecundarios
        .filter((eje) => eje.orientacion === "H")
        .map((eje) => ({ ...eje, distancia: Number(eje.distancia) || 0 }))
        .filter((eje) => eje.distancia > 0 && eje.distancia < largoValue),
    [ejesSecundarios, largoValue]
  );

  const eje0 = useMemo(
    () => ({
      x1: margen,
      y1: margen,
      x2: margen + anchoValue * escala,
      y2: margen,
    }),
    [margen, anchoValue, escala]
  );

  const eje1 = useMemo(
    () => ({
      x1: margen + anchoValue * escala,
      y1: margen,
      x2: margen + anchoValue * escala,
      y2: margen + largoValue * escala,
    }),
    [margen, anchoValue, largoValue, escala]
  );

  const eje2 = useMemo(
    () => ({
      x1: margen + anchoValue * escala,
      y1: margen + largoValue * escala,
      x2: margen,
      y2: margen + largoValue * escala,
    }),
    [margen, anchoValue, largoValue, escala]
  );

  const eje3 = useMemo(
    () => ({
      x1: margen,
      y1: margen + largoValue * escala,
      x2: margen,
      y2: margen,
    }),
    [margen, largoValue, escala]
  );

  const nodos = useMemo(() => {
    let nodosIniciales = [
      { x: eje0.x1, y: eje0.y1 },
      { x: eje1.x1, y: eje1.y1 },
      { x: eje2.x1, y: eje2.y1 },
      { x: eje3.x1, y: eje3.y1 },
    ];

    ejesV.forEach((ev) => {
      const x = eje0.x1 + ev.distancia * escala;
      nodosIniciales.push({ x, y: eje0.y1 });
      nodosIniciales.push({ x, y: eje2.y1 });
      ejesH.forEach((eh) => {
        const y = eje0.y1 + eh.distancia * escala;
        nodosIniciales.push({ x, y });
      });
    });

    ejesH.forEach((eh) => {
      const y = eje0.y1 + eh.distancia * escala;
      nodosIniciales.push({ x: eje0.x1, y });
      nodosIniciales.push({ x: eje1.x1, y });
    });

    return nodosIniciales.filter(
      (nodo, idx, arr) =>
        arr.findIndex((m) => Math.abs(m.x - nodo.x) < 1 && Math.abs(m.y - nodo.y) < 1) === idx
    );
  }, [eje0, eje1, eje2, eje3, ejesV, ejesH, escala]);

  const identificarTipoColumna = useCallback(
    (nodo) => {
      const esEsquina =
        (Math.abs(nodo.x - eje0.x1) < 1 || Math.abs(nodo.x - eje1.x1) < 1) &&
        (Math.abs(nodo.y - eje0.y1) < 1 || Math.abs(nodo.y - eje2.y1) < 1);
      return esEsquina ? 2 : 3;
    },
    [eje0, eje1, eje2]
  );

  const calcularAnchosTecho = useCallback(() => {
    if (ejesV.length === 0) {
      return [anchoValue];
    }

    const ejesOrdenados = [...ejesV]
      .map((eje) => Number(eje.distancia) || 0)
      .filter((distancia) => distancia > 0 && distancia < anchoValue)
      .sort((a, b) => a - b);

    if (ejesOrdenados.length === 0) {
      return [anchoValue];
    }

    const anchos = [];
    anchos.push(ejesOrdenados[0]);
    for (let i = 0; i < ejesOrdenados.length - 1; i++) {
      anchos.push(ejesOrdenados[i + 1] - ejesOrdenados[i]);
    }
    anchos.push(anchoValue - ejesOrdenados[ejesOrdenados.length - 1]);
    return anchos;
  }, [anchoValue, ejesV]);

  const calcularEjesMuros = useCallback(
    (altoActual) => {
      const ejesMuros = [];
      const altoMuros = Math.round(altoActual / 2);
      const anchoNodo = 12;
      const largoNodo = 20;

      const ejesVOrdenados = [...ejesV]
        .map((eje) => Number(eje.distancia) || 0)
        .filter((distancia) => distancia > 0 && distancia < anchoValue)
        .sort((a, b) => a - b);

      const ejesHOrdenados = [...ejesH]
        .map((eje) => Number(eje.distancia) || 0)
        .filter((distancia) => distancia > 0 && distancia < largoValue)
        .sort((a, b) => a - b);

      const seccionesHorizontales = [];
      if (ejesVOrdenados.length === 0) {
        seccionesHorizontales.push({ distancia: anchoValue });
      } else {
        seccionesHorizontales.push({ distancia: ejesVOrdenados[0] });
        for (let i = 0; i < ejesVOrdenados.length - 1; i++) {
          seccionesHorizontales.push({ distancia: ejesVOrdenados[i + 1] - ejesVOrdenados[i] });
        }
        seccionesHorizontales.push({
          distancia: anchoValue - ejesVOrdenados[ejesVOrdenados.length - 1],
        });
      }

      const seccionesVerticales = [];
      if (ejesHOrdenados.length === 0) {
        seccionesVerticales.push({ distancia: largoValue });
      } else {
        seccionesVerticales.push({ distancia: ejesHOrdenados[0] });
        for (let i = 0; i < ejesHOrdenados.length - 1; i++) {
          seccionesVerticales.push({ distancia: ejesHOrdenados[i + 1] - ejesHOrdenados[i] });
        }
        seccionesVerticales.push({
          distancia: largoValue - ejesHOrdenados[ejesHOrdenados.length - 1],
        });
      }

      seccionesHorizontales.forEach((seccion, idx) => {
        const anchoEstructura = seccion.distancia;
        let anchoLibre;
        if (ejesVOrdenados.length === 0) {
          anchoLibre = anchoEstructura - anchoNodo - anchoNodo;
        } else {
          anchoLibre = anchoEstructura - anchoNodo - anchoNodo / 2;
        }

        if (anchoLibre > 0) {
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
              riostra: [],
            });
          }
        }
      });

      seccionesVerticales.forEach((seccion, idx) => {
        const anchoEstructura = seccion.distancia;
        let anchoLibre;

        if (ejesHOrdenados.length === 0) {
          anchoLibre = anchoEstructura - largoNodo - largoNodo;
        } else {
          anchoLibre = anchoEstructura - largoNodo - largoNodo / 2;
        }

        if (anchoLibre > 0) {
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
              riostra: [],
            });
          }
        }
      });

      return ejesMuros;
    },
    [ejesV, ejesH, anchoValue, largoValue]
  );

  const calcularColumnasCubierta = useCallback(
    (altoActual) => {
      const altoColumnas = Math.round(altoActual / 2);
      return {
        especialidad: 1,
        datos: nodos.map((nodo) => ({
          muros: identificarTipoColumna(nodo),
          alto: altoColumnas,
          tipo_columna: 1,
        })),
      };
    },
    [identificarTipoColumna, nodos]
  );

  const centrarVista = useCallback(() => {
    setStageX((1200 - stageWidth * stageScale) / 2 + offsetX * stageScale);
    setStageY((600 - stageHeight * stageScale) / 2 + offsetY * stageScale);
  }, [stageScale, stageWidth, stageHeight, offsetX, offsetY]);

  useEffect(() => {
    centrarVista();
  }, [centrarVista, canvasWidth, canvasHeight]);

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
    const newScale = Math.min(stageScale * scaleBy, 10);
    setStageScale(newScale);
    setStageX((1200 - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const zoomOut = () => {
    const scaleBy = 1.1;
    const newScale = Math.max(stageScale / scaleBy, 0.05);
    setStageScale(newScale);
    setStageX((1200 - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const handleMouseDown = (event) => {
    if (!spacePressed) return;
    setIsPanning(true);
    panStart.current = { x: event.clientX, y: event.clientY };
    stageStart.current = { x: stageX, y: stageY };
  };

  const handleMouseMove = useCallback(
    (event) => {
      if (!isPanning) return;
      const dx = event.clientX - panStart.current.x;
      const dy = event.clientY - panStart.current.y;
      setStageX(stageStart.current.x + dx);
      setStageY(stageStart.current.y + dy);
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        setSpacePressed(false);
      }
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
  }, [isPanning, handleMouseMove, handleMouseUp]);

  const manejarSubidaImagen = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imagenBase64 = reader.result;
      setImagenGuia(imagenBase64);
      storeValue("imagenGuiaTecho", imagenBase64);
      alert("✅ Imagen guardada correctamente");
    };
    reader.readAsDataURL(archivo);
  };

  const agregarEjeSecundario = () => {
    const distanciaNumero = Number(nuevoEjeDistancia);
    const limite = nuevoEjeOrientacion === "V" ? anchoValue : largoValue;

    if (!Number.isFinite(distanciaNumero) || distanciaNumero <= 0 || distanciaNumero >= limite) {
      alert(
        `⚠️ La distancia debe ser mayor a 0 y menor al ${
          nuevoEjeOrientacion === "V" ? "ancho" : "largo"
        } actual`
      );
      return;
    }

    setEjesSecundarios((prev) => [
      ...prev,
      {
        orientacion: nuevoEjeOrientacion,
        distancia: distanciaNumero,
      },
    ]);
    setNuevoEjeDistancia("");
  };

  const eliminarEje = (index) => {
    setEjesSecundarios((prev) => prev.filter((_, idx) => idx !== index));
  };

  const limpiarEjes = () => {
    if (window.confirm("¿Estás seguro de limpiar todos los ejes secundarios?")) {
      setEjesSecundarios([]);
    }
  };

  const enviarCotizacion = async (values) => {
    const anchosTecho = calcularAnchosTecho();
    const ejesMuros = values.cotizarMuros ? calcularEjesMuros(values.altoInclinacion) : null;
    const columnasCubierta = values.cotizarMuros
      ? calcularColumnasCubierta(values.altoInclinacion)
      : null;

    const payload = {
      cuchilla: 1,
      clase: 1,
      caballete: 0,
      flanche: values.flanche,
      base: 0,
      ladrillo: values.tipoLadrillo,
      techos: values.cotizarTecho
        ? [
            {
              tipo: 0,
              alto: values.altoInclinacion,
              largo: values.largo,
              ancho: anchosTecho,
              teja: values.tipoTeja,
            },
          ]
        : null,
      ejes_muros: values.cotizarMuros ? ejesMuros : null,
      columnas_cubierta: values.cotizarMuros ? columnasCubierta : null,
    };

    const resumenFormulario = {
      ...values,
      ejesSecundarios: ejesSecundarios.map((eje) => ({
        orientacion: eje.orientacion,
        distancia: Number(eje.distancia) || 0,
      })),
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const data = await request(apiUrls.cotizacion.cotizarTecho, {
        method: "POST",
        body: payload,
      });

      setCotizacion(data);
      setUltimoFormulario(resumenFormulario);
      alert("Cotización recibida ✅");
    } catch (error) {
      console.error("❌ Error al cotizar techo:", error);
      const message =
        error?.message || "Ocurrió un problema al enviar la cotización. Intenta nuevamente.";
      alert(`❌ Error:\n\n${message}`);
    }
  };

  const resetFormulario = () => {
    const defaults = createTechoDefaultValues();
    setValue("ancho", defaults.ancho);
    setValue("largo", defaults.largo);
    setValue("altoInclinacion", defaults.altoInclinacion);
    setValue("tipoTeja", defaults.tipoTeja);
    setValue("tipoLadrillo", defaults.tipoLadrillo);
    setValue("flanche", defaults.flanche);
    setValue("cotizarTecho", defaults.cotizarTecho);
    setValue("cotizarMuros", defaults.cotizarMuros);
    setEjesSecundarios([]);
    setCotizacion(null);
    setUltimoFormulario(null);
  };

  const descargarPDF = async () => {
    if (!cotizacion) {
      alert("No hay cotización disponible para descargar");
      return;
    }

    if (!ultimoFormulario) {
      alert("No se encontraron los parámetros utilizados para la cotización.");
      return;
    }

    try {
      const blob = await pdf(
        <CotizacionTechoPDF cotizacion={cotizacion} params={ultimoFormulario} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `cotizacion-techo-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      alert("No se pudo generar el PDF de la cotización.");
    }
  };

  if (cotizacion) {
    return (
      <div className="techo-modal techo-modal--results">
        <div className="techo-card techo-card--results">
          <header className="techo-modal__header">
            <div>
              <p className="techo-modal__eyebrow">Resumen de cotización</p>
              <h1>Cubierta / Techo</h1>
              <p className="techo-modal__hint">
                Descarga el detalle o reinicia con nuevos parámetros cuando lo necesites.
              </p>
            </div>
          </header>

          <div className="techo-results">
            <pre className="techo-results__log">{cotizacion.mano_obra}</pre>
            <div className="techo-results__summary">
              <p>
                <span>Valor total mano de obra</span>
                <strong>${cotizacion.valor_total_mano_obra}</strong>
              </p>
              <p>
                <span>Valor total materiales</span>
                <strong>${cotizacion.Valor_total_Materiales}</strong>
              </p>
              <p>
                <span>Obra a todo costo</span>
                <strong>${cotizacion.Valor_total_obra_a_todo_costo}</strong>
              </p>
            </div>
          </div>

          <div className="techo-actions">
            <button
              onClick={descargarPDF}
              className="techo-button techo-button--secondary"
              type="button"
            >
              Descargar PDF
            </button>
            <button onClick={resetFormulario} className="techo-button" type="button">
              Nueva cotización
            </button>
            <button onClick={onClose} className="techo-button techo-button--ghost" type="button">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="techo-modal" onSubmit={handleSubmit(enviarCotizacion)} noValidate>
      <header className="techo-modal__header">
        <div>
          <button onClick={onVolver} className="techo-button techo-button--ghost" type="button">
            Volver
          </button>
          <h1>Cubierta / Techo</h1>
          <p className="techo-modal__hint">
            Define las dimensiones, componentes y ejes estructurales para obtener la estimación del
            sistema de cubierta.
          </p>
        </div>
        <TutorialButton variant="minimal" text="Tutorial" />
      </header>

      <div className="techo-sections">
        <section className="techo-card">
          <h2>Opciones de cotización</h2>
          <div className="techo-toggle-group">
            <label
              className={`techo-toggle ${errors.cotizarTecho ? "techo-toggle--error" : ""}`}
            >
              <input type="checkbox" {...register("cotizarTecho")} />
              Cotizar techo
            </label>
            <label
              className={`techo-toggle ${errors.cotizarMuros ? "techo-toggle--error" : ""}`}
            >
              <input type="checkbox" {...register("cotizarMuros")} />
              Cotizar muros y columnas
            </label>
          </div>
          {(errors.cotizarTecho || errors.cotizarMuros) && (
            <p className="techo-field__error">Selecciona al menos una opción de cotización</p>
          )}
        </section>

        <section className="techo-card">
          <h2>Dimensiones principales</h2>
          <div className="techo-grid">
            <div className={`techo-field ${errors.ancho ? "techo-field--error" : ""}`}>
              <label htmlFor="techo-ancho">Ancho (cm)</label>
              <input
                id="techo-ancho"
                type="number"
                min={100}
                max={2000}
                {...register("ancho")}
                aria-invalid={errors.ancho ? "true" : undefined}
              />
              {errors.ancho && <p className="techo-field__error">{errors.ancho.message}</p>}
            </div>
            <div className={`techo-field ${errors.largo ? "techo-field--error" : ""}`}>
              <label htmlFor="techo-largo">Largo (cm)</label>
              <input
                id="techo-largo"
                type="number"
                min={100}
                max={2000}
                {...register("largo")}
                aria-invalid={errors.largo ? "true" : undefined}
              />
              {errors.largo && <p className="techo-field__error">{errors.largo.message}</p>}
            </div>
            <div
              className={`techo-field ${errors.altoInclinacion ? "techo-field--error" : ""}`}
            >
              <label htmlFor="techo-alto">Alto de inclinación (cm)</label>
              <input
                id="techo-alto"
                type="number"
                min={50}
                max={500}
                {...register("altoInclinacion")}
                aria-invalid={errors.altoInclinacion ? "true" : undefined}
              />
              {errors.altoInclinacion && (
                <p className="techo-field__error">{errors.altoInclinacion.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="techo-card">
          <h2>Componentes del sistema</h2>
          <div className="techo-grid">
            <div className={`techo-field ${errors.tipoTeja ? "techo-field--error" : ""}`}>
              <label htmlFor="techo-teja">Tipo de teja</label>
              <select
                id="techo-teja"
                {...register("tipoTeja")}
                aria-invalid={errors.tipoTeja ? "true" : undefined}
                onMouseDown={(event) => handleMouseDown(event.evt)}
              >
                <option value="2">Teja #5</option>
                <option value="3">Teja #6</option>
                <option value="4">Teja #8</option>
                <option value="5">Teja #10</option>
              </select>
              {errors.tipoTeja && (
                <p className="techo-field__error">{errors.tipoTeja.message}</p>
              )}
            </div>
            <div className={`techo-field ${errors.tipoLadrillo ? "techo-field--error" : ""}`}>
              <label htmlFor="techo-ladrillo">Tipo de ladrillo</label>
              <select
                id="techo-ladrillo"
                {...register("tipoLadrillo")}
                aria-invalid={errors.tipoLadrillo ? "true" : undefined}
              >
                <option value="1">Farol 10×20×30</option>
                <option value="4">Farol 12×20×30</option>
                <option value="6">Tolete 10×6×20</option>
                <option value="7">Tolete 12×6×24.5</option>
              </select>
              {errors.tipoLadrillo && (
                <p className="techo-field__error">{errors.tipoLadrillo.message}</p>
              )}
            </div>
            <div className={`techo-field ${errors.flanche ? "techo-field--error" : ""}`}>
              <label htmlFor="techo-flanche">Flanche</label>
              <select
                id="techo-flanche"
                {...register("flanche")}
                aria-invalid={errors.flanche ? "true" : undefined}
              >
                <option value="0">Sin flanche</option>
                <option value="1">Encajonado</option>
                <option value="2">Esquina</option>
              </select>
              {errors.flanche && (
                <p className="techo-field__error">{errors.flanche.message}</p>
              )}
            </div>
            <label className="techo-field techo-field--inline">
              <span>Imagen de referencia</span>
              <input type="file" accept="image/*" onChange={manejarSubidaImagen} />
            </label>
            {imagenGuia && (
              <div className="techo-field techo-field--inline">
                <span>Imagen guardada</span>
                <img
                  src={imagenGuia}
                  alt="Guía de techo"
                  style={{ maxWidth: "240px", borderRadius: "12px", border: "1px solid #d6dbe8" }}
                />
              </div>
            )}
          </div>
        </section>

        <section className="techo-card">
          <div className="techo-card__header">
            <h2>Ejes secundarios</h2>
            <p className="techo-card__helper">
              Configura ejes adicionales para dividir el techo en tramos estructurales (verticales o
              horizontales). Úsalos para calcular muros y columnas interiores.
            </p>
          </div>
          <div className="techo-grid">
            <div className="techo-field">
              <label htmlFor="techo-orientacion">Orientación</label>
              <select
                id="techo-orientacion"
                value={nuevoEjeOrientacion}
                onChange={(event) => setNuevoEjeOrientacion(event.target.value)}
              >
                <option value="V">Vertical</option>
                <option value="H">Horizontal</option>
              </select>
            </div>
            <div className="techo-field">
              <label htmlFor="techo-distancia">Distancia (cm)</label>
              <input
                id="techo-distancia"
                type="number"
                min="1"
                value={nuevoEjeDistancia}
                onChange={(event) => setNuevoEjeDistancia(event.target.value)}
              />
            </div>
          </div>
          <div className="techo-actions">
            <button
              type="button"
              onClick={agregarEjeSecundario}
              className="techo-button techo-button--secondary"
            >
              Añadir eje
            </button>
            <button
              type="button"
              onClick={limpiarEjes}
              className="techo-button techo-button--danger"
            >
              Limpiar ejes
            </button>
          </div>
          {ejesSecundarios.length > 0 ? (
            <ul className="techo-ejes-list">
              {ejesSecundarios.map((eje, index) => (
                <li key={`eje-${index}`}>
                  {eje.orientacion === "V" ? "Vertical" : "Horizontal"} a {eje.distancia} cm
                  <button
                    type="button"
                    className="techo-button techo-button--ghost"
                    style={{ marginLeft: 12, padding: "6px 12px" }}
                    onClick={() => eliminarEje(index)}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="techo-card__helper">
              Aún no has agregado ejes secundarios. Puedes dejarlo vacío si no los necesitas.
            </p>
          )}
        </section>

        <section className="techo-card">
          <h2>Vista previa interactiva</h2>
          <div className="techo-helpers">
            <span>🔍 Usa la rueda del mouse para hacer zoom.</span>
            <span>✋ Mantén presionada la barra espaciadora y arrastra para mover la vista.</span>
          </div>
          <div
            className="techo-stage-container"
            style={{
              cursor: spacePressed ? (isPanning ? "grabbing" : "grab") : "default",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="techo-stage-inner">
              <Stage
                width={stageWidth}
                height={stageHeight}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stageX}
                y={stageY}
                onWheel={handleWheel}
                style={{ position: "absolute", left: 0, top: 0 }}
              >
                <Layer>
                  <Rect
                    x={0}
                    y={0}
                    width={stageWidth}
                    height={stageHeight}
                    fill="#050b18"
                    listening={false}
                  />
                  <Rect
                    x={margen + offsetX}
                    y={margen + offsetY}
                    width={anchoValue * escala}
                    height={largoValue * escala}
                    stroke="#00ff00"
                    strokeWidth={4}
                    listening={false}
                  />

                  {[eje0, eje1, eje2, eje3].map((eje, index) => (
                    <Line
                      key={`ejeP-${index}`}
                      points={[
                        eje.x1 + offsetX,
                        eje.y1 + offsetY,
                        eje.x2 + offsetX,
                        eje.y2 + offsetY,
                      ]}
                      stroke="#1976d2"
                      strokeWidth={4}
                    />
                  ))}

                  {ejesV.map((eje, index) => {
                    const x = margen + eje.distancia * escala + offsetX;
                    return (
                      <Line
                        key={`ejeV-${index}`}
                        points={[x, eje0.y1 + offsetY, x, eje2.y1 + offsetY]}
                        stroke="#43a047"
                        strokeWidth={2}
                        dash={[8, 8]}
                      />
                    );
                  })}

                  {ejesH.map((eje, index) => {
                    const y = margen + eje.distancia * escala + offsetY;
                    return (
                      <Line
                        key={`ejeH-${index}`}
                        points={[eje0.x1 + offsetX, y, eje1.x1 + offsetX, y]}
                        stroke="#fbc02d"
                        strokeWidth={2}
                        dash={[8, 8]}
                      />
                    );
                  })}

                  {nodos.map((nodo, index) => {
                    const anchoNodo = 12;
                    const largoNodo = 20;
                    const tipoColumna = identificarTipoColumna(nodo);

                    let rectX;
                    let rectY;

                    if (Math.abs(nodo.x - eje0.x1) < 1 && Math.abs(nodo.y - eje0.y1) < 1) {
                      rectX = nodo.x + offsetX;
                      rectY = nodo.y + offsetY;
                    } else if (Math.abs(nodo.x - eje1.x1) < 1 && Math.abs(nodo.y - eje1.y1) < 1) {
                      rectX = nodo.x - anchoNodo * escala + offsetX;
                      rectY = nodo.y + offsetY;
                    } else if (Math.abs(nodo.x - eje2.x1) < 1 && Math.abs(nodo.y - eje2.y1) < 1) {
                      rectX = nodo.x - anchoNodo * escala + offsetX;
                      rectY = nodo.y - largoNodo * escala + offsetY;
                    } else if (Math.abs(nodo.x - eje3.x1) < 1 && Math.abs(nodo.y - eje3.y1) < 1) {
                      rectX = nodo.x + offsetX;
                      rectY = nodo.y - largoNodo * escala + offsetY;
                    } else if (Math.abs(nodo.y - eje0.y1) < 1) {
                      rectX = nodo.x - (anchoNodo * escala) / 2 + offsetX;
                      rectY = nodo.y + offsetY;
                    } else if (Math.abs(nodo.y - eje2.y1) < 1) {
                      rectX = nodo.x - (anchoNodo * escala) / 2 + offsetX;
                      rectY = nodo.y - largoNodo * escala + offsetY;
                    } else if (Math.abs(nodo.x - eje0.x1) < 1) {
                      rectX = nodo.x + offsetX;
                      rectY = nodo.y - (largoNodo * escala) / 2 + offsetY;
                    } else if (Math.abs(nodo.x - eje1.x1) < 1) {
                      rectX = nodo.x - anchoNodo * escala + offsetX;
                      rectY = nodo.y - (largoNodo * escala) / 2 + offsetY;
                    } else {
                      rectX = nodo.x - (anchoNodo * escala) / 2 + offsetX;
                      rectY = nodo.y - (largoNodo * escala) / 2 + offsetY;
                    }

                    return (
                      <React.Fragment key={`nodo-${index}`}>
                        <Rect
                          x={rectX}
                          y={rectY}
                          width={anchoNodo * escala}
                          height={largoNodo * escala}
                          fill={tipoColumna === 2 ? "#ff0000" : "#6E6E6E"}
                          stroke="#1976d2"
                          strokeWidth={2}
                        />
                        <KonvaText
                          x={rectX + 2}
                          y={rectY + 2}
                          text={`N${index + 1}\n${tipoColumna}M`}
                          fontSize={10}
                          fill="#fff"
                          fontStyle="bold"
                        />
                      </React.Fragment>
                    );
                  })}

                  {nodos.map((nodoA, indexA) =>
                    nodos.slice(indexA + 1).map((nodoB, indexB) => {
                      const esHorizontal = Math.abs(nodoA.y - nodoB.y) < 1;
                      const esVertical = Math.abs(nodoA.x - nodoB.x) < 1;
                      if (!esHorizontal && !esVertical) {
                        return null;
                      }
                      const distanciaPixeles = Math.sqrt(
                        Math.pow(nodoB.x - nodoA.x, 2) + Math.pow(nodoB.y - nodoA.y, 2)
                      );
                      const distanciaCentimetros = Math.round(distanciaPixeles / escala);
                      const puntoMedioX = (nodoA.x + nodoB.x) / 2 + offsetX;
                      const puntoMedioY = (nodoA.y + nodoB.y) / 2 + offsetY;
                      return (
                        <KonvaText
                          key={`dist-${indexA}-${indexB}`}
                          x={puntoMedioX - 30}
                          y={puntoMedioY - 12}
                          width={60}
                          align="center"
                          text={`${distanciaCentimetros} cm`}
                          fontSize={14}
                          fill="#ffff00"
                          fontStyle="bold"
                        />
                      );
                    })
                  )}
                </Layer>
              </Stage>
            </div>
          </div>
          <div className="techo-actions">
            <button
              type="button"
              onClick={zoomIn}
              className="techo-button techo-button--secondary"
            >
              Zoom +
            </button>
            <button
              type="button"
              onClick={zoomOut}
              className="techo-button techo-button--secondary"
            >
              Zoom -
            </button>
            <button type="button" onClick={centrarVista} className="techo-button techo-button--ghost">
              Centrar vista
            </button>
          </div>
        </section>
      </div>

      <div className="techo-actions">
        <button className="techo-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar cotización"}
        </button>
        <button onClick={onVolver} className="techo-button techo-button--ghost" type="button">
          Volver
        </button>
      </div>
    </form>
  );
}

