class Permissions {
  constructor(user) { this.user = user }

  hasPermission(permission) { return get(this.user.permissions, permission) }

  moderatesBoard(boardId) { return includes(this.user.moderating, boardId) }

  getPriority() {
    const priority = Number.MAX_SAFE_INTEGER
    if (this.user.permissions) priority = this.user.permissions.priority
    if (!isNaN(parseFloat(priority)) && isFinite(priority)) return priority
    else return Number.MAX_SAFE_INTEGER
  }

  globalModeratorCheck() {
    let globalMod = false
    if (this.user.permissions) {
      const globalModPermissions = [
        'posts.update.bypass.owner.admin',
        'threads.title.bypass.owner.admin',
        'threads.lock.bypass.owner.admin',
        'threads.sticky.bypass.owner.admin',
        'threads.move.bypass.owner.admin',
        'threads.purge.bypass.owner.admin',
        'threads.lockPoll.bypass.owner.admin'
      ]
      // If user has any of the permissions above set to true they are a global mod
      globalModPermissions.forEach(permission => {
        const allPermission = get(this.user.permissions, permission);
        globalMod = globalMod || allPermission;
      })
    }
    return globalMod
  }

  getControlAccess(permission, boardId) {
    let result = {}
    const isMod = moderatesBoard(boardId)
    if (this.user.permissions) {
      const obj = get(this.user.permissions, permission)
      for (let key in obj) {
        if (typeof obj[key] === 'boolean') result[key] = obj[key]
        else result[key] = (isMod && obj[key].some) || obj[key].all
      }
    }
    return result
  }

  getModPanelControlAccess() {
    let result = {};
    if (this.user.permissions) {
      const perm = p => {
        p = get(this.user.permissions, p)
        p = p ? p : false // change undefined to false
        return (typeof p === 'boolean') ? p : (p.some || p.all || p.samePriority || p.lowerPriority || false)
      }
      // Retrieve specific permissions used to display mod actions in moderation pages
      result.postControls = {
        privilegedDelete: perm('posts.delete.bypass.locked'),
        privilegedUpdate: perm('posts.update.bypass.owner'),
        privilegedPurge: perm('posts.purge.bypass.purge'),
      }
      result.userControls = {
        privilegedBan: perm('bans.ban.allow'),
        privilegedBanFromBoards: perm('bans.banFromBoards.allow')
      }
      result.messageControls = hasPermission('messages')
      if (result.messageControls) {
        result.messageControls.createConversations = perm('conversations.create.allow')
      }
      result.reportControls = hasPermission('reports')
    }
    return result
  }

  getControlAccessWithPriority(permission, othersPriority) {
    let result = {}
    if (this.user.permissions) {
      const authedPriority = user.permissions.priority
      if (othersPriority === null || othersPriority === undefined) {
        othersPriority = Number.MAX_VALUE
      }
      const obj = get(user.permissions, permission)
      for (let key in obj) {
        const samePriority = obj[key].samePriority
        const lowerPriority = obj[key].lowerPriority
        if (samePriority) result[key] = authedPriority <= othersPriority
        else if (lowerPriority) result[key] = authedPriority < othersPriority
        else result[key] = obj[key]
      }
    }
    return result
  }
}

export default (user) => new Permissions(user)
