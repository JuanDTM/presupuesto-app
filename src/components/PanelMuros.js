// PanelMuros.js
import React, { useState } from "react";

//tipo de muros
const tiposMuros = [
  { value: "entero", label: "Muro entero" },
  { value: "ventanodoa", label: "Muro ventanodoa" },
  { value: "puerta", label: "Muro puerta" },
  { value: "puertaventanodoa", label: "Muro puertaventanodoa" },
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
  ejesH
}) {
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
  function calcularPuntosMuro(nodoA, nodoB, nodoClaveA, nodoClaveB) {
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
    const tol = 1; // tolerancia para considerar que un nodo está sobre un eje
    console.log("nodoAx", nodos[nodoA].x, "nodoAy", nodos[nodoA].y, "margen", margen, "ancho", ancho, "largo", largo, "escala", escala);
    const esPrincipal = nodo => {
      const cercaMargenIzquierdo = Math.abs(nodo.x - margen) <= tol;
      const cercaMargenDerecho = Math.abs(nodo.x - (margen + ancho * escala)) <= tol;
      const cercaMargenSuperior = Math.abs(nodo.y - margen) <= tol;
      const cercaMargenInferior = Math.abs(nodo.y - (margen + largo * escala)) <= tol;
    
      console.log("Cerca del margen izquierdo:", cercaMargenIzquierdo);
      console.log("Cerca del margen derecho:", cercaMargenDerecho);
      console.log("Cerca del margen superior:", cercaMargenSuperior);
      console.log("Cerca del margen inferior:", cercaMargenInferior);
    
      return (
        (cercaMargenIzquierdo || cercaMargenDerecho) &&
        (cercaMargenSuperior || cercaMargenInferior)
      );
    };
    return esPrincipal(nodos[nodoA]) && esPrincipal(nodos[nodoB]);
  }

  function agregarMuro() {
    if (nodoA === nodoB) return;

    const cotaLibre = calcularCotaLibre(
      nodos[nodoA], nodos[nodoB], nodoA, nodoB
    );

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
      nodoB
     // desplaz
    );

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
  }

  function eliminodoarMuro(nodoClave) {
    setMuros(muros.filter((_, i) => i !== nodoClave));
  }

  const mostrarDesplazamiento = !esSobreEjePrincipal(nodoA, nodoB);

  return (
    <div style={{ marginodoBottom: 16, width: "100%" }}>
      <b>Agregar muro:</b>
      <form
        onSubmit={e => {
          e.preventDefault();
          agregarMuro();
        }}
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
        {mostrarDesplazamiento && (
          <label>
            Desplazamiento:
            <input
              type="number"
              value={desplazamiento}
              onChange={e => setDesplazamiento(Number(e.target.value))}
              style={{ width: 60 }}
            />
          </label>
        )}
        <button type="submit">Agregar muro</button>
      </form>
      <ul>
        {muros.map((m, i) => (
          <li key={i}>
            {m.tipo} de N{m.nodoA + 1} a N{m.nodoB + 1} (ancho libre: {m.cotaLibre} cm)
            {m.desplazamiento !== 0 && ` - Desplazado: ${m.desplazamiento} cm`}
            <button onClick={() => eliminodoarMuro(i)} style={{ marginLeft: 8 }}>Eliminodoar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}