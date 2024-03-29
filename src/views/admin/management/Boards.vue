<template>
  <div>
    <div class="nested-input-container">
      <a href="#" @click.prevent="addCategory()" class="nested-btn" :class="{ 'nested-btn-disabled': !newCatName }">Add Category</a>
      <input class="input-text nested-input" type="text" id="new-cat" v-model="newCatName" placeholder="New Category Name" maxlength="255">
    </div>
    <h5 class="thin-underline">
      Categorized Boards
      <span class="info-tooltip" data-balloon="Drag and drop the boards and categories below to order them" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      <div class="right">
        <a href="#" @click.prevent="expandAll()"><i class="fa fa-expand"></i> Expand</a>&nbsp;
        <a href="#" @click.prevent="collapseAll()"><i class="fa fa-compress"></i> Collapse</a>
      </div>
    </h5>
    <render-nestable :key="uncompiledCatHtml" id="nestable-categories" :setCatDelete="setCatDelete" :setCatEdit="setCatEdit" :setBoardDelete="setBoardDelete" :setBoardMods="setBoardMods" :setBoardEdit="setBoardEdit" :uncompiled="uncompiledCatHtml" />
  </div>
  <div>
    <a href="#" @click.prevent="selected = newBoard; showAddBoard = true" class="input-spacer button">Add New Board</a>
    <h5 class="thin-underline">Uncategorized Boards
      <span class="info-tooltip" data-balloon="Drag the boards from the Uncategorized Boards list to the Categorized Boards list to make them visible to the public. Boards left in the Uncategorized Boards list will be inaccessable and hidden from public view" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>
    <render-nestable :key="uncompiledBoardHtml" id="nestable-boards" :setBoardDelete="setBoardDelete" :setBoardMods="setBoardMods" :setBoardEdit="setBoardEdit" :uncompiled="uncompiledBoardHtml" />
  </div>
  <board-manager-modal :show="showAddBoard || showEditBoard || showDeleteBoard || showDeleteCat || showEditCat" :editCat="showEditCat" :deleteCat="showDeleteCat" :addBoard="showAddBoard" :editBoard="showEditBoard" :editBoardMods="showEditBoardMods" :deleteBoard="showDeleteBoard" :selected="selected" @close="showAddBoard=showEditBoard=showEditBoardMods=showDeleteBoard=showDeleteCat=showEditCat=false" @success="handleBoardManagerSuccess"/>
  <set-moderators-modal  :show="showEditBoardMods" :board="selected || {}" @close="showEditBoardMods=false" @success="mods => nestableMap[selectedDataId].moderators = mods" />
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, watch, inject, nextTick } from 'vue'
import { boardsApi, categoriesApi } from '@/api'
import BoardManagerModal from '@/components/modals/admin/management/BoardManager.vue'
import SetModeratorsModal from '@/components/modals/admin/management/SetModerators.vue'
import EventBus from '@/composables/services/event-bus'
import { sortBy, remove, cloneDeep, difference } from 'lodash'
import RenderNestable from '@/components/layout/RenderNestable.vue'
// eslint-disable-next-line no-unused-vars
import nestable from 'nestable'

export default {
  name: 'BoardManagement',
  components: { RenderNestable, BoardManagerModal, SetModeratorsModal },
  beforeRouteEnter(to, from, next) {
    let boards, cats
    boardsApi.uncategorized()
    .then(b => boards = b)
    .then(boardsApi.unfiltered)
    .then(c => cats = c)
    .finally(() => next(vm => {
      vm.uncatListData = boards
      vm.catListData = cats
      vm.cleanBoardList(cats)
      vm.generateNestableBoardData(boards)
      vm.generateNestableCatData(cats)
      vm.catListDataCopy = cloneDeep(vm.catListData)
      vm.uncatListDataCopy = cloneDeep(vm.uncatListData)
    }))
    .catch(() => {})
  },
  beforeRouteUpdate(to, from, next) {
    let boards, cats
    boardsApi.uncategorized()
    .then(b => boards = b)
    .then(boardsApi.unfiltered)
    .then(c => cats = c)
    .finally(() => {
      this.uncatListData = boards
      this.catListData = cats
      this.cleanBoardList(cats)
      this.generateNestableBoardData(boards)
      this.generateNestableCatData(cats)
      this.catListDataCopy = cloneDeep(this.catListData)
      this.uncatListDataCopy = cloneDeep(this.uncatListData)
      next()
    })
    .catch(() => {})
  },
  setup() {
    /* Internal Methods */
    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })

    const resetListener = () => {
      v.catDataId = 0
      v.boardDataId = 9999
      v.newCategories = []
      v.deletedCategories = []
      v.newBoards = []
      v.editedBoards = []
      v.deletedBoards = []
      v.uncatListData = []
      v.catListData = []
      nextTick(() => { // trigger recompilation using original data
        v.uncatListData = cloneDeep(v.uncatListDataCopy)
        v.catListData = cloneDeep(v.catListDataCopy)
      })
    }
    const saveListener = () => {
      console.log('Admin Save Management!')
      normalizeData() // normalize data between vue and jquery
      console.log('SAVE TRIGGERED - CURRENT STATE')
      console.log('---------------------------------------------')
      console.log('New Categories List (v.newCategories):')
      console.log(JSON.stringify(v.newCategories, null, 2))
      console.log('New Boards List (v.newBoards):')
      console.log(JSON.stringify(v.newBoards, null, 2))
      console.log('Edited Boards List (v.editedBoards):')
      console.log(JSON.stringify(v.editedBoards, null, 2))
      console.log('Deleted Boards List (v.deletedBoards):')
      console.log(JSON.stringify(v.deletedBoards, null, 2))
      console.log('Deleted Categories List (v.deletedCategories):')
      console.log(JSON.stringify(v.deletedCategories, null, 2))
      console.log('Nestable Map (v.nestableMap):')
      console.log(v.nestableMap)
      console.log('Category List Data (v.catListData):')
      console.log(v.catListData)
      console.log('Uncategorized List Data (v.uncatListData):')
      console.log(v.uncatListData)
      console.log('---------------------------------------------')

      return processNewCategories()
      .then(processNewBoards)
      .then(processEditedBoards)
      .then(processDeletedBoards)
      .then(processDeletedCategories)
      .then(() => {
        let catMapping = buildUpdatedCats(v.serializedCats)
        let uncatMapping = buildUncategorizedBoards(v.serializedBoards)
        let mergedMapping = uncatMapping.concat(catMapping)
        return processCategories(mergedMapping)
      })
      .then(() => {
        $alertStore.success('Successfully updated boards!')
        // reload data from server to reset state
        let boards, cats
        return boardsApi.uncategorized()
        .then(b => boards = b)
        .then(boardsApi.unfiltered)
        .then(c => cats = c)
        .finally(() => {
          v.uncatListData = boards
          v.catListData = cats
          cleanBoardList(cats)
          generateNestableBoardData(boards)
          generateNestableCatData(cats)
          v.catListDataCopy = cloneDeep(v.catListData)
          v.uncatListDataCopy = cloneDeep(v.uncatListData)
        })
      })
      .catch(err => {
        console.log(err)
        $alertStore.error('There was an error updating boards.')
      })
    }

    const processNewCategories = () => {
      if (v.newCategories.length < 1) return Promise.resolve()
      console.log(`0) Adding new Categories: \n${JSON.stringify(v.newCategories, null, 2)}`)
      return categoriesApi.create({ categories: v.newCategories })
      .then(cats => cats.forEach((cat, index) => {
        // Map back to nestableMap record using generated id from newCat as key
        let dataId = v.catsDataIdMap[v.newCategories[index].id]
        v.nestableMap[dataId].id = cat.id
      }))
      .then(() => v.newCategories = [])
      .catch(err => console.log(err))
    }

    const processNewBoards = () => {
      if (v.newBoards.length < 1) return Promise.resolve()
      console.log(`1) Adding new Boards: \n${JSON.stringify(v.newBoards, null, 2)}`)
      v.newBoards = v.newBoards.map(b => {
        if (typeof b.postable_by !==  'number') delete b.postable_by
        if (typeof b.viewable_by !==  'number') delete b.viewable_by
        return b
      })
      return boardsApi.create(v.newBoards)
      .then(boards => boards.forEach((board) => {
        let dataId = v.boardsDataIdMap[board.slug]
        v.nestableMap[dataId].id = board.id
      }))
      .then(() => v.newBoards = [])
      .catch(err => console.log(err))
    }

    const processEditedBoards = () => {
      if (v.editedBoards.length < 1) return Promise.resolve()
      console.log(`2) Handling edited Boards: \n${JSON.stringify(v.editedBoards, null, 2)}`)
      return boardsApi.update(v.editedBoards)
      .then(() => v.editedBoards = [])
      .catch(err => console.log(err))
    }

    const processDeletedBoards = () => {
      if (v.deletedBoards.length < 1) return Promise.resolve()
      console.log(`3) Handling deleted Boards: \n${JSON.stringify(v.deletedBoards, null, 2)}`)
      return boardsApi.delete({ board_ids: v.deletedBoards })
      .then(() => v.deletedBoards = [])
      .catch(err => console.log(err))
    }

    const processDeletedCategories = () => {
      if (v.deletedCategories.length < 1) return Promise.resolve()
      console.log(`4) Handling deleted Categories: \n${JSON.stringify(v.deletedCategories, null, 2)}`)
      return categoriesApi.delete({ category_ids: v.deletedCategories })
      .then(() => v.deletedCategories = [])
      .catch(err => console.log(err))
    }

    const processCategories = boardMapping => {
      console.log('5) Updating board mapping: \n' + JSON.stringify(boardMapping, null, 2))
      return boardsApi.updateAll({ boardMapping: boardMapping })
      .catch(err => console.log(err))
    }

    // -- Data Normalization Helper Methods
    // Normalize data, take nestable data and use it to update uncatListData and catListData
    // needs to be called when any action to boards or cats are performed
    const normalizeData = () => {
      // 1) Serialize categorized list and uncategorized list
      let cats = window.$('#nestable-categories').nestable('serialize') // data from nestable
      let boards = window.$('#nestable-boards').nestable('serialize') // data from nestable
      v.serializedCats = cats
      v.serializedBoards = boards
      // 2) Update Nestable Map for cats and boards (After, nestableMap should contain truth)
      v.newBoards = []
      v.editedBoards = []
      let catOrdering = updateNestableMapForCats(cats) // update nestable map as it contains truth
      let boardOrdering = updateNestableMapForBoards(boards)
      // 3) Normalize v.catListData and v.uncatListData using nestableMap and ordering arrays
      v.catListData = updateCatListData(catOrdering)
      v.uncatListData = updateUncatListData(boardOrdering)
    }

    // Keeps nestable map up to date using serialized nestable data
    // this allows us to rebuild catListData when dom rebuilds to recompile nestable data
    const updateNestableMapForBoards = boards => {
      if (!boards) return []
      return boards.map(b => {
        b.dataId = b.id
        b.id = b.boardId
        let nestableBoard = v.nestableMap[b.dataId]
        nestableBoard.children = updateNestableMapForBoards(b.children) // maintain updated nestable map
        delete b.boardId
        // update newBoards, editedBoards and deletedBoards lists while rebuilding
        if (b.id === -1) v.newBoards.push({...nestableBoard, dataId: b.dataId})
        else if (nestableBoard.modified) v.editedBoards.push({...nestableBoard, dataId: b.dataId})
        else if (nestableBoard.deleted) {
          if (nestableBoard.id === -1) remove(v.newBoards, b => b.slug === nestableBoard.slug)
          else v.deletedBoards.push(nestableBoard.id)
          b = null
        }
        return b
      }).filter(i => i)
    }
    const updateNestableMapForCats = (cats) => {
      v.newCategories = [] // rebuild new cats when building nestable map
      if (!cats) return
      cats.map(cat => {
        // cat is new if it's id is -1, easier to reset and repopulate this than to maintain it
        cat.dataId = cat.id
        cat.id = cat.catId
        v.nestableMap[cat.dataId].children = cat.children // maintain updated nestable map
        cat.boards = cat.children || []
        delete cat.catId
        delete cat.top
        delete cat.children
        updateNestableMapForBoards(cat.boards)
        // TODO(akinsey): this will break when we switch to BigInt for id's
        if (typeof cat.id === 'number') v.newCategories.push(cat)
        return cat
      })
      return cats
    }

    // Rebuilds uncatListData using nestableMap which contains changes to boards
    const updateUncatListData = boards => {
      if (!boards) return []
      let orphans = []
      boards = boards.map(b => {
        if (!b.dataId) return b // if board already converted dont convert (fix for uncat boards)
        let nestableBoard = v.nestableMap[b.dataId]
        nestableBoard.children = updateUncatListData(nestableBoard.children)
        if (nestableBoard.deleted) orphans.push(...nestableBoard.children)
        return nestableBoard.deleted ? null : nestableBoard
      }).filter(i => i)
     boards.push(...orphans)
     return boards
    }
    // Rebuilds catListData using nestableMap, which contains ordering truth (from nestable)
    const updateCatListData = (cats) => {
      let viewOrder = 0
      let tempCats = cats.map(cat => {
        let nestableCat = v.nestableMap[cat.dataId]
        cat.created_at = nestableCat.created_at
        cat.id = nestableCat.id
        cat.imported_at = nestableCat.imported_at
        cat.meta = nestableCat.meta
        cat.name = nestableCat.name
        cat.postable_by = nestableCat.postable_by
        cat.updated_at = nestableCat.updated_at
        cat.view_order = viewOrder++
        cat.viewable_by = nestableCat.viewable_by
        cat.boards = []
        let children = nestableCat.children
        if (nestableCat.deleted) { // cat was deleted push children to uncat
          // TODO(akinsey): this will break when we switch to BigInt for id's
          if (typeof nestableCat.id !== 'number') v.deletedCategories.push(nestableCat.id)
          let updatedChildren = updateUncatListData(children)
          nextTick(() => v.uncatListData.push(...updatedChildren))
          cat = null
        }
        else if (children) children.forEach(b => {
          let board = v.nestableMap[b.dataId]
          if (board.deleted) { // move children to uncat if board deleted
            let updatedChildren = updateUncatListData(board.children)
            nextTick(() => v.uncatListData.push(...updatedChildren))
          }
          else {
            cat.boards.push(board)
            updateCatListDataBoards(cat.boards)
          }
        })
        return cat
      }).filter(i => i)
      return tempCats
    }
    const updateCatListDataBoards = catBoards => { // recursion for catListData update
      if(!catBoards) return
      return catBoards.map(board => {
        let newChildren = []
        let children = v.nestableMap[v.boardsDataIdMap[board.old_slug || board.slug]].children
        if (children) children.forEach(b => {
          let board = b.dataId ? v.nestableMap[b.dataId] : b
          if (board.deleted) { // move children to uncat if board deleted
            nextTick(() => v.uncatListData.push(...updateUncatListData(board.children)))
          }
          else newChildren.push(board)
        })
        board.children = newChildren
        // recurse if there are children
        if (board.children.length > 0) updateCatListDataBoards(board.children)
      })
    }

    // Remove categorized boards from list of unfiltered boards, updates uncatListData
    const cleanBoardList = cats => cats.forEach(cat => cleanBoards(cat.boards))
    const cleanBoards = catBoards => { // recusion for uncatListData
      catBoards.forEach(board => {
        // remove this board from uncatListData
        remove(v.uncatListData, b => b.id === board.id)
        // recurse if there are children
        if (board.children.length > 0) { cleanBoards(board.children) }
      })
    }

    /* HTML Generation Helper Methods */
    const generateCategoriesHtml = categories => { // Generates nestable html for category data
      let html = '<div class="dd" id="' + v.catListId + '"><ol class="dd-list">'
      let sortedCats = sortBy(categories, 'view_order')
      sortedCats.forEach(cat => {
        let dataId = v.catDataId++
        let boardIds = []
        let catBoards = cat.boards || []
        catBoards.forEach(board => boardIds.push(board.id))
        v.nestableMap[dataId] = {
          id: cat.id,
          name: cat.name,
          viewable_by: cat.viewable_by,
          children: catBoards
        }
        v.catsDataIdMap[cat.id] = dataId // Allows us to map catListData to nestableMap
        // Edit pencil and trash buttons
        let toolbarHtml = '<i @click="setCatDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
          '<i @click="setCatEdit(' +
          dataId + ')" class="dd-nodrag dd-right-icon fas fa-edit"></i>'
        let status = `<i class="fa status${cat.modified  ? ' modified' : ''}"></i>`
        html += '<li class="dd-item dd-root-item" data-cat-id="' + cat.id + '" data-id="' + dataId +
          '" data-top="true" data-name="' + cat.name + '"><div class="dd-grab-cat"></div><div class="dd-handle' +
          ' dd-root-handle">' + status + '<div class="dd-desc">' + cat.name + '</div>' +
          toolbarHtml + '</div>' + generateBoardHtml(cat.boards) + '</li>'
      })
      html += '</ol></div>'
      return html
    }
    // Generates nestable html for uncategorized boards
    const generateUncategorizedHtml = boards => {
      let emptyHtml = '<div class="dd-empty"></div>'
      let html = '<div class="dd" id="' + v.uncatListId + '">'
      html += boards.length > 0 ? generateBoardHtml(boards) : emptyHtml
      html += '</div>'
      return html
    }
    // Generates single board nestable tab
    const generateBoardHtml = boards => { // Generates nestable html elements for board data
      let html = '<ol class="dd-list">'
      boards.forEach((board) => {
        let dataId = v.boardDataId++
        // Store boardData within each li's data-board attr for easy access
        v.nestableMap[dataId] = {
          id: board.id,
          name: board.name,
          slug: board.slug,
          modified: board.modified,
          description: board.description,
          viewable_by: board.viewable_by,
          postable_by: board.postable_by,
          right_to_left: board.right_to_left,
          disable_signature: board.disable_signature,
          disable_selfmod: board.disable_selfmod,
          disable_post_edit: board.disable_post_edit,
          children: board.children || [],
          moderators: board.moderators || []
        }
        v.boardsDataIdMap[board.slug] = dataId // Allows us to map catListData to nestableMap
        let toolbarHtml = '<i @click="setBoardDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i><i @click="setBoardEdit(' +
          dataId + ')" class="dd-nodrag dd-right-icon fas fa-edit"></i><i @click="setBoardMods(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-user"></i>'
        let status = `<i class="fa status${board.modified  ? ' modified' : ''}"></i>`
        html += '<li class="dd-item" data-board-id="' + board.id + '" data-id="' + dataId + '">' +
          '<div class="dd-grab"></div><div class="dd-handle">' + status + '<div class="dd-desc">' + board.name + '<span>' + board.description + '</span></div>' +
          toolbarHtml + '</div>' + generateBoardHtml(board.children || []) + '</li>'
      })
      html += '</ol>'
      return html
    }

    // Used to generate html from request and initiate nestable
    const generateNestableCatData = data => {
      if (!data) { data = [] }
      v.nestableMap = {}
      v.uncompiledCatHtml = null
      v.catDataId = 0
      v.boardDataId = 9999
      let html = generateCategoriesHtml(data)
      let bhtml = generateUncategorizedHtml(v.uncatListData)
      // Compile html so vue controls will work
      v.uncompiledCatHtml = html
      v.uncompiledBoardHtml = bhtml
      nextTick(() => window.$('#nestable-categories').nestable(v.nestableOpts))
      nextTick(() => window.$('#nestable-boards').nestable(v.nestableOpts))
    }
    const generateNestableBoardData = data => {
      if (!data) { data = [] }
      v.nestableMap = {}
      v.uncompiledBoardHtml = null
      v.catDataId = 0
      v.boardDataId = 9999
      let html = generateUncategorizedHtml(data)
      let chtml = generateCategoriesHtml(v.catListData)
      // Compile html so vue controls will work
      v.uncompiledBoardHtml = html
      v.uncompiledCatHtml = chtml
      nextTick(() => window.$('#nestable-boards').nestable(v.nestableOpts))
      nextTick(() => window.$('#nestable-categories').nestable(v.nestableOpts))
    }

    /* Board Mapping Helper Functions */
    const buildUncategorizedBoards = uncatArr => {
      let uncategorizedMapping = []
      // Convert Original Uncategorized List into flat array
      let origList = v.uncatListDataCopy.map(data => data.id)
      // Convert New Uncategorized List into flat array
      let newList = uncatArr.map(data => data.id === -1 ? undefined : data.id)
      // Diff new and original uncategorized lists to figure out
      // which boards were newly uncategorized
      let diffList = difference(newList, origList)
      // Add the newly uncategorized boards into the uncategorized mapping
      diffList.forEach(id => uncategorizedMapping.push({ id: id === -1 ? undefined : id, type: 'uncategorized' }))
      return uncategorizedMapping
    }

    /* Translates serialized array into boards.updateCategory format */
    const buildUpdatedCats = catsArr => {
      let boardMapping = []
      catsArr.forEach((cat, index) => {
        // add this cat as a row entry
        let nestableCat = v.nestableMap[v.catsDataIdMap[cat.id]]
        let catId = nestableCat.id
        let row = {
          type: 'category',
          id: catId,
          name: cat.name,
          viewable_by: typeof nestableCat.viewable_by === 'number' ? nestableCat.viewable_by.toString() : nestableCat.viewable_by, // TODO(akinsey): server route fails if given a number instead of a string
          view_order: index
        }
        boardMapping.push(row)
        if (!cat.boards) return
        cat.boards.forEach((catBoard, index) => {
          // add this cat board as a row entry
          let nestableBoard = v.nestableMap[v.boardsDataIdMap[catBoard.slug]]
          let boardId = nestableBoard.id
          let boardRow = {
            type: 'board',
            id: boardId,
            category_id: catId,
            viewable_by: nestableBoard.viewable_by,
            postable_by: nestableBoard.postable_by,
            right_to_left: nestableBoard.right_to_left,
            disable_signature: nestableBoard.disable_signature,
            disable_selfmod: nestableBoard.disable_selfmod,
            disable_post_edit: nestableBoard.disable_post_edit,
            view_order: index
          }
          boardMapping.push(boardRow)
          // add any children board entries
          if (catBoard.children && catBoard.children.length > 0) buildEntries(catBoard.children, boardId, boardMapping)
        })
      })
      return boardMapping
    }

    const buildEntries = (currentBoards, parentId, boardMapping) => {
      currentBoards.forEach((board, index) => {
        // add this board as a row entry
        let nestableBoard = v.nestableMap[v.boardsDataIdMap[board.slug]]
        let boardId = nestableBoard.id
        let row = {
          type: 'board',
          id: boardId,
          parent_id: parentId,
          viewable_by: nestableBoard.viewable_by,
          postable_by: nestableBoard.postable_by,
          right_to_left: nestableBoard.right_to_left,
          disable_signature: nestableBoard.disable_signature,
          disable_selfmod: nestableBoard.disable_selfmod,
          disable_post_edit: nestableBoard.disable_post_edit,
          view_order: index
        }
        boardMapping.push(row)
        // add any children boards as a row entry
        if (board.children && board.children.length > 0) buildEntries(board.children, boardId, boardMapping)
      })
    }

    /* Template Methods */
    const addCategory = () => {
      if (!v.newCatName) return
      normalizeData()
      // Add new category to vue controlled list of categories
      let newCat = {
        boards: [],
        created_at: null,
        id: v.newCatId++,
        imported_at: null,
        meta: null,
        name: v.newCatName,
        postable_by: null,
        updated_at: null,
        view_order: 0,
        modified: true
      }
      v.newCategories.push(newCat) // add new cat to array of newly added cats
      v.catListData.unshift(newCat) // add newCat to catListData, triggers rebuild of html
      v.newCatName = '' // clear input for category name
    }

    const handleBoardManagerSuccess = ({ type, data }) => { // Handle Modal Success
      if (type === 'addBoard') addBoard(data)
      if (type === 'editBoard') editBoard(data)
      if (type === 'deleteBoard') deleteBoard()
      if (type === 'deleteCat') deleteCat()
      if (type === 'editCat') editCat(data)
    }

    const addBoard = board => {
      normalizeData() // Normalize data between vue and jquery
      v.uncatListData.unshift(board) // triggers recompilation of nestable components/html
    }
    const editBoard = board => {
      // Update nestable map to contain edited board info
      board.modified = true
      v.nestableMap[v.selectedDataId] = board
      normalizeData() // Normalize data between vue and jquery
    }
    const deleteBoard = () => {
      normalizeData()
      let board = v.nestableMap[v.selectedDataId]
      // Update nestable map to contain deleted board info
      board.deleted = true
      normalizeData() // normalize again after flagging deleted
    }
    const deleteCat = () => {
      normalizeData()
      let cat = v.nestableMap[v.selectedDataId]
      cat.deleted = true
      normalizeData() // normalize again after flagging deleted
    }
    const editCat = category => {
      let editCatEl = window.$(`li[data-id="${v.selectedDataId}"]`) // get parent cat element
      let childrenDataIds = [...editCatEl.children().find('[data-id]')].map(i => i.dataset.id)
      // Iterate through all cat children and update viewable_by to match category
      childrenDataIds.forEach(nestableId => {
        let board = v.nestableMap[nestableId]
        board.viewable_by = category.viewable_by
        board.modified = true
      })
      v.nestableMap[v.selectedDataId] = category // update category
      normalizeData() // normalize data after changes
    }

    const setCatDelete = id => {
      v.showDeleteCat = true
      v.selected = v.nestableMap[id]
      v.selectedDataId = id
    }
    const setCatEdit = id => {
      v.showEditCat = true
      v.selected = v.nestableMap[id]
      v.selectedDataId = id
    }
    const setBoardDelete = id => {
      v.showDeleteBoard = true
      v.selected = v.nestableMap[id]
      v.selectedDataId = id
    }
    const setBoardEdit = id => {
      v.showEditBoard = true
      v.selected = v.nestableMap[id]
      v.selectedDataId = id
    }
    const setBoardMods = id => {
      v.selected = v.nestableMap[id]
      v.showEditBoardMods = true
      v.selectedDataId = id
    }

    // Nestable function calls
    const expandAll = () => window.$('#nestable-categories').nestable('expandAll')
    const collapseAll = () => window.$('#nestable-categories').nestable('collapseAll')

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      serializedCats: null,
      serializedBoards: null,
      selected: null,
      selectedDataId: null,
      catListDataCopy: null,
      uncatListDataCopy: null,
      nestableMap: {},
      catsDataIdMap: {}, // DataId keyed by cat.view_order which is unique
      boardsDataIdMap: {}, // DataID keyed by board.slug TODO(akinsey): not unique prior to req
      catDataId: 0,
      newCatId: 99999,
      boardDataId: 9999,
      catListData: null,
      nestableOpts: { protectedRoot: true, maxDepth: 5, group: 1 },
      catListId: 'categorized-boards',
      uncatListId: 'uncategorized-boards',
      newBoard: { viewable_by: null, postable_by: null, description: '', name: '' },
      uncatListData: null,
      newCatName: '',
      newCategories: [],
      deletedCategories: [],
      newBoards: [],
      editedBoards: [],
      deletedBoards: [],
      uncompiledCatHtml: '',
      uncompiledBoardHtml: '',
      showAddBoard: false,
      showEditBoard: false,
      showEditBoardMods: false,
      showDeleteBoard: false,
      showEditCat: false,
      showDeleteCat: false
    })

    /* Watch Data */
    watch(() => v.catListData, generateNestableCatData, { deep: true })
    watch(() => v.uncatListData, generateNestableBoardData, { deep: true })

    return { ...toRefs(v), addCategory, setCatDelete, setCatEdit, setBoardDelete, setBoardEdit, setBoardMods, generateNestableBoardData, generateNestableCatData, cleanBoardList, expandAll, collapseAll, handleBoardManagerSuccess }
  }
}
</script>

<style lang="scss">
.nested-input-container { .nested-btn-disabled, .nested-btn { color: $base-background-color; margin-bottom: 0; } }
a.input-spacer, a.input-spacer.button { margin-bottom: 1rem; }
.dd {
  position: relative;
  display: block;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  line-height: 1.25rem;
}

.dd-list {
  display: block;
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dd-list .dd-list {
  padding-left: 1.875rem;
}

.dd-collapsed .dd-list {
  display: none;
}

.dd-item, .dd-empty, .dd-placeholder {
  display: block;
  position: relative;
  margin: 0;
  padding: 0;
  min-height: 1.25rem;
  font-size: 0.8125rem;
  line-height: 1.25rem;
}

.dd-grab {
  position: absolute;
  margin: 0;
  pointer-events: none;
  left: 0;
  top: 0;
  width: 1.875rem;
  height: 1.875rem;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid $border-color;
  background: $base-background-color;
  border-radius: 2px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.dd-grab:before {
  content: '≡';
  pointer-events: none;
  display: block;
  position: absolute;
  left: 0;
  top: 0.1875rem;
  width: 100%;
  text-align: center;
  text-indent: 0;
  font-size: 20px;
  font-weight: normal;
}

.dd-grab-cat {
  position: absolute;
  margin: 0;
  pointer-events: none;
  left: 0;
  top: 0;
  width: 1.875rem;
  height: 1.875rem;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
  border-right: 1px solid $base-background-color;
  background: $color-primary;
  border-radius: 2px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.dd-grab-cat:before {
  content: '≡';
  pointer-events: none;
  display: block;
  position: absolute;
  left: 0;
  top: 0.1875rem;
  width: 100%;
  text-align: center;
  text-indent: 0;
  color: $base-background-color;
  font-size: 1.25rem;
  font-weight: normal;
}

.dd-handle, .dd-root-handle {
  display: block;
  height: 1.875rem;
  cursor: pointer;
  margin: 0.3125rem 0;
  padding: 0.3125rem 0.625rem 0.3125rem 3.125rem;
  color: $base-font-color;
  text-decoration: none;
  font-weight: bold;
  border: 1px solid $border-color;
  background: $base-background-color;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  border-radius: 2px;
}

.dd-root-handle {
  color: $base-background-color;
  border: 1px solid $color-primary;
  background: $color-primary;
  border-radius: 2px;
}

.dd-root-item > button:before {
  color: $base-background-color !important;
}

.dd-item > button {
  display: block;
  position: relative;
  cursor: pointer;
  float: left;
  width: 1.5625rem;
  height: 1.25rem;
  margin: 0.3125rem 0 0.3125rem 1.875rem;
  padding: 0;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
  border: 0;
  background: transparent;
  font-size: 0.75rem;
  line-height: 1;
  text-align: center;
  font-weight: bold;
}

.dd-item > button:before {
  color: $base-font-color;
  content: '▸';
  display: block;
  position: absolute;
  width: 100%;
  text-align: center;
  text-indent: 0;
}

.dd-item > button[data-action="collapse"]:before {
  content: '▾';
}

.dd-placeholder, .dd-empty {
  margin: 0.3125rem 0;
  padding: 0;
  height: 1.875rem;
  background: $sub-header-color;
  border: 1px dashed $border-color;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
}

.dd-empty {
  border: 1px dashed $border-color;
  min-height: 1.875rem;
  background-color: $sub-header-color;
  background-image:
    -webkit-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff),
    -webkit-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
  background-image:
    -moz-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff),
    -moz-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
  background-image:
    linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff),
    linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
  background-size: 3.75rem 3.75rem;
  background-position: 0 0, 1.875rem 1.875rem;
}

.dd-dragel {
  position: absolute;
  pointer-events: none;
  z-index: 9999;
}

.dd-dragel > .dd-item .dd-handle {
  margin-top: 0;
}

.dd-dragel .dd-handle {
  -webkit-box-shadow: 2px 4px 6px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 2px 4px 6px 0 rgba(0, 0, 0, 0.1);
}

.dd-right-icon {
  float: right !important;
  cursor: pointer;
  padding-top: 0.1875rem;
  padding-left: 0.3125rem;
}

.dd-desc {
  width: 75%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.dd-desc > span {
  font-weight: normal;
  color: $secondary-font-color-dark;
  font-size: 0.6875rem;
  padding-left: 10px;
}

.fill-btn {
  width: 100%;
  height: 2.3125rem;
  padding-top: 0.5rem;
  margin-bottom: 16px;
}

.status {
  display: none !important;
  padding-right: 0.3125rem !important;
}

.modified {
  color: #40BFFF;
  display: inline-block !important;
  float: left;
  padding-top: 0.25rem;
}

.modified::before {
  content: "\f0c8";
}

.cat-actions {
  display: flex;
  margin-top: 1rem;

  button {
    margin-right: 0.5rem;
  }

  @include break-mobile-sm {
    button {
      margin-right: 0;
    }
  }
}

@include break-mobile-sm {
  .dd-desc span { display: none; }
  .dd-desc { width: 70% };
}
</style>
