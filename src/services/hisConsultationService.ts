const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface HisConsultation {
  id: number;
  inspection_code: string;
  dept_code: number;
  doctor_code: number;
  patient_code: string;
  user_id: number | null;
  invoice_no: string | null;
  invoice_type: number | null;
  inspection_date: string;
  inspection_type: boolean | null;
  inspection_time: string;
  reservation_code: number | null;
  consultation_date: string | null;
  cash_credit: number | null;
  tpa_code: number | null;
  ins_code: number | null;
  direct_code: string | null;
  ins_id: string | null;
  policy_no: string | null;
  weight: number | null;
  length: number | null;
  temperature: number | null;
  bp_min: string | null;
  bp_max: string | null;
  sugar: string | null;
  pulse: string | null;
  rr: string | null;
  wunit: string | null;
  height: string | null;
  hunit: string | null;
  height2: string | null;
  h2unit: string | null;
  bmi: string | null;
  bsa: string | null;
  spo2: string | null;
  glucometer: string | null;
  diagnosis: string | null;
  prov_diagonosis: string | null;
  chief_complaint: string | null;
  chest: string | null;
  abdomen: string | null;
  abdomen1: string | null;
  ill_duration: string | null;
  ill_dur_unit: string | null;
  illtype: string | null;
  other_remarks: string | null;
  pain: string | null;
  pain_wong: string | null;
  capreflection: string | null;
  infectious: string | null;
  instruction: string | null;
  advice_treat: string | null;
  advice_med: string | null;
  advice_other: string | null;
  line_manage: string | null;
  revisit: number | null;
  revisit_after: number | null;
  revisit_after_unit: string | null;
  follow_up_notes: string | null;
  tobe_admitted: number | null;
  date_of_admit: string | null;
  estimated_days: number | null;
  admition_detail: string | null;
  transfer_clinic: number | null;
  med_case: number | null;
  med_group: number | null;
  service: string | null;
  no_of_teaths: string | null;
  teath_number: string | null;
  sick_leave: number | null;
  sick_leave_start_date: string | null;
  sick_leave_note: string | null;
  claim_transfered: string | null;
  approval_no: string | null;
  last_men_str_date: string | null;
  allergy: boolean | null;
  allergy_text: string | null;
  neuropathy: number | null;
  patient_un_code: string | null;
  qid: string | null;
  iseducated: number | null;
  eduremarks: string | null;
  c_user: number | null;
  m_user: number | null;
  c_when: string | null;
  m_when: string | null;
  edited_date_time: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    medical_record_number: string | null;
  };
}

export interface HisConsultationStats {
  total_synced: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  unique_patients: number;
  linked_to_users: number;
  by_department: Record<string, number>;
  by_doctor: Record<string, number>;
  with_admissions: number;
  with_sick_leave: number;
  with_allergies: number;
  recent_syncs: number;
  sync_queue_status: {
    total_processed_today: number;
    total_processed_all_time: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Get paginated list of HIS consultations with optional search and filters
 */
export const getHisConsultations = async (
  page: number = 1,
  perPage: number = 15,
  filters?: {
    search?: string;
    patient_code?: string;
    user_id?: number;
    dept_code?: number;
    doctor_code?: number;
    with_admissions?: boolean;
    with_sick_leave?: boolean;
    with_allergies?: boolean;
    from_date?: string;
    to_date?: string;
  }
): Promise<PaginatedResponse<HisConsultation>> => {
  const token = localStorage.getItem('auth_token');

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.patient_code) params.append('patient_code', filters.patient_code);
  if (filters?.user_id) params.append('user_id', filters.user_id.toString());
  if (filters?.dept_code) params.append('dept_code', filters.dept_code.toString());
  if (filters?.doctor_code) params.append('doctor_code', filters.doctor_code.toString());
  if (filters?.with_admissions) params.append('with_admissions', '1');
  if (filters?.with_sick_leave) params.append('with_sick_leave', '1');
  if (filters?.with_allergies) params.append('with_allergies', '1');
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);

  const response = await fetch(`${API_BASE_URL}/admin/his-consultations?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS consultations');
  }

  return response.json();
};

/**
 * Get HIS consultation sync statistics
 */
export const getHisConsultationStats = async (): Promise<HisConsultationStats> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}/his-consultations/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch HIS consultation stats');
  }

  const result = await response.json();
  return result.data;
};
