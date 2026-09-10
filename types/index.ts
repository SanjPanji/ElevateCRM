/**
 * User & Profile types
 */
export type UserRole = 'admin' | 'manager' | 'employee';

export interface Profile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Lead types
 */
export type MeetingStatus = 'not_scheduled' | 'scheduled' | 'completed';

export interface Lead {
  id: string;
  // Основная информация
  name: string | null;
  age: number | null;
  university: string | null;
  education_course: string | null;
  specialty: string | null;

  // Текущая ситуация
  current_activity: string | null;
  current_job: string | null;
  monthly_income: number | null;
  income_currency: string | null;

  // Цели и мотивация
  main_goal: string | null;
  main_obstacle: string | null;
  why_now: string | null;

  // Предыдущий опыт
  purchased_courses: string | null;
  liked_and_missing: string | null;

  // Готовность к покупке
  ready_to_start: string | null;
  payment_decision_maker: string | null;
  development_budget: string | null;

  // Ожидаемый результат
  success_result: string | null;

  // Дополнительная информация
  consultant_notes: string | null;

  // Контакт
  phone: string | null;

  // CRM
  meeting_status: MeetingStatus;
  meeting_start: string | null;
  meeting_end: string | null;

  // Ответственный сотрудник
  assigned_to: string | null;

  // Источник
  source: string;
  tally_form_id: string | null;
  tally_response_id: string | null;

  // Оригинальный ответ Tally
  raw_tally_data: Record<string, any> | null;

  // Системные поля
  created_at: string;
  updated_at: string;
}

export interface LeadAnswer {
  id: string;
  lead_id: string;
  field_id: string;
  field_name: string;
  field_value: any;
  created_at: string;
}

export interface LeadWithDetails extends Lead {
  assigned_employee?: Profile;
  answers?: LeadAnswer[];
  notes?: Note[];
  appointments?: Appointment[];
  nextAppointment?: Appointment | null;
}

/**
 * Note types
 */
export interface Note {
  id: string;
  lead_id: string;
  employee_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

/**
 * Appointment types
 */
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export interface Appointment {
  id: string;
  lead_id: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  google_event_id: string | null;
  google_calendar_id: string | null;
  google_meet_url: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  employee?: Profile;
}

/**
 * Google Connection types
 */
export interface GoogleConnection {
  id: string;
  employee_id: string;
  google_email: string;
  google_calendar_id: string;
  encrypted_refresh_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Webhook types
 */
export type WebhookStatus = 'received' | 'processed' | 'failed';
export type WebhookProvider = 'tally' | 'google';

export interface WebhookEvent {
  id: string;
  provider: WebhookProvider;
  event_id: string;
  payload: Record<string, any>;
  status: WebhookStatus;
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  total_leads: number;
  new_leads: number;
  todays_calls: number;
  completed_calls: number;
}

/**
 * Calendar availability slot
 */
export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

export interface CalendarAvailability {
  date: string;
  timezone: string;
  slots: AvailabilitySlot[];
}
