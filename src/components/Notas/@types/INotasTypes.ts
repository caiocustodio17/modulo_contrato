export interface IDataSetResult {
  values: IDataSetValues;
}
export interface IDataSetValues {
  code: string | number;
  message: [] | string | undefined;
}
export interface INota {
  date_time: string;
  request_code: string;
  success: boolean;
  status: number;
  message: string;
  payload_count: number;
  total_count: number;
  total_pages: number;
  next_url: null | string;
  payload: IPayload;
  errors: [];
}
export interface IPayload {
  tax_documents: ITaxDocument[];
}
export interface ITaxDocument {
  id?: number;
  erp_identification?: null | string;
  access_key?: null | string;
  model_type?: string;
  customer_identification_number?: string;
  supplier_identification_number?: string;
  number?: number;
  series?: string;
  issue_date?: string;
  total_value?: number;
  created_at?: string;
  updated_at?: string;
  document_xml_url?: string;
  document_pdf_url?: string;
  customer_city_data?: ICityData;
  supplier_city_data?: ICityData;
  complementary_law_116?: string;
  simples_nacional_from_robot?: boolean | string;
  iss_value?: number | string;
  iss_tax_rate?: number | string;
  ir_value?: string;
  ir_tax_rate?: string;
  pis_value?: number | string;
  pis_tax_rate?: string;
  cofins_value?: number | string;
  cofins_tax_rate?: string;
  csll_value?: string;
  csll_tax_rate?: string;
  inss_value?: string;
  inss_tax_rate?: string;
  iss_base_value?: number | string;
  pis_base_value?: number;
  cofins_base_value?: number;
  csll_base_value?: number | string;
  ir_base_value?: number | string;
  inss_base_value?: number | string;
  all_validation_errors?: Array<string | string>;
  iss_retention?: boolean | string;
  supplier_legal_name?: string;
  customer_legal_name?: string;
  invoice_items?: IInvoiceItem[];
  external_identifiers?: [];
  bank_slips?: [];
  id_medicao?: string
}
export interface ICityData {
  name: string;
  ibge_code: string;
  state_name: string;
  state_abbreviation: string;
}
export interface IInvoiceItem {
  id?: number;
  nitem?: number;
  quantity?: number;
  unit_price?: number;
  unit?: string;
  net_value?: string;
  total_value?: number;
  icms_tax_rate?: number;
  icms_value?: number;
  icms_st_tax_rate?: number;
  icms_st_value?: number;
  ipi_tax_rate?: number;
  ipi_value?: number;
  iss_tax_rate?: string;
  iss_value?: string;
  inss_tax_rate?: string;
  inss_value?: string;
  ir_tax_rate?: string;
  ir_value?: string;
  csll_tax_rate?: string;
  csll_value?: string;
  cofins_tax_rate?: number;
  cofins_value?: number;
  pis_tax_rate?: number;
  pis_value?: number;
  fcp_tax_rate?: number;
  fcp_value?: number;
  purchase_order?: string;
  line_number?: string;
  description?: string;
  ncm?: string;
  cfop?: string;
  icms_base_value?: number;
  ipi_base_value?: number;
  iss_base_value?: string;
  icms_st_base_value?: number;
  cofins_base_value?: number;
  pis_base_value?: number;
  fcp_base_value?: number;
  fcp_st_base_value?: number;
  csll_base_value?: string;
  ir_base_value?: string;
  inss_base_value?: string;
  complementary_law_116?: string;
  cst?: string;
  item_code?:string;
}
