// CotizacionPisoPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  const patronPrecio = /(\$\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*pesos?)/gi;
  const partes = texto.split(patronPrecio);

  return partes.map((parte, index) => {
    patronPrecio.lastIndex = 0;
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

const renderManoObra = (texto) => {
  if (!texto) return null;

  const lineas = String(texto).split(/\r?\n/);

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

const formatearOpcion = (valor, tipo) => {
  const numero = Number(valor);

  if (tipo === 'losa') {
    const opciones = {
      0: 'Sin losa',
      1: 'Losa fina de 7cm',
      2: 'Losa normal de 8cm',
      3: 'Losa pobre de 10cm'
    };
    return opciones[numero] || 'No especificado';
  }
  if (tipo === 'mortero') {
    const opciones = {
      0: 'Sin mortero',
      1: 'Mortero de 3cm',
      2: 'Mortero de 5cm',
      3: 'Mortero de 7cm'
    };
    return opciones[numero] || 'No especificado';
  }
  if (tipo === 'enchape') {
    const opciones = {
      0: 'Sin enchape',
      1: 'Cerámica',
      2: 'Porcelanato'
    };
    return opciones[numero] || 'No especificado';
  }
  return 'No especificado';
};

const toCurrency = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return valor ?? '-';
  }
  return numero.toLocaleString('es-CO');
};

export default function CotizacionPisoPDF({ cotizacion, params }) {
  const largo = Number(params?.largo || 0);
  const ancho = Number(params?.ancho || 0);
  const areas = Array.isArray(params?.areas) ? params.areas : [];
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const areaM2 =
    largo > 0 && ancho > 0 ? ((largo * ancho) / 10000).toFixed(2) : null;

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
            Largo: {largo || 'N/A'} cm
          </Text>
          <Text style={styles.pisoDetails}>
            Ancho: {ancho || 'N/A'} cm
          </Text>
          {areaM2 && (
            <Text style={styles.pisoDetails}>
              Área estimada: {areaM2} m²
            </Text>
          )}
          <Text style={styles.pisoDetails}>
            Losa: {formatearOpcion(params.losa, 'losa')}
          </Text>
          <Text style={styles.pisoDetails}>
            Mortero: {formatearOpcion(params.mortero, 'mortero')}
          </Text>
          <Text style={styles.pisoDetails}>
            Enchape: {formatearOpcion(params.enchape, 'enchape')}
          </Text>
          <Text style={styles.pisoDetails}>
            Remodelación: {params?.remodelacion ? 'Sí' : 'No'}
          </Text>
          {areas.length > 0 && (
            <Text style={[styles.pisoDetails, { marginTop: 8, fontWeight: 'bold' }]}>
              Áreas internas:
            </Text>
          )}
          {areas.map((area, index) => (
            <Text key={`area-${index}`} style={styles.pisoDetails}>
              Área #{index + 1}: {Number(area.largo) || 0} cm × {Number(area.ancho) || 0} cm
            </Text>
          ))}
        </View>

        {/* Mano de Obra y Materiales */}
        {cotizacion?.mano_obra && (
          <View style={styles.manoObraSection}>
            <Text style={styles.sectionTitle}>MANO DE OBRA Y MATERIALES</Text>
            {renderManoObra(cotizacion.mano_obra)}
          </View>
        )}

        {/* Valores Totales */}
        {(cotizacion?.valor_total_mano_obra ||
          cotizacion?.Valor_total_Materiales) && (
          <View style={styles.manoObraSection}>
            <Text style={styles.sectionTitle}>RESUMEN FINANCIERO</Text>
            {cotizacion?.valor_total_mano_obra && (
              <Text style={styles.manoObraText}>
                Valor Total Mano de Obra: ${toCurrency(cotizacion.valor_total_mano_obra)}
              </Text>
            )}
            {cotizacion?.Valor_total_Materiales && (
              <Text style={styles.manoObraText}>
                Valor Total Materiales: ${toCurrency(cotizacion.Valor_total_Materiales)}
              </Text>
            )}
          </View>
        )}

        {cotizacion?.Valor_total_obra_a_todo_costo && (
          <View style={styles.valorTotal}>
            <Text style={styles.valorTotalText}>
              VALOR TOTAL DE LA OBRA: $
              {toCurrency(cotizacion.Valor_total_obra_a_todo_costo)}
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

