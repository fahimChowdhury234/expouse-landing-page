import defaultBundle from '../../cms-fixtures/bundle-en.json'

export interface CmsSection<T = any> {
  _id: string
  _type: string
  is_hidden?: boolean
  data: T
}

export interface CmsPageData {
  title: string
  slug?: string | null
  seo?: {
    title?: string
    description?: string
    og_image?: string
  }
  sections: CmsSection[]
}

export function useCmsBundle() {
  const bundle = useState('cms_bundle', () => defaultBundle)
  return bundle
}

export function useCmsPage(path = '/'): ComputedRef<CmsPageData | null> {
  const bundle = useCmsBundle()
  return computed(() => {
    const pages = bundle.value?.pages || {}
    const normalized = path === '' ? '/' : (path.startsWith('/') ? path : `/${path}`)
    return pages[normalized] || null
  })
}

export function useCmsSection<T = any>(sectionType: string, pagePath = '/'): ComputedRef<T | null> {
  const page = useCmsPage(pagePath)
  return computed(() => {
    if (!page.value?.sections) return null
    const sec = page.value.sections.find(s => s._type === sectionType && !s.is_hidden)
    return sec ? (sec.data as T) : null
  })
}

export function useCmsSettings() {
  const bundle = useCmsBundle()
  return computed(() => bundle.value?.settings || {})
}

export function useCmsNavigation() {
  const bundle = useCmsBundle()
  return computed(() => bundle.value?.navigation || {})
}
