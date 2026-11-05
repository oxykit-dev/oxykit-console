import { api } from '@mail/api/client'

export interface MailTemplateInfo {
  id: string
}

export interface MailTemplateListResponse {
  templates: MailTemplateInfo[]
}

export interface MailTemplateDetailResponse {
  id: string
  files: string[]
}

export async function listTemplates(): Promise<MailTemplateInfo[]> {
  const { data } = await api.get<MailTemplateListResponse>('/templates')
  return data?.templates ?? []
}

export async function getTemplate(id: string): Promise<MailTemplateDetailResponse> {
  const { data } = await api.get<MailTemplateDetailResponse>(`/templates/${encodeURIComponent(id)}`)
  return data
}

export async function uploadTemplate(id: string, zip: Blob): Promise<MailTemplateInfo> {
  const { data } = await api.put<MailTemplateInfo>(`/templates/${encodeURIComponent(id)}`, zip, {
    headers: { 'Content-Type': 'application/zip' },
  })
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${encodeURIComponent(id)}`)
}

export async function downloadTemplatePack(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`/templates/${encodeURIComponent(id)}/pack`, {
    responseType: 'blob',
  })
  return data
}
