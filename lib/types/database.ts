export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_settings: {
        Row: {
          approach_paragraph1: string
          approach_paragraph2: string
          approach_title: string
          badge: string
          credential1: string
          credential2: string
          credential3: string
          heading: string
          id: boolean
          introduction: string
          pillar1_description: string
          pillar1_title: string
          pillar2_description: string
          pillar2_title: string
          pillar3_description: string
          pillar3_title: string
          pillar4_description: string
          pillar4_title: string
          profile_image_alt: string
          profile_image_url: string
          profile_name: string
          profile_title: string
          quote: string
        }
        Insert: {
          approach_paragraph1: string
          approach_paragraph2: string
          approach_title: string
          badge: string
          credential1: string
          credential2: string
          credential3: string
          heading: string
          id?: boolean
          introduction: string
          pillar1_description: string
          pillar1_title: string
          pillar2_description: string
          pillar2_title: string
          pillar3_description: string
          pillar3_title: string
          pillar4_description: string
          pillar4_title: string
          profile_image_alt: string
          profile_image_url: string
          profile_name: string
          profile_title: string
          quote: string
        }
        Update: {
          approach_paragraph1?: string
          approach_paragraph2?: string
          approach_title?: string
          badge?: string
          credential1?: string
          credential2?: string
          credential3?: string
          heading?: string
          id?: boolean
          introduction?: string
          pillar1_description?: string
          pillar1_title?: string
          pillar2_description?: string
          pillar2_title?: string
          pillar3_description?: string
          pillar3_title?: string
          pillar4_description?: string
          pillar4_title?: string
          profile_image_alt?: string
          profile_image_url?: string
          profile_name?: string
          profile_title?: string
          quote?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      complaint_book_counters: {
        Row: {
          anio: number
          codigo_establecimiento: string
          ultimo_correlativo: number
        }
        Insert: {
          anio: number
          codigo_establecimiento: string
          ultimo_correlativo?: number
        }
        Update: {
          anio?: number
          codigo_establecimiento?: string
          ultimo_correlativo?: number
        }
        Relationships: []
      }
      complaint_book_entries: {
        Row: {
          anio: number
          bien_descripcion: string
          bien_tipo: string
          codigo_establecimiento: string
          consumidor_correo: string
          consumidor_documento_numero: string
          consumidor_documento_tipo: string
          consumidor_domicilio: string
          consumidor_nombre: string
          consumidor_telefono: string
          correlativo: number
          created_at: string
          detalle_hechos: string
          detalle_pedido: string
          email_consumidor_enviado: boolean
          email_error: string
          email_interno_enviado: boolean
          es_menor_edad: boolean
          estado: string
          id: string
          monto_reclamado_cents: number | null
          numero_hoja: string
          pdf_path: string
          representante_documento_numero: string
          representante_nombre: string
          respondido_por: string | null
          respuesta_evidencia_path: string
          respuesta_fecha: string | null
          respuesta_texto: string
          tipo: string
        }
        Insert: {
          anio: number
          bien_descripcion: string
          bien_tipo: string
          codigo_establecimiento: string
          consumidor_correo: string
          consumidor_documento_numero: string
          consumidor_documento_tipo: string
          consumidor_domicilio: string
          consumidor_nombre: string
          consumidor_telefono: string
          correlativo: number
          created_at?: string
          detalle_hechos: string
          detalle_pedido: string
          email_consumidor_enviado?: boolean
          email_error?: string
          email_interno_enviado?: boolean
          es_menor_edad?: boolean
          estado?: string
          id?: string
          monto_reclamado_cents?: number | null
          numero_hoja: string
          pdf_path?: string
          representante_documento_numero?: string
          representante_nombre?: string
          respondido_por?: string | null
          respuesta_evidencia_path?: string
          respuesta_fecha?: string | null
          respuesta_texto?: string
          tipo: string
        }
        Update: {
          anio?: number
          bien_descripcion?: string
          bien_tipo?: string
          codigo_establecimiento?: string
          consumidor_correo?: string
          consumidor_documento_numero?: string
          consumidor_documento_tipo?: string
          consumidor_domicilio?: string
          consumidor_nombre?: string
          consumidor_telefono?: string
          correlativo?: number
          created_at?: string
          detalle_hechos?: string
          detalle_pedido?: string
          email_consumidor_enviado?: boolean
          email_error?: string
          email_interno_enviado?: boolean
          es_menor_edad?: boolean
          estado?: string
          id?: string
          monto_reclamado_cents?: number | null
          numero_hoja?: string
          pdf_path?: string
          representante_documento_numero?: string
          representante_nombre?: string
          respondido_por?: string | null
          respuesta_evidencia_path?: string
          respuesta_fecha?: string | null
          respuesta_texto?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_book_entries_codigo_establecimiento_anio_fkey"
            columns: ["codigo_establecimiento", "anio"]
            isOneToOne: false
            referencedRelation: "complaint_book_counters"
            referencedColumns: ["codigo_establecimiento", "anio"]
          },
          {
            foreignKeyName: "complaint_book_entries_respondido_por_fkey"
            columns: ["respondido_por"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      complaint_book_settings: {
        Row: {
          correo_reclamos_interno: string
          domicilio: string
          id: boolean
          razon_social: string
          ruc: string
          texto_aviso_otras_vias: string
          texto_plazo_respuesta: string
        }
        Insert: {
          correo_reclamos_interno: string
          domicilio: string
          id?: boolean
          razon_social: string
          ruc: string
          texto_aviso_otras_vias: string
          texto_plazo_respuesta: string
        }
        Update: {
          correo_reclamos_interno?: string
          domicilio?: string
          id?: boolean
          razon_social?: string
          ruc?: string
          texto_aviso_otras_vias?: string
          texto_plazo_respuesta?: string
        }
        Relationships: []
      }
      complaint_book_status_log: {
        Row: {
          admin_id: string | null
          created_at: string
          entry_id: string
          id: string
          new_status: string
          note: string
          previous_status: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          entry_id: string
          id?: string
          new_status: string
          note?: string
          previous_status: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          entry_id?: string
          id?: string
          new_status?: string
          note?: string
          previous_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_book_status_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "complaint_book_status_log_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "complaint_book_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          address: string
          address_note: string
          email: string
          hours: string
          hours_note: string
          id: boolean
          phone: string
          phone_note: string
          title: string
          whatsapp_label: string
          whatsapp_message: string
          whatsapp_phone: string
        }
        Insert: {
          address: string
          address_note?: string
          email: string
          hours: string
          hours_note?: string
          id?: boolean
          phone: string
          phone_note?: string
          title: string
          whatsapp_label: string
          whatsapp_message?: string
          whatsapp_phone: string
        }
        Update: {
          address?: string
          address_note?: string
          email?: string
          hours?: string
          hours_note?: string
          id?: boolean
          phone?: string
          phone_note?: string
          title?: string
          whatsapp_label?: string
          whatsapp_message?: string
          whatsapp_phone?: string
        }
        Relationships: []
      }
      deleted_manual_sale_requests: {
        Row: {
          deleted_at: string
          request_id: string
        }
        Insert: {
          deleted_at?: string
          request_id: string
        }
        Update: {
          deleted_at?: string
          request_id?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      legal_settings: {
        Row: {
          id: boolean
          privacy_body: string
          privacy_title: string
          returns_body: string
          returns_title: string
          terms_body: string
          terms_title: string
        }
        Insert: {
          id?: boolean
          privacy_body: string
          privacy_title: string
          returns_body: string
          returns_title: string
          terms_body: string
          terms_title: string
        }
        Update: {
          id?: boolean
          privacy_body?: string
          privacy_title?: string
          returns_body?: string
          returns_title?: string
          terms_body?: string
          terms_title?: string
        }
        Relationships: []
      }
      monthly_accesses: {
        Row: {
          created_at: string
          ends_at: string | null
          purchase_id: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          purchase_id: string
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          purchase_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_accesses_purchase_id_starts_at_fkey"
            columns: ["purchase_id", "starts_at"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id", "purchased_at"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_cents: number
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          coordinated_at: string | null
          coordinated_by: string | null
          created_at: string
          currency: string
          group_id: string
          id: string
          manual_payment_method: string | null
          manual_request_id: string | null
          origin: string
          payment_reference: string | null
          purchased_at: string | null
          recorded_by: string | null
          reference_code: string
          status: string
        }
        Insert: {
          amount_cents: number
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          coordinated_at?: string | null
          coordinated_by?: string | null
          created_at?: string
          currency?: string
          group_id: string
          id?: string
          manual_payment_method?: string | null
          manual_request_id?: string | null
          origin: string
          payment_reference?: string | null
          purchased_at?: string | null
          recorded_by?: string | null
          reference_code?: string
          status?: string
        }
        Update: {
          amount_cents?: number
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          coordinated_at?: string | null
          coordinated_by?: string | null
          created_at?: string
          currency?: string
          group_id?: string
          id?: string
          manual_payment_method?: string | null
          manual_request_id?: string | null
          origin?: string
          payment_reference?: string | null
          purchased_at?: string | null
          recorded_by?: string | null
          reference_code?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchases_coordinated_by_fkey"
            columns: ["coordinated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchases_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "workshop_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quotes: {
        Row: {
          accent_note: string
          author: string
          created_at: string
          id: string
          is_published: boolean
          quote: string
          role: string
          sort_order: number
          variant: string
        }
        Insert: {
          accent_note?: string
          author: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote: string
          role?: string
          sort_order?: number
          variant?: string
        }
        Update: {
          accent_note?: string
          author?: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote?: string
          role?: string
          sort_order?: number
          variant?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          content: Json
          id: boolean
          services: Json
        }
        Insert: {
          content: Json
          id?: boolean
          services: Json
        }
        Update: {
          content?: Json
          id?: boolean
          services?: Json
        }
        Relationships: []
      }
      workshop_groups: {
        Row: {
          capacity: number
          created_at: string
          currency: string
          discount_cents: number
          id: string
          is_published: boolean
          price_cents: number
          regular_price_cents: number
          schedule_description: string
          sort_order: number
          usd_price_cents: number | null
          workshop_id: string
        }
        Insert: {
          capacity: number
          created_at?: string
          currency?: string
          discount_cents?: number
          id?: string
          is_published?: boolean
          price_cents: number
          regular_price_cents: number
          schedule_description?: string
          sort_order?: number
          usd_price_cents?: number | null
          workshop_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          currency?: string
          discount_cents?: number
          id?: string
          is_published?: boolean
          price_cents?: number
          regular_price_cents?: number
          schedule_description?: string
          sort_order?: number
          usd_price_cents?: number | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_groups_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          category: string
          created_at: string
          id: string
          is_published: boolean
          slug: string
          summary: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          summary?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_sales_page: {
        Args: {
          p_access: string
          p_coordination: string
          p_page: number
          p_query: string
        }
        Returns: Json
      }
      cancel_sale: {
        Args: { p_admin_id: string; p_purchase_id: string; p_reason: string }
        Returns: undefined
      }
      delete_manual_sale: {
        Args: {
          p_admin_id: string
          p_code: string
          p_is_test: boolean
          p_purchase_id: string
        }
        Returns: undefined
      }
      delete_workshop_catalog: {
        Args: { p_workshop_id: string }
        Returns: undefined
      }
      group_peak_occupancy: {
        Args: { p_from: string; p_group_id: string; p_until: string }
        Returns: number
      }
      register_complaint_sheet: {
        Args: { p_codigo_establecimiento: string; p_input: Json }
        Returns: Json
      }
      register_manual_sale: {
        Args: { p_admin_id: string; p_input: Json }
        Returns: string
      }
      respond_complaint_sheet: {
        Args: {
          p_admin_id: string
          p_evidencia_path: string
          p_id: string
          p_respuesta_fecha: string
          p_respuesta_texto: string
        }
        Returns: undefined
      }
      save_workshop_catalog: {
        Args: { p_slug: string; p_workshop: Json; p_workshop_id: string }
        Returns: Json
      }
      set_complaint_sheet_status: {
        Args: { p_admin_id: string; p_estado: string; p_id: string }
        Returns: undefined
      }
      set_sale_coordination: {
        Args: {
          p_admin_id: string
          p_coordinated: boolean
          p_purchase_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
