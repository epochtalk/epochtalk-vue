import { localStoragePrefs } from '@/composables/stores/prefs'
import { threadsApi } from '@/api'

const buildLastPostData = data => {
  return {
    last_post_created_at: data.last_post_created_at,
    last_post_position: data.last_post_position,
    last_post_username: data.last_post_username,
    last_post_avatar: data.last_post_avatar,
    last_thread_id: data.last_thread_id,
    last_thread_slug: data.last_thread_slug,
    last_thread_title: data.last_thread_title
  }
}

const greater = (a, b) => {
  let minDate = new Date('0001-01-01T00:00:00Z')
  let aCreatedAt = a.last_post_created_at || minDate
  let bCreatedAt = b.last_post_created_at || minDate
  if (new Date(aCreatedAt) > new Date(bCreatedAt)) { return a }
  else { return b }
}

const countTotals = countBoards => {
  let thread_count = 0
  let post_count = 0
  if (countBoards.length > 0) {
    countBoards.forEach(board => {
      let children = countTotals(board.children)
      thread_count += children.thread_count + board.thread_count
      post_count += children.post_count + board.post_count
      board.total_thread_count = thread_count
      board.total_post_count = post_count
    })
  }
  return { thread_count: thread_count, post_count: post_count }
}

const getLastPost = boards => {
  let latestPost = {}
  if (boards.length > 0) {
    boards.forEach(board => {
      let curLatest = getLastPost(board.children)
      // Compare curLatest to board
      curLatest = buildLastPostData(greater(curLatest, board))
      // Compare curLatest to actual latest
      latestPost = buildLastPostData(greater(curLatest, latestPost))
    })
  }
  return latestPost
}

const filterIgnoredBoards = (boards, ignoredBoards = []) => {
  return boards.filter(board => {
    board.children = filterIgnoredBoards(board.children, ignoredBoards)
    return ignoredBoards.indexOf(board.id) === -1
  })
}

export const processBoards = data => {
  data.boards.map(category => {
    // filter out ignored boards
    category.boards = filterIgnoredBoards(category.boards, localStoragePrefs().data.ignored_boards)

    // set total_thread_count and total_post_count for all boards
    category.boards.map(board => {
      let children = countTotals([board])
      let lastPost = getLastPost([board])
      board.total_thread_count = children.thread_count
      board.total_post_count = children.post_count
      return Object.assign(board, lastPost)
    })
  })

  // query recent threads and append to board data so no delay
  // in recent thread component loading
  return threadsApi.recent()
  .then(recent => {
    data.threads = recent
    return data
  }).catch(() => data)
}

export const processThreads = data => {
  // always supply moderators array so property remains reactive even when passed to children
  data.board.moderators = data.board.moderators || []

  // filter out ignored child boards
  data.board.children = filterIgnoredBoards(data.board.children, localStoragePrefs().data.ignored_boards)

  // set total_thread_count and total_post_count for all child board
  data.board.children.map(childBoard => {
    let children = countTotals(childBoard.children)
    let lastPost = getLastPost([childBoard])
    childBoard.total_thread_count = children.thread_count + childBoard.thread_count
    childBoard.total_post_count = children.post_count + childBoard.post_count
    return Object.assign(childBoard, lastPost)
  })
  return data
}
