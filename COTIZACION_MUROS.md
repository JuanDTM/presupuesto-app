# Sistema de Cotización de Muros

## Descripción General

Este sistema permite cotizar muros creados en el editor visual enviando los datos al endpoint de backend para obtener una estimación de materiales y mano de obra.

## Componentes Creados

### 1. `CotizadorMuros.js`
Componente principal que maneja todo el flujo de cotización.

**Ubicación:** `src/components/CotizadorMuros.js`

**Props que recibe:**
- `muros`: Array de muros creados en el sistema
- `altura`: Altura del muro en cm
- `nivel`: Nivel actual (1 de 1, 1 de 2, etc.)

**Funcionalidades:**
- Lista todos los muros creados con botón "Cotizar"
- Modal con parámetros de construcción configurables
- Transformación de datos del formato frontend al formato backend
- Envío de petición al endpoint
- Visualización de resultados (materiales y mano de obra)

### 2. Funciones en `httpClient.js`

**`httpClient.post(path, body, options)`**
Método de conveniencia para hacer peticiones POST a la API.

**Parámetros:**
- `path`: Ruta del endpoint (ejemplo: `/cotizacion-muro`)
- `body`: Objeto con los datos a enviar
- `options`: Opciones adicionales (opcional)

**Ejemplo:**
```javascript
const response = await httpClient.post('/cotizacion-muro', payload);
```

**Nota:** Como la URL base ya está configurada en `api_urls.js` como `http://174.129.83.62/api`, solo necesitamos pasar la ruta relativa.

## Mapeo de Datos

### Del Frontend al Backend

#### Muro Entero
```javascript
// Frontend
{
  tipo: "entero",
  nodoA: 0,
  nodoB: 1,
  x1, y1, x2, y2
}

// Backend
{
  muro: {
    tipo: "muroEntero",
    piso: "1 de 1",
    ancho_estructura: 490,
    ancho: 450,
    alto: 220,
    medida1: 0,
    medida2: 0,
    medida3: 0,
    ventana: null
  }
}
```

#### Muro con Puerta
```javascript
// Frontend
{
  tipo: "puerta",
  anchoPuerta: 100,
  muro1: 80,
  muro2: 60
}

// Backend
{
  muro: {
    tipo: "muroPuerta",
    medida1: 80,  // muro1
    medida2: 100, // anchoPuerta
    medida3: 60,  // muro2
    ventana: null
  }
}
```

#### Muro con Ventana
```javascript
// Frontend
{
  tipo: "ventana",
  anchoVentana: 120,
  altoVentana: 110,
  muro1: 60,
  muro2: 0,
  muro3: 60
}

// Backend
{
  muro: {
    tipo: "muroVentana",
    medida1: 60,
    medida2: 0,
    medida3: 60,
    ventana: {
      tipo: "ventana",
      ancho: 120,
      alto: 110,
      ubicacion: "centro"
    }
  }
}
```

#### Muro con Puerta y Ventana
```javascript
// Frontend
{
  tipo: "puertaventana",
  anchoPuerta: 100,
  anchoVentana: 150,
  altoVentana: 120,
  muro1: 50,
  muro2: 50
}

// Backend
{
  muro: {
    tipo: "muroPuertaVentana",
    medida1: 50,
    medida2: 100, // anchoPuerta
    medida3: 50,
    ventana: {
      tipo: "ventana",
      ancho: 150,
      alto: 120,
      ubicacion: "centro"
    }
  }
}
```

## Parámetros de Construcción

### Parámetros Configurables en el Modal

| Parámetro | Valores | Descripción |
|-----------|---------|-------------|
| `cinta_corona` | 0, 1 | Cinta de amarre superior |
| `viga_cimiento` | 0, 1 | Cimiento para soportar peso |
| `cinta_lateral` | 0, 1, 2 | Cintas laterales (0: ninguna, 1: un lado, 2: ambos) |
| `pañete` | 0, 1, 2 | Pañete (0: sin, 1: una cara, 2: ambas caras) |
| `estuco` | 0, 1, 2 | Estuco (0: sin, 1: una cara, 2: ambas caras) |
| `pintura` | 0, 1, 2 | Pintura (0: sin, 1: una cara, 2: ambas caras) |
| `textura` | 0, 1, 2 | Textura (0: sin, 1: una cara, 2: ambas caras) |
| `acabados_externos` | 0, 1 | Acabados en el exterior |
| `mamposteria` | 0, 1 | Pega de ladrillo |
| `ladrillo` | 1, 4, 6 | Tipo de ladrillo (1: farol 10x20x30, 4: farol 12x20x30, 6: tolete 10x6x20) |
| `tipo` | 0, 1, 2, 3 | Resistencia (0: muy bajo, 1: bajo, 2: medio, 3: alto) |
| `clase` | 0, 1, 2 | Clase de viga (0: sin carga, 1: normal, 2: central) |
| `estructura` | 0, 1 | Si es muro estructural |

### Valores por Defecto
```javascript
{
  cinta_corona: 1,
  viga_cimiento: 1,
  cinta_lateral: 1,
  pañete: 2,
  estuco: 2,
  pintura: 2,
  textura: 0,
  acabados_externos: 1,
  mamposteria: 1,
  ladrillo: 4,
  tipo: 2,
  clase: 1,
  estructura: 1
}
```

## Uso del Sistema

### 1. Crear Muros
- Usa el editor visual para crear muros entre nodos
- Configura tipo de muro (entero, ventana, puerta, o combinado)
- Define dimensiones según el tipo

### 2. Cotizar un Muro
- En el panel "Cotizador de Muros", verás la lista de muros creados
- Click en el botón "Cotizar" del muro deseado
- Se abre un modal con los parámetros de construcción

### 3. Configurar Parámetros
- Ajusta los parámetros según los requerimientos del proyecto
- Los valores por defecto son configuraciones estándar

### 4. Obtener Cotización
- Click en "Obtener Cotización"
- El sistema envía los datos al backend
- Recibe y muestra:
  - Lista de materiales necesarios
  - Detalle de mano de obra
  - Valor total

## Respuesta del Backend

### Estructura de la Respuesta
```json
{
  "materiales": {
    "hierro_5/8": 0,
    "hierro_3/8": 2.07,
    "cemento": 5.51125,
    "ladrillo": 90,
    "galon_pintura": {
      "pintura_estucolisto": 1,
      "pintura_tradicional": 1
    }
  },
  "mano_obra": "COTIZACION MANO DE OBRA...",
  "valor_total_mano_obra": "1,054,916.34"
}
```

### Materiales Incluidos
- Hierros de diferentes calibres
- Estribos y bastones
- Alambre y flejes
- Concreto y cemento
- Arena gruesa y media
- Gravilla (valastro)
- Ladrillos
- Estuco, caolín, yeso
- Pintura (galones)
- Lija, rodillo, brocha
- Textura (cuñetes)

### Mano de Obra
Incluye desglose por actividad:
- Armada de hierro y formaleta
- Fundida de cintas y vigas
- Levantamiento de muro
- Pañete
- Estuco
- Valor total en pesos colombianos

## Notas Técnicas

### Cálculo del Ancho
- `ancho`: Distancia libre calculada entre nodos (usando coordenadas x1,y1,x2,y2)
- `ancho_estructura`: Ancho libre + 40cm (aproximación para incluir columnas)

### Manejo de Errores
- Validación de datos antes de enviar
- Captura de errores de red
- Mensajes de error descriptivos
- Estado de carga durante la petición

### Configuración de API
El sistema utiliza la misma URL base configurada en `src/config/api_urls.js` para todas las peticiones, por lo que no debería haber problemas de CORS si las demás funcionalidades de autenticación ya funcionan correctamente.

## Próximas Mejoras

1. **Exportación de PDF**: Generar PDF con la cotización
2. **Historial**: Guardar cotizaciones previas
3. **Comparación**: Comparar diferentes configuraciones
4. **Plantillas**: Guardar configuraciones frecuentes de parámetros
5. **Cotización múltiple**: Cotizar varios muros a la vez
6. **Cálculo automático**: Sugerir parámetros según el tipo de construcción

## Troubleshooting

### Error: "Debe seleccionar un muro para cotizar"
- Verifica que hayas clickeado el botón "Cotizar" de un muro específico

### Error de red
- Verifica que el servidor esté disponible en `http://174.129.83.62/api`
- Revisa la consola del navegador para más detalles
- Si las funciones de autenticación funcionan, la cotización también debería funcionar (usan la misma URL base)

### Datos incorrectos en la respuesta
- Revisa el payload enviado en la consola
- Compara con los ejemplos de la documentación del backend
- Verifica que las medidas del muro sean correctas


