export default (text, subStr, newSubStr) => {
  if (!subStr || !newSubStr) return text
  else return text.split(subStr).join(newSubStr)
}

