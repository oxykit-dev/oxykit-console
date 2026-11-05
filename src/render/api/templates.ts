import { api } from './client'

export interface TemplateListItem {
  id: string
  hasContract: boolean
}

export interface TemplatesResponse {
  templates: TemplateListItem[]
}

export interface TemplateDetailResponse {
  id: string
  hasContract: boolean
  files: string[]
}

export interface TemplateAssetResponse {
  templateId: string
  path: string
}

export async function listTemplates(): Promise<TemplateListItem[]> {
  const { data } = await api.get<TemplatesResponse>('/templates')
  return data.templates ?? []
}

export async function getTemplate(id: string): Promise<TemplateDetailResponse> {
  const { data } = await api.get<TemplateDetailResponse>(
    `/templates/${encodeURIComponent(id)}`,
  )
  return data
}

export async function uploadPack(id: string, zip: Blob): Promise<TemplateListItem> {
  const { data } = await api.put<TemplateListItem>(
    `/templates/${encodeURIComponent(id)}`,
    zip,
    { headers: { 'Content-Type': 'application/zip' } },
  )
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${encodeURIComponent(id)}`)
}

export async function uploadAsset(
  id: string,
  assetPath: string,
  body: Blob,
  contentType: string,
): Promise<TemplateAssetResponse> {
  const { data } = await api.put<TemplateAssetResponse>(
    `/templates/${encodeURIComponent(id)}/assets/${assetPath}`,
    body,
    { headers: { 'Content-Type': contentType || 'application/octet-stream' } },
  )
  return data
}

export async function deleteAsset(id: string, assetPath: string): Promise<void> {
  await api.delete(`/templates/${encodeURIComponent(id)}/assets/${assetPath}`)
}

export async function previewHtml(templateId: string, data: unknown): Promise<string> {
  const { data: html } = await api.post<string>(
    '/render/template/html',
    { templateId, data },
    { responseType: 'text', headers: { Accept: 'text/html' } },
  )
  return typeof html === 'string' ? html : String(html)
}

export async function previewPdf(templateId: string, data: unknown): Promise<Blob> {
  const { data: blob } = await api.post<Blob>(
    '/render/template/pdf',
    { templateId, data, pageSize: 'A4', pageOrientation: 'Portrait' },
    { responseType: 'blob', headers: { Accept: 'application/pdf' } },
  )
  return blob
}
