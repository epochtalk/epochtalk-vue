import humanDate from '@/composables/filters/humanDate'

export default class BanUtils {
  constructor(user) {
    this.user = user
    this.message = undefined
    this.boardBanned = false
    this.banExpiration = user.ban_expiration
    this.globallyBanned = user.ban_expiration ? true : false;
  }

  update(bannedFromBoard) {
    this.banExpiration = this.user.ban_expiration
    this.boardBanned = bannedFromBoard
    this.globallyBanned = this.banExpiration ? true : false
    // Sets board ban message, ignored if global ban is set
    if (this.boardBanned && !this.globallyBanned) this.message = 'Read Only Access &mdash; You have been banned from this board'
    // Sets global ban message if not already set
    else if (!this.boardBanned && this.globallyBanned) {
      let expirationStr = humanDate(this.banExpiration, true)
      this.message = `You have been banned ${expirationStr === 'Permanent' ?
        'Permanently' : 'until' + expirationStr}`
    }
    // Clears ban message assuming the ban isn't global
    else this.message = undefined
    return this.message
  }

  isBanned() { return this.message }
  banStatus() { return this.boardBanned || this.globallyBanned }
}
