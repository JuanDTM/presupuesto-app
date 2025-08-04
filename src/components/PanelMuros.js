// PanelMuros.js
import React, { useState, useEffect } from "react";
import MuroVentanaEditor from "./MuroVentanaEditor"; // tu editor modal
import MuroPuertaEditor from "./MuroPuertaEditor"; // tu editor modal
import MuroPuertaVentanaEditor from "./MuroPuertaVentanaEditor"; // tu editor modal para puerta ventana

//tipo de muros
const tiposMuros = [
  { value: "entero", label: "Muro entero" },
  { value: "ventana", label: "Muro ventana" },
  { value: "puerta", label: "Muro puerta" },
  { value: "puertaventana", label: "Muro puerta ventana" },
];

export default function PanelMuros({
  nodos,  
  muros,
  setMuros,
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
  ejesH,
  altura,
}) {

    // Estados para las variables relacionadas con la interacción del lienzo
    const [spacePressed, setSpacePressed] = useState(false); // Indica si la tecla de espacio está presionada
    const [isPanning, setIsPanning] = useState(false); // Indica si el usuario está desplazando el lienzo
    const [stageScale, setStageScale] = useState(1); // Nivel de zoom inicial
  
    // Monitorear cambios en el estado `muros`
    useEffect(() => {
      console.log("Muros actualizados:", muros);
      muros.forEach((muro, index) => {
        console.log(`Muro ${index}:`, muro);
      });
    }, [muros]);

    // Función para manejar el evento de rueda del ratón
    const handleWheel = (event) => {
      event.preventDefault(); // Evita el comportamiento predeterminado del scroll
      const scaleBy = 1.05; // Factor de escala
      const oldScale = stageScale;
      const pointer = event.target.getPointerPosition();
      const mousePointTo = {
        x: pointer.x / oldScale - event.target.x() / oldScale,
        y: pointer.y / oldScale - event.target.y() / oldScale,
      };
  
      // Ajustar la escala
      const newScale = event.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      setStageScale(newScale);
  
      // Ajustar la posición del lienzo
      event.target.scale({ x: newScale, y: newScale });
      const newPos = {
        x: -(mousePointTo.x - pointer.x / newScale) * newScale,
        y: -(mousePointTo.y - pointer.y / newScale) * newScale,
      };
      event.target.position(newPos);
    };

  const [tipoMuro, setTipoMuro] = useState("entero");
  const [nodoA, setNodoA] = useState(0);
  const [nodoB, setNodoB] = useState(1);
  const [desplazamiento, setDesplazamiento] = useState(0);

  // Definir los ejes principales
  const ejesPrincipales = {
    superior: { x1: margen, y1: margen, x2: margen + ancho * escala, y2: margen },
    inferior: { x1: margen, y1: margen + largo * escala, x2: margen + ancho * escala, y2: margen + largo * escala },
    izquierdo: { x1: margen, y1: margen, x2: margen, y2: margen + largo * escala },
    derecho: { x1: margen + ancho * escala, y1: margen, x2: margen + ancho * escala, y2: margen + largo * escala },
  };

  // Calcular los nodos iniciales (esquinodoas)
  const nodosIniciales = [
    { x: ejesPrincipales.izquierdo.x1, y: ejesPrincipales.superior.y1 }, // Nodo superior izquierdo
    { x: ejesPrincipales.derecho.x1, y: ejesPrincipales.superior.y1 },  // Nodo superior derecho
    { x: ejesPrincipales.izquierdo.x1, y: ejesPrincipales.inferior.y1 }, // Nodo inferior izquierdo
    { x: ejesPrincipales.derecho.x1, y: ejesPrincipales.inferior.y1 },  // Nodo inferior derecho
  ];

  // conatante de editor ventana
  const [mostrarEditorVentana, setMostrarEditorVentana] = useState(false);
  // constante de editor puerta
  const [mostrarEditorPuerta, setMostrarEditorPuerta] = useState(false);
  //constante de editor puerta ventana
  const [mostrarEditorPuertaVentana, setMostrarEditorPuertaVentana] = useState(false);

  const [datosPrevios, setDatosPrevios] = useState(null);

   // Devuelve dimensiones del nodo según nivel y orientación
   function getDimensionesNodo(nodoN) {
    if (nivel === "1 de 1") {
      // Usar directamente orientacionesNodos[nodoClave]
      const orient = orientacionesNodos[nodoN] || "horizontal"; // Por defecto horizontal si no está definido
      if (!orient) {
        throw new Error(`La orientación del nodo ${nodoN} no está definida en orientacionesNodos.`);
      }
  
      // Retornodoar dimensiones según orientación
      return orient === "horizontal"
        ? { ancho: 20, alto: 12 }
        : { ancho: 12, alto: 20 };
    } else {
      // Buscar dimensiones del nivel en el array de niveles
      const nivelObj = niveles.find(nv => nv.value === nivel) ;
      return { ancho: nivelObj.ancho, alto: nivelObj.alto };
    }
  }

  // Calcula los puntos de inicio y fin del muro ajustados a los bordes de los nodos
  function calcularPuntosMuro(nodoA, nodoB, nodoClaveA, nodoClaveB, desplazamiento = 0) {
    // 1. Dimensiones de los nodos
    const dimsA = getDimensionesNodo(nodoClaveA); // dimensiones del nodo A
    const dimsB = getDimensionesNodo(nodoClaveB); // dimensiones del nodo B
  
    // 2. Determinar si el muro es horizontal o vertical
    console.log("nodoAY", nodoA.y, "nodoAX", nodoA.x, "nodoBY", nodoB.y, "nodoBX", nodoB.x);
    const esHorizontal = nodoA.y === nodoB.y; // Si las Y son iguales, es horizontal
    const esVertical = nodoA.x === nodoB.x;   // Si las X son iguales, es vertical
  
    // 3. Obtener radios de ajuste
    const [radioA, ejeA] = ajuste(nodoA, dimsA, esHorizontal);
    const [radioB, ejeB] = ajuste(nodoB, dimsB, esHorizontal);
  
    console.log("radioA", radioA, "radioB", radioB, "esHorizontal", esHorizontal, "esVertical", esVertical);
    // 4. Calcular puntos finales según la orientación
    let x1, y1, x2, y2;
  
    if (esHorizontal) {
      // Caso horizontal
      if(nodoA.x > nodoB.x) {
        //si el nodo A esta a la derecha se le resta el radio y al nodo B se le suma el radio
        x1 = nodoB.x + radioB; // Punto de inicio ajustado
        x2 = nodoA.x - radioA; // Punto de fin ajustado
      }else {   
        //si el nodo A esta a la izquierda se le suma el radio y al nodo B se le resta el radio
        x1 = nodoA.x + radioA; // Punto de inicio ajustado
        x2 = nodoB.x - radioB; // Punto de fin ajustado
      }

      // Ajustar los puntos Y según si están sobre el eje principal
      if(ejeA && ejeB) {
        //se verifica si ambos nodos estan sobre la margen
        if(nodoA.y === margen && nodoB.y === margen) {
          // se le suman 12 espacios alos Y
          y1 = nodoA.y + 12; // Punto de inicio ajustado
          y2 = nodoB.y + 12; // Punto de fin ajustado
        }else {
          //se les resta 12 espacios a los Y
          y1 = nodoA.y - 12; // Punto de inicio ajustado
          y2 = nodoB.y - 12; // Punto de fin ajustado
        }

      }else{
        y1 = nodoA.y;
        y2 = nodoB.y;
      }
      
    } else if (esVertical) {
      // Caso vertical
      //ajustar los puntos X según si están sobre el eje principal
      if(ejeA && ejeB) {
        //se verifica si ambos nodos estan sobre la margen
        if(nodoA.x === margen && nodoB.x === margen) {
          // se le suman 12 espacios alos X
          x1 = nodoA.x + 12; // Punto de inicio ajustado
          x2 = nodoB.x + 12; // Punto de fin ajustado
        }else {
          //se les resta 12 espacios a los X
          x1 = nodoA.x - 12; // Punto de inicio ajustado
          x2 = nodoB.x - 12; // Punto de fin ajustado
        }
      }else {
        x1 = nodoA.x;
        x2 = nodoB.x;
      }
      
      if(nodoA.y > nodoB.y) {
        //si el nodo A esta abajo se le resta el radio y al nodo B se le suma el radio
        y1 = nodoB.y + radioB; // Punto de inicio ajustado
        y2 = nodoA.y - radioA; // Punto de fin ajustado 
      }else {
        //si el nodo A esta arriba se le suma el radio y al nodo B se le resta el radio
        y1 = nodoA.y + radioA; // Punto de inicio ajustado
        y2 = nodoB.y - radioB; // Punto de fin ajustado
      }
    } else {
      throw new Error("Los nodos no están alineados horizontal ni verticalmente.");
    }
    console.log("Puntos ajustados:", { x1, y1, x2, y2 });
    // 5. Retornar las coordenadas ajustadas
    return { x1, y1, x2, y2 };
  }

  function comparteEjeOriginal(nodo) {
    const tol = 0.1;
    const enEjeX = Math.abs(nodo.y - margen) < tol || Math.abs(nodo.y - (margen + largo * escala)) < tol;
    const enEjeY = Math.abs(nodo.x - margen) < tol || Math.abs(nodo.x - (margen + ancho * escala)) < tol;
  
    return { enEjeX, enEjeY }; // Retorna un objeto indicando si está en el eje X o Y
  }

  function ajuste(nodo, dims,esHorizontal) {
    const Peri=comparteEjeOriginal(nodo)
    if (Peri.enEjeX && Peri.enEjeY) {
      console.log("ejes ambos originales");
      if(esHorizontal){
        console.log("el cota es horizontal ambos originales");
        return [dims.ancho * 2, true ]; // Ajuste por ancho en el perímetro
        
      }else{
        console.log("el cota es vertical ambos originales");
        return [dims.alto*2,true];// Ajuste por alto en el perímetro
      }
    } else if ((Peri.enEjeX && !Peri.enEjeY)|| (!Peri.enEjeX && Peri.enEjeY)) {
      console.log("eje originale y secundario");
      if (esHorizontal) {
        if(Peri.enEjeY) {
          console.log("la cota es horizontal, sobre eje original vertical");
          return [dims.ancho*2,true]; // Ajuste por ancho en el eje secundario horizontal
        }else{
          console.log("la cota es horizontal, sobre eje original horizontal");
          return [dims.ancho,true]; // Ajuste por alto en el eje secundario vertical
        }
      } else {
        if(Peri.enEjeY) {
          console.log("la cota es vertical, sobre eje original vertical");
          return [dims.alto,true]; // Ajuste por ancho en el eje secundario horizontal
        }else{
          console.log("la cota es vertical, sobre eje original horizontal");
          return [dims.alto*2,true]; // Ajuste por alto en el eje secundario vertical
        }
      }
    }else {
      if (esHorizontal) {
        return [dims.ancho, false]; // Ajuste por eje secundario horizontal
      } else {
        return [dims.alto, false]; // Ajuste por eje secundario vertical
      }
    }
  }

  // Calcula la cota libre entre dos nodos (igual que en PanelCotas)
  function calcularCotaLibre(nodoA, nodoB, nodoClaveA, nodoClaveB) {
    const dimsA = getDimensionesNodo(nodoClaveA);
    const dimsB = getDimensionesNodo(nodoClaveB);

    const distanciax = Math.abs(nodoA.x - nodoB.x);
    const distanciay = Math.abs(nodoA.y - nodoB.y);
    const esHorizontal = distanciax > distanciay;
    const distancia = (esHorizontal ? distanciax : distanciay) / escala;

    const ajusteA = ajuste(nodoA, dimsA,esHorizontal);
    const ajusteB = ajuste(nodoB, dimsB,esHorizontal);

    const libre = distancia - (ajusteA + ajusteB);
    return Math.round(libre);
  }

  // Saber si ambos nodos están sobre ejes principales
  function esSobreEjePrincipal(nodoA, nodoB) {
    const PerimetroA=comparteEjeOriginal(nodos[nodoA]);
    const PerimetroB=comparteEjeOriginal(nodos[nodoB]);
    //si las dos x de los nodes es verdadera, esta bobre eje principal
    if (PerimetroA.enEjeX && PerimetroB.enEjeX ) {
      return true; // Ambos nodos están sobre el eje X principal
    }else if (PerimetroA.enEjeY && PerimetroB.enEjeY) {
      return true; // Ambos nodos están sobre el eje Y principal
    }else{
      return false; // Al menos uno de los nodos no está sobre un eje principal
    }
  }

  // --- NUEVO: Manejo del submit del formulario ---
  function onSubmitAgregarMuro(e) {
    e.preventDefault();
    console.log("Tipo de muro:", tipoMuro);

    if (nodoA === nodoB) return;

    const cotaLibre = calcularCotaLibre(
      nodos[nodoA], nodos[nodoB], nodoA, nodoB
    );
    console.log("Cota libre:", cotaLibre);
    if (cotaLibre <= 0) {
      alert("La distancia libre entre los nodos debe ser mayor a 0 cm.");
      return;
    }
  
    const desplaz = esSobreEjePrincipal(nodoA, nodoB) ? 0 : desplazamiento;
    console.log("Desplazamiento:", desplaz);

    // Calcula los puntos ajustados del muro
    const { x1, y1, x2, y2 } = calcularPuntosMuro(
      nodos[nodoA],
      nodos[nodoB],
      nodoA,
      nodoB,
      desplaz
    );

    if (tipoMuro === "entero"){
       // Si es muro normal, sigue igual:
      setMuros([
        ...muros,
        {
          tipo: tipoMuro,
          nodoA,
          nodoB,
          desplazamiento: desplaz,
          cotaLibre,
          x1, y1, x2, y2 // puntos listos para dibujar
        },
      ]);
    }else if (tipoMuro === "ventana") {
      // Abre el editor especial para muro ventana
      setDatosPrevios({
        nodoA,
        nodoB,
        desplazamiento: desplaz,
        escala,
        margen,
        cotaLibre,
        altura,
        x1, y1, x2, y2 // puntos listos para dibujar
      });
      setMostrarEditorVentana(true);
      return;
    }else if (tipoMuro === "puerta") {
      // Abre el editor especial para muro puerta
      setDatosPrevios({
        nodoA,
        nodoB,
        desplazamiento: desplaz,
        escala,
        margen,
        cotaLibre,
        altura,
        x1, y1, x2, y2 // puntos listos para dibujar
      });
      setMostrarEditorPuerta(true);
      return;
    }else if (tipoMuro === "puertaventana") {
      // Abre el editor especial para muro puerta ventana
      setDatosPrevios({
        nodoA,
        nodoB,
        desplazamiento: desplaz,
        escala,
        margen,
        cotaLibre,
        altura,
        x1, y1, x2, y2 // puntos listos para dibujar
      });
      setMostrarEditorPuertaVentana(true);
      return;
    }
   
  }

  // --- NUEVO: Guardar muro ventana desde el editor ---
  function handleGuardarMuroVentana(datosMuroVentana) {
    console.log("Datos recibidos en PanelMuros:", datosMuroVentana);
  
    setMuros((prevMuros) => {
      const nuevosMuros = [...prevMuros, datosMuroVentana];
      console.log("Estado actualizado de muros:", nuevosMuros);
      return nuevosMuros;
    });
  
    setMostrarEditorVentana(false);
    setDatosPrevios(null);
  }

  // --- NUEVO: Función para puerta desde su editor ---
  function handleGuardarMuroPuerta(datosMuroPuerta) {
    console.log("Datos recibidos en PanelMuros:", datosMuroPuerta);
    setMuros((prevMuros) => {
      const nuevosMuros = [...prevMuros, datosMuroPuerta];
      console.log("Estado actualizado de muros:", nuevosMuros);
      return nuevosMuros;
    });
    setMostrarEditorPuerta(false);
    setDatosPrevios(null);
  }

  // --- NUEVO: Función para puerta ventana desde su editor ---
  function handleGuardarMuroPuertaVentana(datosMuroPuertaVentana) {
    console.log("Datos recibidos en PanelMuros:", datosMuroPuertaVentana);
    setMuros((prevMuros) => {
      const nuevosMuros = [...prevMuros, datosMuroPuertaVentana];
      console.log("Estado actualizado de muros:", nuevosMuros);
      return nuevosMuros;
    });
    setMostrarEditorPuertaVentana(false);
    setDatosPrevios(null);
  }


  function eliminodoarMuro(nodoClave) {
    setMuros(muros.filter((_, i) => i !== nodoClave));
  }

  return (
    <div style={{ marginodoBottom: 16, width: "100%" }}>
      <b>Agregar muro:</b>
      <form
        onSubmit={onSubmitAgregarMuro}
        style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
      >
        <label>
          Tipo:
          <select value={tipoMuro} onChange={e => setTipoMuro(e.target.value)}>
            {tiposMuros.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <label>
          Nodo A:
          <select value={nodoA} onChange={e => setNodoA(Number(e.target.value))}>
            {nodos.map((_, nodoClave) => (
              <option key={nodoClave} value={nodoClave}>{`N${nodoClave + 1}`}</option>
            ))}
          </select>
        </label>
        <label>
          Nodo B:
          <select value={nodoB} onChange={e => setNodoB(Number(e.target.value))}>
            {nodos.map((_, nodoClave) => (
              <option key={nodoClave} value={nodoClave}>{`N${nodoClave + 1}`}</option>
            ))}
          </select>
        </label>
        <button type="submit">Agregar muro</button>
      </form>
      {/* Editor de muro ventana */}
      {mostrarEditorVentana && (
        <MuroVentanaEditor
          visible={mostrarEditorVentana}
          onClose={() => setMostrarEditorVentana(false)}
          onSave={handleGuardarMuroVentana}
          {...datosPrevios}
          nodos={nodos}
          escala={escala}
          margen={margen}
          spacePressed={spacePressed} // Pasar spacePressed como prop
          isPanning={isPanning}       // Pasar isPanning como prop
          stageScale={stageScale}     // Pasar stageScale como prop
          handleWheel={handleWheel}   // Pasar handleWheel como prop
        />
      )}
      {/* Editor de muro puerta */}
      {mostrarEditorPuerta && (
        <MuroPuertaEditor
          visible={mostrarEditorPuerta}
          onClose={() => setMostrarEditorPuerta(false)}
          onSave={handleGuardarMuroPuerta}
          {...datosPrevios}
          nodos={nodos}
          escala={escala}
          margen={margen}
          spacePressed={spacePressed} // Pasar spacePressed como prop
          isPanning={isPanning}       // Pasar isPanning como prop
          stageScale={stageScale}     // Pasar stageScale como prop
          handleWheel={handleWheel}   // Pasar handleWheel como prop
        />
      )}
      {/* Editor de muro puerta ventana */}
      {mostrarEditorPuertaVentana && (
        <MuroPuertaVentanaEditor
          visible={mostrarEditorPuertaVentana}
          onClose={() => setMostrarEditorPuertaVentana(false)}
          onSave={handleGuardarMuroPuertaVentana}
          {...datosPrevios}
          nodos={nodos}
          escala={escala}
          margen={margen}
          spacePressed={spacePressed} // Pasar spacePressed como prop
          isPanning={isPanning}       // Pasar isPanning como prop
          stageScale={stageScale}     // Pasar stageScale como prop
          handleWheel={handleWheel}   // Pasar handleWheel como prop
        />
      )}
      <ul>
      {muros.map((m, i) => {
        const desplazar = esSobreEjePrincipal(m.nodoA, m.nodoB);
        return (
          <li key={i}>
            {m.tipo} de N{m.nodoA + 1} a N{m.nodoB + 1}
            {m.desplazamiento !== 0 && ` - Desplazado: ${m.desplazamiento} cm  `}
            
            {/* Mostrar opción de desplazamiento si no está sobre los ejes principales */}
            {!desplazar && (
                <label>
                  Mover:
                  <input
                    type="number"
                    value={m.desplazamiento}
                    onChange={(e) => {
                      const nuevoDesplazamiento = parseInt(e.target.value, 10) || 0;
                      const nuevosMuros = [...muros];
                      nuevosMuros[i].desplazamiento = nuevoDesplazamiento;

                      // Recalcular las coordenadas del muro según su orientación
                      const esHorizontal = nodos[m.nodoA].y === nodos[m.nodoB].y; // Verificar si el muro es horizontal
                      if (esHorizontal) {
                        // Si el muro es horizontal, el desplazamiento afecta las coordenadas Y
                        nuevosMuros[i].y1 = m.y1 + nuevoDesplazamiento;
                        nuevosMuros[i].y2 = m.y2 + nuevoDesplazamiento;
                      } else {
                        // Si el muro es vertical, el desplazamiento afecta las coordenadas X
                        nuevosMuros[i].x1 = m.x1 + nuevoDesplazamiento;
                        nuevosMuros[i].x2 = m.x2 + nuevoDesplazamiento;
                      }

                      setMuros(nuevosMuros); // Actualizar el estado de los muros
                    }}
                    style={{ marginLeft: 8, width: 80 }}
                  />
                </label>
            )}

            <button onClick={() => eliminodoarMuro(i)} style={{ marginLeft: 8 }}>Eliminar-Muro</button>
          </li>
        );
      })}
            </ul>
    </div>
  );
}