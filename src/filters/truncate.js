export default (text, length) => {
  if (!text) { return }
  if (isNaN(length)) { length = 10 }

  let end = '...'
  let endLen = 3

  if (text.length <= length) { return text }
  else { return String(text).substring(0, length - endLen).trim() + end }
}
