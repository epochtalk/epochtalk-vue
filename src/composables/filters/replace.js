export default () => (text, subStr, newSubStr) => {
  if (!subStr || !newSubStr) return text
  else text.split(subStr).join(newSubStr)
}

