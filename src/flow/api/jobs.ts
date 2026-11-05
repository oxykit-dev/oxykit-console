import { api } from './client'

export interface JobDelivery {
  ordinal: number
  provider: string
  destination: string
  status: string
  lastError?: string | null
}

export interface JobResponse {
  id: string
  name?: string | null
  status: string
  createdAt: string
  updatedAt: string
  lastError?: string | null
  deliveries: JobDelivery[]
}

export interface ListJobsResponse {
  items: JobResponse[]
  count: number
  total: number
}

export async function listJobs(limit = 50): Promise<ListJobsResponse> {
  const { data } = await api.get<ListJobsResponse>('/api/v1/jobs/', { params: { limit } })
  return data
}

export async function getJob(id: string): Promise<JobResponse> {
  const { data } = await api.get<JobResponse>(`/api/v1/jobs/${id}`)
  return data
}

export async function createSimpleFileJob(name: string): Promise<JobResponse> {
  const { data } = await api.post<JobResponse>('/api/v1/jobs/', {
    name,
    render: {
      engine: 'oxykit-render',
      input: 'table',
      output: 'html',
      body: {
        sheets: [
          {
            name: 'Demo',
            headers: ['Item', 'Qty'],
            rows: [
              ['Widget', 2],
              ['Gadget', 1],
            ],
          },
        ],
      },
    },
    outputs: [{ provider: 'file', destination: `output/${name.replace(/\s+/g, '-')}.html` }],
  })
  return data
}

export async function retryJob(id: string): Promise<JobResponse> {
  const { data } = await api.post<JobResponse>(`/api/v1/jobs/${id}/retry`)
  return data
}
