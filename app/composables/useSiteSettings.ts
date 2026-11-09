import { useState, useAsyncData } from '#app'

export interface SiteSettings {
  company_name: string
  company_legal_name: string
  tagline: string
  hero_headline: string
  hero_subheadline: string
  logo_url: string
  phone: string
  whatsapp: string
  email: string
  address: string
  operating_hours: string
  distribution_focus: string
  regulation_info: string
  [key: string]: string
}

export const defaultSettings: SiteSettings = {
  company_name: 'Angkasa Raya Medika',
  company_legal_name: 'PT Angkasa Raya Medika',
  tagline: 'Distribusi Reagen & Alat Laboratorium B2B',
  hero_headline: 'Katalog Reagen dan Bahan Laboratorium dengan Informasi yang Jelas.',
  hero_subheadline: 'Membantu analis dan tim pengadaan menemukan spesifikasi reagen yang tepat sebelum mengajukan penawaran harga resmi.',
  logo_url: '/brand/logo_akm.jpg',
  phone: '021 89086234',
  whatsapp: '6281289086234',
  email: 'angkasakaryamedika@gmail.com',
  address: 'Perumahan Sentul Indah Residence Blok A No. 1, Cikeas, Sukaraja, Bogor, Jawa Barat, 16710',
  operating_hours: 'Senin – Jumat, 08.30 – 17.00 WIB',
  distribution_focus: 'Prioritas Wilayah Jabodetabek & Pasokan Nasional',
  regulation_info: 'Kementerian Kesehatan RI (Izin Edar Resmi AKD)'
}

export const useSiteSettings = () => {
  const settings = useState<SiteSettings>('site_settings', () => ({ ...defaultSettings }))

  const { data, refresh } = useAsyncData<Record<string, string>>('site-settings-fetch', () => $fetch('/api/settings'), {
    default: () => ({ ...defaultSettings }),
  })

  // Keep state synced with fetched data
  if (data.value && Object.keys(data.value).length > 0) {
    settings.value = {
      ...defaultSettings,
      ...data.value
    }
  }

  const updateLocalSettings = (newSettings: Partial<SiteSettings>) => {
    settings.value = {
      ...settings.value,
      ...newSettings
    }
  }

  return {
    settings,
    refresh,
    updateLocalSettings
  }
}
