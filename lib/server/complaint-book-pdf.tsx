import 'server-only';

import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { formatLimaDate } from '@/lib/format';
import type { ComplaintBookSettings, ComplaintDocumentType, ComplaintGoodType, ComplaintType } from '@/lib/types/complaint-book';
import { COMPLAINT_DOCUMENT_TYPE_OPTIONS, COMPLAINT_GOOD_TYPE_OPTIONS, COMPLAINT_TYPE_OPTIONS } from '@/lib/data/complaint-book';

export interface ComplaintSheetPdfData {
  numeroHoja: string;
  createdAt: string;
  tipo: ComplaintType;
  consumidorNombre: string;
  consumidorDomicilio: string;
  consumidorDocumentoTipo: ComplaintDocumentType;
  consumidorDocumentoNumero: string;
  consumidorTelefono: string;
  consumidorCorreo: string;
  esMenorEdad: boolean;
  representanteNombre: string;
  representanteDocumentoNumero: string;
  bienTipo: ComplaintGoodType;
  bienDescripcion: string;
  montoReclamadoCents: number | null;
  detalleHechos: string;
  detallePedido: string;
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#111827' },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#4B5563', marginBottom: 14 },
  section: { marginBottom: 12, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, padding: 10 },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 150, color: '#4B5563' },
  value: { flex: 1 },
  paragraph: { marginBottom: 4, lineHeight: 1.4 },
  empty: { color: '#9CA3AF', fontStyle: 'italic' },
});

function label(list: { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label ?? value;
}

function formatSoles(cents: number | null) {
  if (cents === null) return 'No indicado';
  return `S/ ${(cents / 100).toFixed(2)}`;
}

function ComplaintSheetDocument({ settings, entry }: { settings: ComplaintBookSettings; entry: ComplaintSheetPdfData }) {
  return (
    <Document title={`Libro de Reclamaciones — ${entry.numeroHoja}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Hoja de Reclamación — Nº {entry.numeroHoja}</Text>
        <Text style={styles.subtitle}>Registrada el {formatLimaDate(entry.createdAt)} (hora de Perú) · {label(COMPLAINT_TYPE_OPTIONS, entry.tipo)}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Identificación del proveedor</Text>
          <View style={styles.row}><Text style={styles.label}>Razón social</Text><Text style={styles.value}>{settings.razonSocial}</Text></View>
          <View style={styles.row}><Text style={styles.label}>RUC</Text><Text style={styles.value}>{settings.ruc}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Domicilio del establecimiento</Text><Text style={styles.value}>{settings.domicilio}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Identificación del consumidor</Text>
          <View style={styles.row}><Text style={styles.label}>Nombre</Text><Text style={styles.value}>{entry.consumidorNombre}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Domicilio</Text><Text style={styles.value}>{entry.consumidorDomicilio}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Documento</Text><Text style={styles.value}>{label(COMPLAINT_DOCUMENT_TYPE_OPTIONS, entry.consumidorDocumentoTipo)} {entry.consumidorDocumentoNumero}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Teléfono</Text><Text style={styles.value}>{entry.consumidorTelefono}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Correo electrónico</Text><Text style={styles.value}>{entry.consumidorCorreo}</Text></View>
          {entry.esMenorEdad && (
            <>
              <View style={styles.row}><Text style={styles.label}>Padre/madre/representante</Text><Text style={styles.value}>{entry.representanteNombre}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Documento del representante</Text><Text style={styles.value}>{entry.representanteDocumentoNumero}</Text></View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Identificación del bien contratado</Text>
          <View style={styles.row}><Text style={styles.label}>Tipo</Text><Text style={styles.value}>{label(COMPLAINT_GOOD_TYPE_OPTIONS, entry.bienTipo)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Descripción</Text><Text style={styles.value}>{entry.bienDescripcion}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Monto reclamado</Text><Text style={styles.value}>{formatSoles(entry.montoReclamadoCents)}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Detalle {entry.tipo === 'reclamo' ? 'del reclamo' : 'de la queja'}</Text>
          <Text style={styles.paragraph}>{entry.detalleHechos}</Text>
          <Text style={{ ...styles.label, marginBottom: 2 }}>Pedido concreto del consumidor:</Text>
          <Text style={styles.paragraph}>{entry.detallePedido}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Observaciones y acciones adoptadas por el proveedor</Text>
          <Text style={styles.empty}>Este bloque se completa en el panel administrativo del proveedor al emitir su respuesta y no forma parte de este documento original.</Text>
        </View>

        <Text style={styles.paragraph}>La formulación de este documento no impide acudir a otras vías de solución de conflictos ni es un requisito previo para interponer una denuncia ante el INDECOPI. El proveedor debe dar respuesta en un plazo no mayor a 15 días hábiles, improrrogable.</Text>
      </Page>
    </Document>
  );
}

export async function renderComplaintSheetPdf(settings: ComplaintBookSettings, entry: ComplaintSheetPdfData): Promise<Buffer> {
  return renderToBuffer(<ComplaintSheetDocument settings={settings} entry={entry} />);
}
