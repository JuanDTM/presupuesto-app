// CotizacionPDF.js
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
  muroInfo: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 25,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  muroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  muroDetails: {
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
 * similar al estilo de valorTotal
 */
const renderManoObra = (texto) => {
  if (!texto) return null;

  const lineas = String(texto).split(/\r?\n/);

  // Frases que deben ir en recuadro (case-insensitive)
  const frasesEnCaja = [
    'valor total materiales:',
    'si los flejes se compran y si se usa estuco listo valor total de obra:',
    'si los flejes se fabrican en la obra y si se usa estuco tradicional valor total de la obra:',
  ];

  const esFraseCaja = (linea) => {
    const l = linea.trim().toLowerCase();
    return frasesEnCaja.some((f) => l.startsWith(f));
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
 * Componente para generar el PDF de cotización simplificado
 */
export default function CotizacionPDF({ cotizacion, muroSeleccionado }) {
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatearTipoMuro = (tipo) => {
    const tipos = {
      entero: 'Muro Entero',
      ventana: 'Muro con Ventana',
      puerta: 'Muro con Puerta',
      puertaventana: 'Muro con Puerta y Ventana',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>COTIZACIÓN DE MANO DE OBRA</Text>
          <Text style={styles.subtitle}>
            Sistema de Presupuesto de Construcción
          </Text>
          <Text style={styles.date}>Fecha: {fechaActual}</Text>
        </View>

        {/* Información del Muro */}
        <View style={styles.muroInfo}>
          <Text style={styles.muroTitle}>
            Muro {muroSeleccionado?.index + 1} - {formatearTipoMuro(muroSeleccionado?.tipo)}
          </Text>
          <Text style={styles.muroDetails}>
            Nodos: N{muroSeleccionado?.nodoA + 1} → N{muroSeleccionado?.nodoB + 1}
          </Text>
          <Text style={styles.muroDetails}>
            Altura: {muroSeleccionado?.altura || 220} cm
          </Text>
          {muroSeleccionado?.desplazamiento && muroSeleccionado.desplazamiento !== 0 && (
            <Text style={styles.muroDetails}>
              Desplazamiento: {muroSeleccionado.desplazamiento} cm
            </Text>
          )}
        </View>

        {/* Mano de Obra */}
        {cotizacion?.mano_obra && (
          <View style={styles.manoObraSection}>
            <Text style={styles.sectionTitle}>MANO DE OBRA</Text>
            {renderManoObra(cotizacion.mano_obra)}
          </View>
        )}

        {/* Valor Total */}
        {cotizacion?.valor_total_mano_obra && (
          <View style={styles.valorTotal}>
            <Text style={styles.valorTotalText}>
              VALOR TOTAL MANO DE OBRA: ${cotizacion.valor_total_mano_obra.toLocaleString()}
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
