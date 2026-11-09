export interface InquiryPayload {
  fullName: string
  companyOrInstitution: string
  workEmail: string
  phoneNumber?: string
  productSlug?: string
  productName?: string
  estimatedQuantity?: string
  message: string
  honeypot?: string
}

export interface InquiryResponse {
  success: boolean
  message: string
  inquiryId?: string
}
