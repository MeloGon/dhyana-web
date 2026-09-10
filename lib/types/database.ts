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
      workshop_groups: {
        Row: {
          capacity: number
          created_at: string
          currency: string
          id: string
          is_published: boolean
          price_cents: number
          schedule_description: string
          sort_order: number
          workshop_id: string
        }
        Insert: {
          capacity: number
          created_at?: string
          currency?: string
          id?: string
          is_published?: boolean
          price_cents: number
          schedule_description?: string
          sort_order?: number
          workshop_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          currency?: string
          id?: string
          is_published?: boolean
          price_cents?: number
          schedule_description?: string
          sort_order?: number
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
      delete_workshop_catalog: {
        Args: { p_workshop_id: string }
        Returns: undefined
      }
      group_peak_occupancy: {
        Args: { p_from: string; p_group_id: string; p_until: string }
        Returns: number
      }
      register_manual_sale: {
        Args: { p_admin_id: string; p_input: Json }
        Returns: string
      }
      save_workshop_catalog: {
        Args: { p_slug: string; p_workshop: Json; p_workshop_id: string }
        Returns: Json
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
