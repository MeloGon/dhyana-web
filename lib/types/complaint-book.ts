export type ComplaintType = 'reclamo' | 'queja';
export type ComplaintGoodType = 'producto' | 'servicio';
export type ComplaintDocumentType = 'dni' | 'ce' | 'pasaporte' | 'ruc';
export type ComplaintStatus = 'registrado' | 'en_tramite' | 'respondido';

export interface ComplaintBookSettings {
  ruc: string;
  razonSocial: string;
  domicilio: string;
  correoReclamosInterno: string;
  textoAvisoOtrasVias: string;
  textoPlazoRespuesta: string;
}

// Sin correoReclamosInterno: el correo de reclamos internos nunca se expone al público.
export interface PublicComplaintBookSettings {
  ruc: string;
  razonSocial: string;
  domicilio: string;
  textoAvisoOtrasVias: string;
  textoPlazoRespuesta: string;
}

export interface ComplaintSheetInput {
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

export interface ComplaintSheetConfirmation {
  id: string;
  numeroHoja: string;
  createdAt: string;
  pdfUrl: string | null;
}

export interface AdminComplaintSheet {
  id: string;
  numeroHoja: string;
  createdAt: string;
  tipo: ComplaintType;
  estado: ComplaintStatus;
  consumidorNombre: string;
  consumidorCorreo: string;
  bienDescripcion: string;
  respuestaFecha: string | null;
}

export interface AdminComplaintSheetDetail extends AdminComplaintSheet {
  consumidorDomicilio: string;
  consumidorDocumentoTipo: ComplaintDocumentType;
  consumidorDocumentoNumero: string;
  consumidorTelefono: string;
  esMenorEdad: boolean;
  representanteNombre: string;
  representanteDocumentoNumero: string;
  bienTipo: ComplaintGoodType;
  montoReclamadoCents: number | null;
  detalleHechos: string;
  detallePedido: string;
  respuestaTexto: string;
  respuestaEvidenciaPath: string;
  respondidoPor: string | null;
  pdfUrl: string | null;
  emailConsumidorEnviado: boolean;
  emailInternoEnviado: boolean;
}

export interface ComplaintResponseInput {
  respuestaTexto: string;
  respuestaFecha: string;
}

export interface ComplaintFilters {
  estado: 'all' | ComplaintStatus;
  page: number;
}

export interface AdminComplaintSheetsPage {
  total: number;
  page: number;
  pageSize: number;
  items: AdminComplaintSheet[];
}
