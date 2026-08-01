import apiClient from './apiClient';

// Type definitions
export type HisPatient = {
  id: number;
  Code: string;
  FileNumber?: string;
  file_number?: string;
  Name?: string;
  MiddleName?: string;
  FamilyName?: string;
  EngName?: string;
  english_full_name?: string;
  arabic_full_name?: string;
  Gender?: boolean;
  gender?: string;
  Birthday?: string;
  date_of_birth?: string;
  AgeYear?: number;
  AgeMonth?: number;
  AgeDay?: number;
  IdNumber?: string;
  IdType?: string;
  IdIssuedate?: string;
  IDExpiryDate?: string;
  PassportNumber?: string;
  VisaNumber?: string;
  Telephone?: string;
  mobile?: string;
  E_Mail?: string;
  WorkPhone?: string;
  Addres?: string;
  City?: string;
  Country?: string;
  PoBox?: string;
  Maritalstatus?: string;
  Relegion?: string;
  NationCode?: string;
  nationality?: string;
  BloodType?: string;
  EmName?: string;
  Kinname?: string;
  Kinmobile?: string;
  Kinaddress?: string;
  Relationtype?: string;
  EntryDate?: string;
  EntryTime?: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
};

export type HisSyncStats = {
  total_patients: number;
  synced_today: number;
  synced_this_week: number;
  synced_this_month: number;
  last_sync?: string;
  queue_count: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
};

// Get HIS patients list (admin only)
export const getHisPatients = async (
  page: number = 1,
  perPage: number = 50,
  search?: string,
  searchColumn: string = 'FileNumber'
): Promise<PaginatedResponse<HisPatient>> => {
  const params: Record<string, string | number | boolean | undefined | null> = {
    page,
    per_page: perPage,
  };

  if (search) {
    params.search = search;
    params.search_column = searchColumn;
  }

  const result = await apiClient.get<{ data: PaginatedResponse<HisPatient> }>('/admin/his-patients', params);
  return result.data;
};

// Get HIS sync statistics (admin only)
export const getHisSyncStats = async (): Promise<HisSyncStats> => {
  const result = await apiClient.get<{ data: HisSyncStats }>('/admin/his-sync-stats');
  return result.data;
};

// Get single HIS patient details (admin only)
export const getHisPatient = async (id: number): Promise<HisPatient> => {
  const result = await apiClient.get<{ data: HisPatient }>(`/admin/his-patients/${id}`);
  return result.data;
};

// Update HIS patient mobile phone (admin only)
export const updateHisPatientMobile = async (
  id: number,
  mobile: string
): Promise<HisPatient> => {
  const result = await apiClient.put<{ data: HisPatient }>(`/admin/his-patients/${id}/mobile`, { mobile });
  return result.data;
};
