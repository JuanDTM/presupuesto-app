import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    borderBottomStyle: "solid",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: "#9ca3af",
  },
  card: {
    backgroundColor: "#f8fafc",
    padding: 15,
    marginBottom: 25,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 4,
  },
  list: {
    marginTop: 8,
    paddingLeft: 14,
  },
  listItem: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
    textAlign: "center",
  },
  manoObraText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 1.6,
    fontFamily: "Helvetica",
  },
  precioText: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  resaltadoCaja: {
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#dc2626",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  resaltadoCajaTexto: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#dc2626",
  },
  valorTotal: {
    backgroundColor: "#fef2f2",
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#dc2626",
    marginTop: 25,
    textAlign: "center",
  },
  valorTotalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
});

const resaltarPrecios = (texto) => {
  const patronPrecio = /(\$\s*\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*pesos?)/gi;
  const partes = texto.split(patronPrecio);

  return partes.map((parte, index) => {
    patronPrecio.lastIndex = 0;
    if (patronPrecio.test(parte)) {
      return (
        <Text key={`precio-${index}`} style={styles.precioText}>
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
    "valor total materiales:",
    "valor total de la obra:",
    "valor total obra a todo costo:",
  ];

  const esFraseCaja = (linea) => {
    const contenido = linea.trim().toLowerCase();
    return frasesEnCaja.some((frase) => contenido.includes(frase));
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

    return (
      <Text key={`linea-${idx}`} style={styles.manoObraText}>
        {contenido}
      </Text>
    );
  });
};

const toCurrency = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return valor ?? "-";
  }
  return numero.toLocaleString("es-CO");
};

const tipoColumnaNombre = (tipo) => {
  if (tipo === 1) return "Columna de esquina";
  if (tipo === 2) return "Columna lateral";
  if (tipo === 3) return "Columna central";
  return "Columna";
};

export default function CotizacionCimientosPDF({ cotizacion, params }) {
  const fechaActual = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const columnas = Array.isArray(params?.columnas) ? params.columnas : [];
  const resistenciaTerreno = Array.isArray(params?.resistencia_terreno)
    ? params.resistencia_terreno
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>COTIZACIÓN DE CIMIENTOS</Text>
          <Text style={styles.subtitle}>Sistema de Presupuesto de Construcción</Text>
          <Text style={styles.date}>Fecha: {fechaActual}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos generales</Text>
          <Text style={styles.cardText}>Nivel de construcción: {params?.piso || "-"}</Text>
          <Text style={styles.cardText}>Cantidad de columnas: {columnas.length}</Text>
        </View>

        {columnas.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Columnas configuradas</Text>
            <View style={styles.list}>
              {columnas.map((columna, index) => (
                <Text key={`col-${index}`} style={styles.listItem}>
                  {index + 1}. {tipoColumnaNombre(Number(columna.tipo_columna))}
                </Text>
              ))}
            </View>
          </View>
        )}

        {resistenciaTerreno.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resistencia del terreno</Text>
            <View style={styles.list}>
              {resistenciaTerreno.map((registro, index) => (
                <Text key={`res-${index}`} style={styles.listItem}>
                  Profundidad: {Number(registro.profundidad)} m — Resistencia:{" "}
                  {Number(registro.resistencia)} kN/m²
                </Text>
              ))}
            </View>
          </View>
        )}

        {cotizacion?.mano_obra && (
          <View>
            <Text style={styles.sectionTitle}>MANO DE OBRA Y MATERIALES</Text>
            {renderManoObra(cotizacion.mano_obra)}
          </View>
        )}

        {(cotizacion?.valor_total_mano_obra || cotizacion?.Valor_total_Materiales) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumen financiero</Text>
            {cotizacion?.valor_total_mano_obra && (
              <Text style={styles.cardText}>
                Valor total mano de obra: ${toCurrency(cotizacion.valor_total_mano_obra)}
              </Text>
            )}
            {cotizacion?.Valor_total_Materiales && (
              <Text style={styles.cardText}>
                Valor total materiales: ${toCurrency(cotizacion.Valor_total_Materiales)}
              </Text>
            )}
          </View>
        )}

        {cotizacion?.Valor_total_obra_a_todo_costo && (
          <View style={styles.valorTotal}>
            <Text style={styles.valorTotalText}>
              VALOR TOTAL DE LA OBRA: ${toCurrency(cotizacion.Valor_total_obra_a_todo_costo)}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          Este documento fue generado automáticamente por el Sistema de Presupuesto de Construcción
        </Text>
      </Page>
    </Document>
  );
}

