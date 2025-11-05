// CotizacionPisoPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos simplificados para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pisoInfo: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 25,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  pisoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  pisoDetails: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  manoObraSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  manoObraText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
  },
  precioText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  // Recuadro para resaltar líneas específicas dentro de mano de obra
  resaltadoCaja: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#dc2626',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  resaltadoCajaTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  valorTotal: {
    backgroundColor: '#fef2f2',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#dc2626',
    marginTop: 25,
    textAlign: 'center',
  },
  valorTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  valoresContainer: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  valorItem: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  valorItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

/**
 * Función para resaltar precios en el texto de mano de obra
 */
const resaltarPrecios = (texto) => {
  // Buscar patrones de precios (números con $ o pesos)
  const patronPrecio = /(\$\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*pesos?)/gi;
  
  const partes = texto.split(patronPrecio);
  
  return partes.map((parte, index) => {
    if (patronPrecio.test(parte)) {
      return (
        <Text key={index} style={styles.precioText}>
          {parte}
        </Text>
      );
    }
    return parte;
  });
};

/**
 * Renderiza el bloque de mano de obra, colocando ciertas líneas en un recuadro
 */
const renderManoObra = (texto) => {
  if (!texto) return null;

  const lineas = String(texto).split(/\r?\n/);

  // Frases que deben ir en recuadro (case-insensitive)
  const frasesEnCaja = [
    'valor total materiales:',
    'valor total de la obra:',
    'valor total obra a todo costo:',
  ];

  const esFraseCaja = (linea) => {
    const l = linea.trim().toLowerCase();
    return frasesEnCaja.some((f) => l.includes(f));
  };

  return lineas.map((linea, idx) => {
    const contenido = resaltarPrecios(linea);
    if (esFraseCaja(linea)) {
      return (
        <View key={`caja-${idx}`} style={styles.resaltadoCaja}>
          <Text style={styles.resaltadoCajaTexto}>{contenido}</Text>
        </View>
      );
    }
    // Línea normal
    return (
      <Text key={`ln-${idx}`} style={styles.manoObraText}>
        {contenido}
      </Text>
    );
  });
};

/**
 * Función para formatear opciones de losa, mortero y enchape
 */
const formatearOpcion = (valor, tipo) => {
  if (tipo === 'losa') {
    const opciones = {
      0: 'Sin losa',
      1: 'Losa fina de 7cm',
      2: 'Losa normal de 8cm',
      3: 'Losa pobre de 10cm'
    };
    return opciones[valor] || 'No especificado';
  }
  if (tipo === 'mortero') {
    const opciones = {
      0: 'Sin mortero',
      1: 'Mortero de 3cm',
      2: 'Mortero de 5cm',
      3: 'Mortero de 7cm'
    };
    return opciones[valor] || 'No especificado';
  }
  if (tipo === 'enchape') {
    const opciones = {
      0: 'Sin enchape',
      1: 'Cerámica',
      2: 'Porcelanato'
    };
    return opciones[valor] || 'No especificado';
  }
  return 'No especificado';
};

/**
 * Componente para generar el PDF de cotización de piso
 */
export default function CotizacionPisoPDF({ cotizacion, params }) {
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calcular área en m²
  const areaM2 = ((params.largo * params.ancho) / 10000).toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>COTIZACIÓN DE PISO</Text>
          <Text style={styles.subtitle}>
            Sistema de Presupuesto de Construcción
          </Text>
          <Text style={styles.date}>Fecha: {fechaActual}</Text>
        </View>

        {/* Información del Piso */}
        <View style={styles.pisoInfo}>
          <Text style={styles.pisoTitle}>Información del Piso</Text>
          <Text style={styles.pisoDetails}>
            Largo: {params.largo} cm
          </Text>
          <Text style={styles.pisoDetails}>
            Ancho: {params.ancho} cm
          </Text>
          <Text style={styles.pisoDetails}>
            Área: {areaM2} m²
          </Text>
          <Text style={styles.pisoDetails}>
            Losa: {formatearOpcion(params.losa, 'losa')}
          </Text>
          <Text style={styles.pisoDetails}>
            Mortero: {formatearOpcion(params.mortero, 'mortero')}
          </Text>
          <Text style={styles.pisoDetails}>
            Enchape: {formatearOpcion(params.enchape, 'enchape')}
          </Text>
        </View>

        {/* Mano de Obra y Materiales */}
        {cotizacion?.mano_obra && (
          <View style={styles.manoObraSection}>
            <Text style={styles.sectionTitle}>MANO DE OBRA Y MATERIALES</Text>
            {renderManoObra(cotizacion.mano_obra)}
          </View>
        )}

        {/* Valores Totales */}
        <View style={styles.valoresContainer}>
          {cotizacion?.valor_total_mano_obra && (
            <View style={styles.valorItem}>
              <Text style={styles.valorItemText}>
                Valor Total Mano de Obra: ${cotizacion.valor_total_mano_obra}
              </Text>
            </View>
          )}
          {cotizacion?.Valor_total_Materiales && (
            <View style={styles.valorItem}>
              <Text style={styles.valorItemText}>
                Valor Total Materiales: ${cotizacion.Valor_total_Materiales}
              </Text>
            </View>
          )}
        </View>

        {/* Valor Total de la Obra */}
        {cotizacion?.Valor_total_obra_a_todo_costo && (
          <View style={styles.valorTotal}>
            <Text style={styles.valorTotalText}>
              VALOR TOTAL DE LA OBRA: ${cotizacion.Valor_total_obra_a_todo_costo}
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Este documento fue generado automáticamente por el Sistema de Presupuesto de Construcción
        </Text>
      </Page>
    </Document>
  );
}

