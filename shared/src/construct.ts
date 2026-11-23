export const CONSTRUCT_STATUSES = ['active', 'dormant', 'corrupted', 'quarantined'] as const

export type ConstructStatus = (typeof CONSTRUCT_STATUSES)[number]

export type Construct = {
    _id: string
    slug?: string
    name: string
    alias?: string
    gender: string
    birthdate: string
    affiliation?: string
    occupation?: string
    personality: string
    history: string
    skills: string[]
    status: ConstructStatus
    integrity?: number
    clearanceLevel: 1 | 2 | 3
    scannedAt?: string
    createdBy?: string
    createdAt?: string
    updatedAt?: string
}
