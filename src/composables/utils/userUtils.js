export const avatarHighlight = color => color ? { border: `0.125rem solid ${color}` } : {}

export const usernameHighlight = color => color ? {
  background: color,
  padding: '0 0.125rem',
  color: '#ffffff'
} : {}
