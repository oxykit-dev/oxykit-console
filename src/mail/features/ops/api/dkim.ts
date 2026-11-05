import { api } from '@mail/api/client'

export interface GenerateKeysResponse {
  success: boolean
  publicKey: string
  privateKey: string
  message: string
}

export interface DnsRecordResponse {
  success: boolean
  dnsTxtRecord: string
  instructions: string
  message: string
}

export async function generateDkimKeys(): Promise<GenerateKeysResponse> {
  const { data } = await api.post<GenerateKeysResponse>('/email/dkim/generate-keys')
  return data
}

export async function getDkimDnsRecord(): Promise<DnsRecordResponse> {
  const { data } = await api.get<DnsRecordResponse>('/email/dkim/dns-record')
  return data
}
