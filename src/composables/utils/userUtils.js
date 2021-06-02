export const avatarHighlight = color => color ? { border: `0.125rem solid ${color}` } : {}

export const usernameHighlight = color => color ? {
  background: color,
  padding: '0 0.125rem',
  color: '#ffffff'
} : {}

export const userRoleHighlight = color => color ? {
  background: color,
  border: 'none',
  color: '#fff',
  fontWeight: '600'
} : {}
