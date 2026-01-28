const getApiOrigin = () => {
  const base = import.meta.env.VITE_API_URL || '/api'
  if (base.startsWith('/')) return ''

  try {
    const parsed = new URL(base)
    const normalizedPath = parsed.pathname.replace(/\/api\/?$/, '')
    return `${parsed.origin}${normalizedPath}`
  } catch {
    return ''
  }
}

export const resolveImageUrl = (url) => {
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }

  const normalized = url.startsWith('/') ? url : `/${url}`
  if (normalized.startsWith('/uploads')) {
    const origin = getApiOrigin()
    return origin ? `${origin}${normalized}` : normalized
  }

  return normalized
}
