import { ReactNode, createContext, useState } from "react";
import { ITaxDocument } from "./@types/INotasTypes";

type NotasContextProps = {
  notas : ITaxDocument[]; setNotas:(notas:ITaxDocument[])=>void
}

const initialTaxdocuments: ITaxDocument[] = [{
    id: -1,
    erp_identification: "",
    access_key: "",
    model_type: "",
    customer_identification_number: "",
    supplier_identification_number: "",
    number: -1,
    series: "",
    issue_date: "",
    total_value: 0,
    created_at: "",
    updated_at: "",
    document_xml_url: "",
    document_pdf_url: "",
    customer_city_data: {ibge_code:'',name:'',state_abbreviation:'',state_name:''},
    supplier_city_data: {ibge_code:'',name:'',state_abbreviation:'',state_name:''},
    complementary_law_116: "",
    simples_nacional_from_robot: "",
    iss_value: "",
    iss_tax_rate: "",
    ir_value: "",
    ir_tax_rate: "",
    pis_value: "",
    pis_tax_rate: "",
    cofins_value: "",
    cofins_tax_rate: "",
    csll_value: "",
    csll_tax_rate: "",
    inss_value: "",
    inss_tax_rate: "",
    iss_base_value: "",
    pis_base_value: 0,
    cofins_base_value: 0,
    csll_base_value: "",
    ir_base_value: "",
    inss_base_value: "",
    all_validation_errors: [],
    iss_retention: "",
    supplier_legal_name: "",
    customer_legal_name: "",
    invoice_items: [{
      id:-1,
      nitem:0,
      quantity:0,
      unit_price:0,
      unit:'',
      net_value:'',
      total_value:0,
      icms_tax_rate:0,
      icms_value:0,
      icms_st_tax_rate:0,
      icms_st_value:0,
      ipi_tax_rate:0,
      ipi_value:0,
      iss_tax_rate:'',
      iss_value:'',
      inss_tax_rate:'',
      inss_value:'',
      ir_tax_rate:'',
      ir_value:'',
      csll_tax_rate:'',
      csll_value:'',
      cofins_tax_rate:0,
      cofins_value:0,
      pis_tax_rate:0,
      pis_value:0,
      fcp_tax_rate:0,
      fcp_value:0,
      purchase_order:'',
      line_number:'',
      description:'',
      ncm:'',
      cfop:'',
      icms_base_value:0,
      ipi_base_value:0,
      iss_base_value:'',
      icms_st_base_value:0,
      cofins_base_value:0,
      pis_base_value:0,
      fcp_base_value:0,
      fcp_st_base_value:0,
      csll_base_value:'',
      ir_base_value:'',
      inss_base_value:'',
      complementary_law_116:'',
      cst:'',
      item_code:'',
}],
    external_identifiers: [],
    bank_slips: [],
}]

export const NotasContext = createContext<NotasContextProps|undefined>(undefined)

type NotaProviderProps = {
  children: ReactNode
}

export function NotasProvider({children}:NotaProviderProps){
  const [notas,setNotas] = useState<ITaxDocument[]>(initialTaxdocuments)
  return(
    <NotasContext.Provider value={{notas,setNotas}}>
      {children}
    </NotasContext.Provider>
  )
}
