import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({ /* ... similar a tu otro PDF ... */ });

export default function CotizacionHidraulicaPDF({ cotizacion, params }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View><Text>COTIZACIÓN HIDRÁULICA</Text></View>

        <View>
          <Text>Dimensiones: {params.ancho} cm x {params.largo} cm</Text>
          <Text>Puntos colocados: {params.puntos?.length ?? 0}</Text>
          {params.puntos?.map((p, i) => (
            <Text key={i}>{i+1}. {p.tipo} - rot {p.rotation ?? 0}°</Text>
          ))}
        </View>

        {cotizacion?.mano_obra && <View><Text>{/* render mano_obra con saltos */}</Text></View>}

        {/* resumen financiero según cotizacion */}
      </Page>
    </Document>
  );
}