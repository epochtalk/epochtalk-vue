export default text => {
  let e = document.createElement('textarea') // only create one textarea
  text = text || ''
  text = text.replace(/(?:&)/gi, '&amp;').replace(/(?:&amp;lt;)/gi, '<').replace(/(?:&amp;gt;)/gi, '>')
  e.innerHTML = text
  return e.childNodes[0] ? e.childNodes[0].nodeValue : ''
}
