export interface Facility {
  facility_code: string;
  facility_code_dhis2: string | null;
  facility_code_openlmis: string | null;
  facility_code_mapping: FacilityCodeMapping[] | null;
  registration_number: string;
  facility_name: string;
  common_name: string;
  facility_date_opened: string;
  facility_type_id: number;
  facility_owner_id: number;
  facility_operational_status_id: number;
  facility_regulatory_status_id: number;
  district_id: number;
  client_id: number;
  archived_date: null;
  published_date: string;
  created_at: string;
  updated_at: string;
  id: number;
}

export interface FacilityCodeMapping {
  url: string;
  code: string;
  system: string;
}
