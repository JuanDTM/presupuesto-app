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
  sectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
    marginBottom: 4,
  },
  blockGapLarge: {
    marginTop: 18,
  },
  blockGapMedium: {
    marginTop: 10,
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
  valorResumen: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 10,
  },
  valorResumenLabel: {
    fontSize: 13,
    color: '#dc2626',
    marginBottom: 4,
  },
  valorResumenValue: {
    fontSize: 16,
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

const parseMoneyValue = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d.-]/g, '');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const formatCurrency = (value) => {
  const parsed = parseMoneyValue(value);
  if (parsed === null) return String(value ?? '-');
  return parsed.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const normalizeLine = (line) =>
  String(line || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

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

const splitSeccionesManoObra = (texto) => {
  if (!texto) {
    return {
      seccionManoObra: [],
      seccionMateriales: [],
      seccionAlternativa: [],
    };
  }

  const lineas = String(texto).split(/\r?\n/);

  const iMateriales = lineas.findIndex((linea) =>
    normalizeLine(linea).startsWith('cotizacion materiales')
  );
  const iDatoAdicional = lineas.findIndex((linea) =>
    normalizeLine(linea).startsWith('dato adicional y opcional')
  );
  const iAlternativo =
    iDatoAdicional >= 0
      ? iDatoAdicional
      : lineas.findIndex((linea) =>
          normalizeLine(linea).startsWith('si en algun momento no se compran los estribos')
        );

  const seccionManoObra = iMateriales >= 0 ? lineas.slice(0, iMateriales) : [...lineas];
  const seccionMateriales =
    iMateriales >= 0
      ? lineas.slice(iMateriales, iAlternativo >= 0 ? iAlternativo : lineas.length)
      : [];
  const seccionAlternativa = iAlternativo >= 0 ? lineas.slice(iAlternativo) : [];

  return {
    seccionManoObra,
    seccionMateriales,
    seccionAlternativa,
  };
};

const esTotalEmbebido = (linea) => {
  const l = normalizeLine(linea);
  return (
    l.startsWith('valor total mano de obra:') ||
    l.startsWith('valor total materiales:') ||
    l.startsWith('valor total materiales con fabricaciones en obra:') ||
    l.startsWith('valor total de la obra:')
  );
};

const renderSection = (lineasSeccion, keyPrefix, options = {}) =>
  lineasSeccion.map((linea, idx) => {
    const { ocultarTotalesEmbebidos = true } = options;
    const l = normalizeLine(linea);

    if (!l || (ocultarTotalesEmbebidos && esTotalEmbebido(linea))) {
      return null;
    }

    const esTitulo =
      l === 'cotizacion mano de obra' ||
      l === 'cotizacion materiales' ||
      l === 'lista de materiales' ||
      l === 'dato adicional y opcional';

    return (
      <Text
        key={`${keyPrefix}-${idx}`}
        style={esTitulo ? styles.sectionHeading : styles.manoObraText}
      >
        {resaltarPrecios(linea)}
      </Text>
    );
  });

const renderManoObraPrincipal = (texto) => {
  const { seccionManoObra, seccionMateriales } = splitSeccionesManoObra(texto);

  return (
    <>
      {renderSection(seccionManoObra, 'mano')}

      {seccionMateriales.length > 0 && (
        <View style={styles.blockGapLarge}>{renderSection(seccionMateriales, 'mat')}</View>
      )}
    </>
  );
};

const renderTextoAlternativo = (texto) => {
  const { seccionAlternativa } = splitSeccionesManoObra(texto);
  if (seccionAlternativa.length === 0) return null;

  return (
    <View style={styles.blockGapMedium}>
      {renderSection(seccionAlternativa, 'alt', { ocultarTotalesEmbebidos: false })}
    </View>
  );
};

/**
 * Renderiza el bloque de mano de obra y materiales principales
 */
const renderManoObra = (texto) => {
  if (!texto) return null;

  return (
    <>
      {renderManoObraPrincipal(texto)}
    </>
  );
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

  const totalManoObra = cotizacion?.valor_total_mano_obra;
  const totalMateriales = cotizacion?.Valor_total_Materiales;
  const totalObra = cotizacion?.Valor_total_obra_a_todo_costo;

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

        {(totalMateriales || totalManoObra) && (
          <View style={styles.valorResumen}>
            {totalMateriales && (
              <View>
                <Text style={styles.valorResumenLabel}>Valor total mano de obra: ${formatCurrency(totalManoObra)}</Text>
              </View>
            )}
            {totalManoObra && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.valorResumenLabel}>Valor total materiales: ${formatCurrency(totalMateriales)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Totales calculados desde campos estructurados de la API */}
        {totalObra && (
          <View style={styles.valorTotal}>
            <Text style={styles.valorTotalText}>
              VALOR TOTAL OBRA A TODO COSTO: ${formatCurrency(totalObra)}
            </Text>
          </View>
        )}

        {cotizacion?.mano_obra && renderTextoAlternativo(cotizacion.mano_obra)}

        

        {/* Footer */}
        <Text style={styles.footer}>
          Este documento fue generado automáticamente por el Sistema de Presupuesto de Construcción
        </Text>
      </Page>
    </Document>
  );
}
