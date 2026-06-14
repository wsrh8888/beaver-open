export interface IOAuthCallbackParams {
  code: string | null
  state: string | null
  error: string | null
}

/** hash 路由下 code 在 # 前的 search 里，需从 window.location.search 读取 */
export function parseOAuthCallbackParams(): IOAuthCallbackParams {
  const searchParams = new URLSearchParams(window.location.search)
  return {
    code: searchParams.get('code'),
    state: searchParams.get('state'),
    error: searchParams.get('error'),
  }
}

export function clearOAuthCallbackParams() {
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState({}, '', `${url.pathname}${url.hash}`)
}
