export function setSiteTitle(title) {
  document.querySelector('title').innerText = title
}

export function handleError(error) {
  alert(error?.message || '发生未知错误')
}
