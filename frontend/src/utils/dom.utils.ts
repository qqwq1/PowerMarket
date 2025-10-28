const openLink = (to: string) => {
  if (!to) return

  const l = document.createElement('a')
  l.href = to
  l.target = '_blank'
  l.click()
}

const getQueryParams = (): Record<string, string> => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  return Object.fromEntries(urlSearchParams.entries())
}

const extractQueryParams = (url: string): Record<string, string> => {
  const urlSearchParams = new URLSearchParams(url.substring(url.lastIndexOf('/') + 1).split('?')[1])
  return Object.fromEntries(urlSearchParams.entries())
}

const setQueryParam = (key: string, value: string) => {
  const urlParams = new URLSearchParams(window.location.search)
  urlParams.set(key, value)
  window.location.search = urlParams.toString()
}

const batchSetQueryParams = (params: Array<{ key: string; value: string }>) => {
  const url = new URL(window.location.href)
  for (const param of params) url.searchParams.set(param.key, param.value)

  window.history.pushState(null, '', url)
}

const extractFilenameFromUrl = (url: string) => {
  const filename = url.substring(url.lastIndexOf('/') + 1)
  return filename.split('?')[0]
}

const formatLinks = (s: string) => {
  return s.replace(/(https?:\/\/[^\s]+)/g, `<a target="_blank" href='$1' style="color: var(--primary-50);">$1</a>`)
}

const downloadFile = (url: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.target = '_blank'
  link.click()
}

function placeCaretAtEnd(el: HTMLElement) {
  el.focus()

  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)

  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}

const scrollToTargetElement = (targetElement: HTMLElement) => {
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'instant' })
  }
}

function getScrollParent(node: Node | HTMLElement | null): HTMLElement | null {
  if (node == null) {
    return null
  }
  const htmlElement = node as HTMLElement
  if (htmlElement.scrollHeight > htmlElement.clientHeight) {
    return htmlElement
  } else {
    return getScrollParent(node.parentNode)
  }
}

const requestUploadFile = (): Promise<File> => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = false
  input.click()

  return new Promise((res, reject) => {
    input.addEventListener('change', (e: any) => {
      if (e.target?.files?.[0]) {
        res(e.target?.files?.[0])
      }
    })

    setTimeout(() => {
      input.remove()
      reject(null)
    }, 120000)
  })
}

const domUtils = {
  openLink,
  getQueryParams,
  setQueryParam,
  getScrollParent,
  batchSetQueryParams,
  extractFilenameFromUrl,
  extractQueryParams,
  formatLinks,
  downloadFile,
  placeCaretAtEnd,
  requestUploadFile,
  scrollToTargetElement,
}

export default domUtils
