/**
 * Utilidades para la gestión de ejes y nodos en el proyecto de construcción
 * 
 * Este archivo contiene funciones puras que encapsulan la lógica crítica
 * para generar nodos a partir de ejes, validar posiciones, calcular dimensiones
 * y aplicar reglas específicas por nivel.
 */

/**
 * Genera nodos a partir de los ejes definidos, respetando las reglas de nivel
 * 
 * @param {Array} ejesSecundarios - Lista de ejes secundarios definidos
 * @param {string} nivel - Nivel actual del proyecto (ej: "1 de 1", "2 de 3")
 * @param {Array} niveles - Configuración de todos los niveles disponibles
 * @param {Object} orientacionesNodos - Orientaciones específicas de nodos por nivel
 * @param {number} escala - Escala de conversión de metros a píxeles
 * @param {number} margen - Margen del lienzo en píxeles
 * @param {number} ancho - Ancho del área de construcción en centímetros
 * @param {number} largo - Largo del área de construcción en centímetros
 * @returns {Array} Lista de nodos generados con sus propiedades
 */
export function generarNodosDesdeEjes(
    ejesSecundarios,
    nivel,
    niveles,
    orientacionesNodos,
    escala,
    margen,
    ancho,
    largo
  ) {
    // TODO: Reemplazar con la lógica real de generación de nodos
    // Esta es una implementación de ejemplo que debes sustituir
  
    const nodos = [];
  
    // Lógica para determinar tamaño de nodo según nivel
    let tamanoNodo;
    if (nivel === "1 de 1") {
      // Nivel especial con nodos de 20x12 cm
      tamanoNodo = { ancho: 20, alto: 12 };
    } else if (nivel.includes("de 2")) {
      // Nodos cuadrados de 20x20 cm
      tamanoNodo = { ancho: 20, alto: 20 };
    } else if (nivel.includes("de 3")) {
      // Nodos cuadrados de 30x30 cm
      tamanoNodo = { ancho: 30, alto: 30 };
    } else { 
      // Valor por defecto
      tamanoNodo = { ancho: 20, alto: 20 };
    }
  
    // Generar nodos en las intersecciones de ejes
    // Esta es una simplificación - reemplazar con la lógica real
    const ejesVerticales = ejesSecundarios.filter(e => e.orientacion === "V");
    const ejesHorizontales = ejesSecundarios.filter(e => e.orientacion === "H");
  
    ejesVerticales.forEach((ejeV, i) => {
      ejesHorizontales.forEach((ejeH, j) => {
        // Calcular posición en píxeles
        const x = margen + ejeV.coord * escala;
        const y = margen + ejeH.coord * escala;
  
        nodos.push({
          id: `nodo_${i}_${j}`,
          x,
          y,
          nivel,
          orientacion: orientacionesNodos[nivel] || "vertical",
          ancho: tamanoNodo.ancho,
          alto: tamanoNodo.alto,
          tipo: "columna"
        });
      });
    });
  
    // Agregar nodos de esquina si no existen
    const nodosEsquina = [
      { x: margen, y: margen }, // Superior izquierda
      { x: margen + ancho * escala, y: margen }, // Superior derecha
      { x: margen + ancho * escala, y: margen + largo * escala }, // Inferior derecha
      { x: margen, y: margen + largo * escala } // Inferior izquierda
    ];
  
    nodosEsquina.forEach((pos, index) => {
      // Verificar si ya existe un nodo en esta posición
      const existe = nodos.some(nodo => 
        Math.abs(nodo.x - pos.x) < 1 && Math.abs(nodo.y - pos.y) < 1
      );
  
      if (!existe) {
        nodos.push({
          id: `nodo_esquina_${index}`,
          x: pos.x,
          y: pos.y,
          nivel,
          orientacion: orientacionesNodos[nivel] || "vertical",
          ancho: tamanoNodo.ancho,
          alto: tamanoNodo.alto,
          tipo: "columna"
        });
      }
    });
  
    return nodos;
  }
  
  /**
   * Valida que los nodos estén dentro del área permitida
   * 
   * @param {Array} nodos - Lista de nodos a validar
   * @param {number} margen - Margen del lienzo
   * @param {number} ancho - Ancho del área de construcción
   * @param {number} largo - Largo del área de construcción
   * @param {number} escala - Escala de conversión
   * @returns {Object} Resultado de validación con nodos válidos e inválidos
   */
  export function validarNodosDentroArea(nodos, margen, ancho, largo, escala) {
    const maximoX = margen + ancho * escala;
    const maximoY = margen + largo * escala;
  
    const validos = [];
    const invalidos = [];
  
    nodos.forEach(nodo => {
      if (
        nodo.x >= margen && 
        nodo.x <= maximoX && 
        nodo.y >= margen && 
        nodo.y <= maximoY
      ) {
        validos.push(nodo);
      } else {
        invalidos.push(nodo);
      }
    });
  
    return {
      validos,
      invalidos,
      todosValidos: invalidos.length === 0
    };
  }
  
  /**
   * Calcula las anclas de muros según el nivel y orientación de nodos
   * 
   * @param {Object} nodo - Nodo para el cual calcular anclas
   * @param {string} nivel - Nivel del proyecto
   * @returns {Object} Dimensiones de ancla según nivel
   */
  export function calcularAnclasSegunNivel(nodo, nivel) {
    // TODO: Implementar lógica real de cálculo de anclas
    // Esta es una implementación de ejemplo
  
    if (nivel === "1 de 1") {
      return {
        anchoLibre: nodo.ancho - 12, // Considerando nodo de 20x12
        altoLibre: nodo.alto - 12
      };
    } else if (nivel.includes("de 2")) {
      return {
        anchoLibre: nodo.ancho - 20, // Nodo cuadrado 20x20
        altoLibre: nodo.alto - 20
      };
    } else if (nivel.includes("de 3")) {
      return {
        anchoLibre: nodo.ancho - 30, // Nodo cuadrado 30x30
        altoLibre: nodo.alto - 30
      };
    }
  
    // Valor por defecto
    return {
      anchoLibre: nodo.ancho - 20,
      altoLibre: nodo.alto - 20
    };
  }
  
  /**
   * Determina si un nodo puede cambiar de orientación
   * 
   * @param {string} nivel - Nivel del proyecto
   * @returns {boolean} Si se permite cambiar orientación
   */
  export function puedeCambiarOrientacion(nivel) {
    // Solo se permite en nivel "1 de 1"
    return nivel === "1 de 1";
  }
  
  /**
   * Normaliza coordenadas de un punto según escala y margen
   * 
   * @param {number} coord - Coordenada en centímetros
   * @param {number} escala - Escala de conversión
   * @param {number} margen - Margen del lienzo
   * @returns {number} Coordenada normalizada en píxeles
   */
  export function normalizarCoordenada(coord, escala, margen) {
    return margen + coord * escala;
  }
  
  /**
   * Convierte coordenada en píxeles a centímetros
   * 
   * @param {number} pixel - Coordenada en píxeles
   * @param {number} escala - Escala de conversión
   * @param {number} margen - Margen del lienzo
   * @returns {number} Coordenada en centímetros
   */
  export function convertirAPixeles(pixel, escala, margen) {
    return (pixel - margen) / escala;
  }