'use client'

import { useEffect, useState } from 'react'
import { COUNTRY_LABELS } from '@/constants/photoRequirements'
import type { PhotoSpec } from '@/lib/types'
import Select from './ui/Select'

function guessDocumentFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase()
    if (tz.includes('dar_es_salaam')) return 'TANZANIA_PASSPORT'
    if (tz.includes('berlin')) return 'GERMANY_PASSPORT'
    if (tz.includes('tokyo')) return 'JAPAN_PASSPORT'
    if (tz.includes('shanghai') || tz.includes('chongqing')) return 'CHINA_VISA'
    if (tz.includes('kolkata') || tz.includes('calcutta')) return 'INDIA_PASSPORT'
    if (tz.includes('australia')) return 'AUSTRALIA_PASSPORT'
    if (tz.includes('toronto') || tz.includes('vancouver')) return 'CANADA_PASSPORT'
    if (tz.includes('london')) return 'UK_PASSPORT'
    if (tz.includes('america/') && (tz.includes('new_york') || tz.includes('chicago') || tz.includes('los_angeles') || tz.includes('denver'))) return 'US_PASSPORT_VISA'
    if (tz.includes('europe/')) return 'EU_PASSPORT'
  } catch (e) {}
  return null
}

interface CountrySelectorProps {
  value: string
  onChange: (code: string) => void
  specs: Record<string, PhotoSpec>
}

export default function CountrySelector({ value, onChange, specs }: CountrySelectorProps) {
  const [detectedDoc, setDetectedDoc] = useState<string | null>(null)

  useEffect(() => {
    setDetectedDoc(guessDocumentFromTimezone())
  }, [])

  let options = Object.keys(specs)
    .filter(code => !code.startsWith('TANZANIA_') || code === 'TANZANIA_PASSPORT')
    .map((code) => ({
      value: code,
      label: COUNTRY_LABELS[code] || specs[code].name,
    }))
  
  if (detectedDoc && specs[detectedDoc]) {
    options = options.filter(o => o.value !== detectedDoc)
    options.unshift({
      value: detectedDoc,
      label: (COUNTRY_LABELS[detectedDoc] || specs[detectedDoc].name) + ' (Suggested)',
    })
  }

  options.unshift({
    value: 'CUSTOM_SIZE',
    label: COUNTRY_LABELS['CUSTOM_SIZE'] || 'Custom Size',
  })

  return (
    <Select
      value={value.startsWith('TANZANIA_') ? 'TANZANIA_PASSPORT' : value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
    />
  )
}
