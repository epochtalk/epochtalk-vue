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

export const countTotals = countBoards => {
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

export const getLastPost = boards => {
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

export const filterIgnoredBoards = (boards, ignoredBoards = []) => {
  return boards.filter(board => {
    board.children = filterIgnoredBoards(board.children, ignoredBoards)
    return ignoredBoards.indexOf(board.id) === -1
  })
}
