import React, { useState, useEffect } from "react";
const ladosSuplementos = [
    {valor:"izquierdo", etiqueta:"Lado Izquierdo"}, 
    {valor:"derecho", etiqueta:"Lado Derecho"}, 
    {valor:"superior", etiqueta:"Lado Superior"}, 
    {valor:"inferior", etiqueta:"Lado Inferior"}];

const tipo = [
    {valor:"volado", etiqueta:"Volado"},
    {valor:"corredor", etiqueta:"Corredor"},
]

export default function PanelSuplemento({
    nodos = [],
    suplementos = [],
    setSuplementos,
    ejesTerciarios = [],
    setEjesTerciarios,
    ejeIzquierdo = {},
    ejeSuperior = {},
    ejeDerecho = {},
    ejeInferior = {},
    escala,
    nivel
    })
    {
    
        const [nodoA, setNodoA] = useState(0);
        const [nodoB, setNodoB] = useState(1);
        const [ladoSuplemento, setLadoSuplemento] = useState("superior"); // Lado del suplemento, por defecto derecho, se puede cambiar según el diseño
        const [distancia, setDistancia] = useState(0); // Distancia del volado en cm
        const [tipoSuplemento, setTipoSuplemento] = useState("volado"); // Tipo de suplemento, por defecto volado

        //filtrar los nodos que esten en el eje principal elegido en ladoSuplemento
        const nodosLado = ()=> {
            if (ladoSuplemento === "izquierdo") {
                console.log("nodosLado izquierdo", ejeIzquierdo);
            return nodos.filter(nodo => nodo.x === ejeIzquierdo.x1);
            } else if (ladoSuplemento === "derecho") {
                console.log("nodosLado derecho", ejeDerecho);
            return nodos.filter(nodo => nodo.x === ejeDerecho.x1);
            } else if (ladoSuplemento === "superior") {
                console.log("nodosLado superior", ejeSuperior);
            return nodos.filter(nodo => nodo.y === ejeSuperior.y1);
            } else if (ladoSuplemento === "inferior") {
                console.log("nodosLado inferior", ejeInferior);
            return nodos.filter(nodo => nodo.y === ejeInferior.y1);
            }
        }
        
        //calcular coordenadas de ejec terciarios
        const calcularEjesTerciarios = (nodoAObj, nodoBObj, nodosIntermedios) => {
            const distanciaCm = distancia * escala; // Convertir a unidades del canvas
            const ejes = [];
            let xPrincipal, yPrincipal;
        
            // Calcular la posición base según el lado del suplemento
            if (ladoSuplemento === "izquierdo" || ladoSuplemento === "derecho") {
                xPrincipal = ladoSuplemento === "izquierdo" ? nodoAObj.x - distanciaCm : nodoAObj.x + distanciaCm;
        
                // Ejes principales
                ejes.push(
                    { x1: xPrincipal, y1: nodoAObj.y, x2: xPrincipal, y2: nodoBObj.y, coordenada:"paralela"}, // Eje vertical principal
                    { x1: nodoAObj.x, y1: nodoAObj.y, x2: xPrincipal, y2: nodoAObj.y, coordenada:"transversal" }, // Eje horizontal superior
                    { x1: nodoBObj.x, y1: nodoBObj.y, x2: xPrincipal, y2: nodoBObj.y, coordenada:"transversal"}  // Eje horizontal inferior
                );
        
                // Ejes intermedios
                nodosIntermedios.forEach(nodo => {
                    ejes.push({ x1: nodo.x, y1: nodo.y, x2: xPrincipal, y2: nodo.y, coordenada:"transversal" });
                });
            } else if (ladoSuplemento === "superior" || ladoSuplemento === "inferior") {
                yPrincipal = ladoSuplemento === "superior" ? nodoAObj.y - distanciaCm : nodoAObj.y + distanciaCm;
        
                // Ejes principales
                ejes.push(
                    { x1: nodoAObj.x, y1: yPrincipal, x2: nodoBObj.x, y2: yPrincipal, coordenada:"paralela" }, // Eje horizontal principal
                    { x1: nodoAObj.x, y1: nodoAObj.y, x2: nodoAObj.x, y2: yPrincipal, coordenada:"transversal" }, // Eje vertical izquierdo
                    { x1: nodoBObj.x, y1: nodoBObj.y, x2: nodoBObj.x, y2: yPrincipal, coordenada:"transversal" }  // Eje vertical derecho
                );
        
                // Ejes intermedios
                nodosIntermedios.forEach(nodo => {
                    ejes.push({ x1: nodo.x, y1: nodo.y, x2: nodo.x, y2: yPrincipal, coordenada:"transversal" });
                });
            }
        
            return ejes;
        };

        //hallar las coordenadas de 
        function AgregarSuplemento(e) {
            e.preventDefault(); // Evita el envío del formulario y recarga de la página
            if (nodoA === nodoB) return;  // Evita agregar cotas entre el mismo nodo
        
            // Obtener los nodos A y B
            const nodoAObj = nodos[nodoA];
            const nodoBObj = nodos[nodoB];
        
            // Con respecto al lado del suplemento, hallar posibles nodos intermedios entre los nodos seleccionados
            let nodosIntermedios = [];
            if (ladoSuplemento === "superior" || ladoSuplemento === "inferior") {
                // Buscar nodos con la misma coordenada `y` y entre las coordenadas `x` de los nodos seleccionados
                nodosIntermedios = nodos.filter(nodo =>
                    nodo.y === nodoAObj.y && // Misma coordenada `y`
                    nodo.x > Math.min(nodoAObj.x, nodoBObj.x) && // Entre las coordenadas `x`
                    nodo.x < Math.max(nodoAObj.x, nodoBObj.x)
                );
            } else if (ladoSuplemento === "izquierdo" || ladoSuplemento === "derecho") {
                // Buscar nodos con la misma coordenada `x` y entre las coordenadas `y` de los nodos seleccionados
                nodosIntermedios = nodos.filter(nodo =>
                    nodo.x === nodoAObj.x && // Misma coordenada `x`
                    nodo.y > Math.min(nodoAObj.y, nodoBObj.y) && // Entre las coordenadas `y`
                    nodo.y < Math.max(nodoAObj.y, nodoBObj.y)
                );
            }
            
            console.log("Nodos intermedios:", nodosIntermedios);
            // Calcular ejes terciarios
            const ejes = calcularEjesTerciarios(nodoAObj, nodoBObj, nodosIntermedios);
            console.log("Ejes terciarios:", ejes);
            // Agregar los ejes terciarios al estado
            setEjesTerciarios(prevEjes => [...prevEjes, ...ejes]);
        
            // Guardar suplemento con los datos necesarios, anexamos los ejes terciarios, distancia, tipo y lado
            setSuplementos([
                ...suplementos,
                {
                    nodoA: nodoAObj,
                    nodoB: nodoBObj,
                    distancia: distancia,
                    tipo: tipoSuplemento,
                    lado: ladoSuplemento,
                    ejesTerciarios: ejes
                }
            ]);
        }

        // Función para eliminar un suplemento con ejes terciarios
        const eliminarSuplemento = (index) => {
            // Validar que el suplemento existe
            if (!suplementos[index]) {
                console.error(`El suplemento en el índice ${index} no existe.`);
                return;
            }
        
            // Obtener los ejes terciarios asociados al suplemento
            const ejesAsociados = suplementos[index].ejesTerciarios || [];
        
            // Validar que ejesTerciarios está definido
            if (!Array.isArray(ejesTerciarios)) {
                console.error("El estado ejesTerciarios no es un arreglo o está indefinido.");
                return;
            }
        
            // Eliminar el suplemento del estado
            setSuplementos(suplementos.filter((_, i) => i !== index));
        
            // Eliminar los ejes terciarios asociados al suplemento
            setEjesTerciarios(ejesTerciarios.filter(eje => !ejesAsociados.includes(eje)));
        };

        useEffect(() => {
            // Cuando cambie el lado, resetea los nodos seleccionados a los dos primeros del nuevo lado
            setNodoA(0);
            setNodoB(1);
          }, [ladoSuplemento, nodos.length]);

        if (nivel==="1 de 1" || nivel==="1 de 2" || nivel === "1 de 3") return null; //solo mostrar en nivel 2 o 3
        return(
            <div style={{ marginBottom: 16 }}>
            <b>Agregar Suplemento:</b>
            <form
                onSubmit={AgregarSuplemento}
                style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
            >
                <label>
                Tipo de suplemento:
                <select value={tipoSuplemento} onChange={e => setTipoSuplemento(e.target.value)}>
                    {tipo.map(t => (
                    <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                    ))}
                </select>
                </label>
                <label>
                Lado del perimetro:
                <select value={ladoSuplemento} onChange={e => setLadoSuplemento(e.target.value)}>
                    {ladosSuplementos.map(t => (
                    <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                    ))}
                </select>
                </label>
                <label>
                Nodo A:
                <select value={nodoA} onChange={e => setNodoA(Number(e.target.value))}>
                    {nodosLado().map((nodo) => {
                    const globalIdx = nodos.findIndex(
                        n => Math.abs(n.x - nodo.x) < 1 && Math.abs(n.y - nodo.y) < 1
                    );
                    return (
                        <option key={globalIdx} value={globalIdx} disabled={globalIdx === nodoB}>
                        {`N${globalIdx + 1}`}
                        </option>
                    );
                    })}
                </select>
                </label>
                <label>
                Nodo B:
                <select value={nodoB} onChange={e => setNodoB(Number(e.target.value))}>
                    {nodosLado().map((nodo) => {
                    const globalIdx = nodos.findIndex(
                        n => Math.abs(n.x - nodo.x) < 1 && Math.abs(n.y - nodo.y) < 1
                    );
                    return (
                        <option key={globalIdx} value={globalIdx} disabled={globalIdx === nodoA}>
                        {`N${globalIdx + 1}`}
                        </option>
                    );
                    })}
                </select>
                </label>
                <label>
                distancia (cm):
                <input
                    type="number"
                    value={distancia}
                    min={0}
                    max={100}
                    onChange={e => setDistancia(Number(e.target.value))}
                    style={{ width: 80 }} 
                />
                </label>
                <button type="submit">Agregar Suplemento</button>
            </form>
            <ul>
            { suplementos.map((suplemento, index) => (
                    <li key={index}>
                        <b>Suplemento {index + 1}:</b> 
                        {` Tipo: ${suplemento.tipo}, Lado: ${suplemento.lado}, Nodos: N${nodos.findIndex(n => n.x === suplemento.nodoA.x && n.y === suplemento.nodoA.y) + 1} - N${nodos.findIndex(n => n.x === suplemento.nodoB.x && n.y === suplemento.nodoB.y) + 1}, Distancia: ${suplemento.distancia} cm`}
                        <button onClick={() => eliminarSuplemento(index)} style={{ marginLeft: 8 }}>Eliminar-Suplemento</button>
                    </li>
                )) }
            </ul>
            </div>
        );
}