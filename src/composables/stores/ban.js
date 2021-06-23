import { reactive } from 'vue'
import humanDate from '@/composables/filters/humanDate'

let banNotice = reactive({ message: null })
let bannedUser = null

const initBanNotice = user => {
  bannedUser = user
  banNotice.message = undefined
  updateBanNotice()
}

const updateBanNotice = bannedFromBoard => {
  const banExpiration = bannedUser.ban_expiration
  const boardBanned = bannedFromBoard
  const globallyBanned = !!banExpiration
  // Sets board ban message, ignored if global ban is set
  if (boardBanned && !globallyBanned) banNotice.message = 'Read Only Access &mdash; You have been banned from this board'
  // Sets global ban message if not already set
  else if (!boardBanned && globallyBanned) {
    const expirationStr = humanDate(banExpiration, true)
    banNotice.message = `You have been banned ${expirationStr === 'Permanent' ?
      'Permanently' : 'until' + expirationStr}`
  }

  console.log(banNotice.message)

  return banNotice.message
}

export default {
  banNotice: banNotice.message,
  initBanNotice: initBanNotice,
  updateBanNotice: updateBanNotice,
}
