<template>
  <div>
    <div class="nested-input-container">
      <a href="#" @click.prevent="insertNewCategory()" class="nested-btn">Add Category</a>
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
    <a href="#" ng-click="showAddBoard = true" class="input-spacer button">Add New Board</a>
    <h5 class="thin-underline">Uncategorized Boards
      <span class="info-tooltip" data-balloon="Drag the boards from the Uncategorized Boards list to the Categorized Boards list to make them visible to the public. Boards left in the Uncategorized Boards list will be inaccessable and hidden from public view" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>
    <render-nestable :key="uncompiledBoardHtml" id="nestable-boards" :setBoardDelete="setBoardDelete" :setBoardMods="setBoardMods" :setBoardEdit="setBoardEdit" :uncompiled="uncompiledBoardHtml" />
  </div>
  <board-manager-modal :show="showEditBoard || showEditBoardMods || showDeleteBoard || showDeleteCat || showEditCat" :editCat="showEditCat" :deleteCat="showDeleteCat" :editBoard="showEditBoard" :editBoardMods="showEditBoardMods" :deleteBoard="showDeleteBoard" :selected="{}" @close="showEditBoard = showEditBoardMods = showDeleteBoard = showDeleteCat = showEditCat = false" />
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { boardsApi } from '@/api'
import BoardManagerModal from '@/components/modals/admin/management/BoardManager.vue'
import EventBus from '@/composables/services/event-bus'
import { sortBy, remove } from 'lodash'
import RenderNestable from '@/components/layout/RenderNestable.vue'
// eslint-disable-next-line no-unused-vars
import nestable from 'nestable'

export default {
  name: 'BoardManagement',
  components: { RenderNestable, BoardManagerModal },
  beforeRouteEnter(to, from, next) {
    let boards, cats
    boardsApi.uncategorized()
    .then(b => boards = b)
    .then(boardsApi.unfiltered)
    .then(c => cats = c)
    .finally(() => next(vm => {
      vm.boardListData = boards
      vm.catListData = cats
      vm.cleanBoardList(cats)
      vm.generateNestableBoardData(boards)
      vm.generateNestableCatData(cats)
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
      this.boardListData = boards
      this.catListData = cats
      this.cleanBoardList(cats)
      this.generateNestableBoardData(boards)
      this.generateNestableCatData(cats)
      next()
    })
    .catch(() => {})
  },
  setup() {
    const saveListener = () => {
      console.log('Admin Save Management!')
    }
    const resetListener = () => {
      console.log('Admin Reset Management!')
    }
    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })

    // Generates nestable html for category data
    const generateCategoryList = categories => {
      let html = '<div class="dd" id="' + v.catListId + '"><ol class="dd-list">'
      let sortedCats = sortBy(categories, 'view_order')
      sortedCats.forEach(cat => {
        let dataId = getCatDataId()
        let boardIds = []
        let catBoards = cat.boards || []
        catBoards.forEach(board => boardIds.push(board.id))
        v.nestableMap[dataId] = {
          id: cat.id,
          name: cat.name,
          viewable_by: cat.viewable_by,
          children: catBoards
        }
        v.catsDataIdMap[cat.view_order] = dataId // Allows us to map catListData to nestableMap
        // Edit pencil and trash buttons
        let toolbarHtml = '<i @click="setCatDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
          '<i @click="setCatEdit(' +
          dataId + ')" class="dd-nodrag dd-right-icon fas fa-edit"></i>'
        let status = '<i class="fa status"></i>'
        html += '<li class="dd-item dd-root-item" data-cat-id="' + cat.id + '" data-id="' + dataId +
          '" data-top="true" data-name="' + cat.name + '"><div class="dd-grab-cat"></div><div class="dd-handle' +
          ' dd-root-handle">' + status + '<div class="dd-desc">' + cat.name + '</div>' +
          toolbarHtml + '</div>' + generateBoardList(cat.boards) + '</li>'
      })
      html += '</ol></div>'
      return html
    }

    // Generates nestable html elements for board data
    const generateBoardList = boards => {
      let html = '<ol class="dd-list">'
      boards.forEach((board) => {
        let dataId = getBoardDataId()

        // Store boardData within each li's data-board attr for easy access
        v.nestableMap[dataId] = {
          id: board.id,
          name: board.name,
          slug: board.slug,
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
        let status = '<i class="fa status"></i>'
        html += '<li class="dd-item" data-board-id="' + board.id + '" data-id="' + dataId + '">' +
          '<div class="dd-grab"></div><div class="dd-handle">' + status + '<div class="dd-desc">' + board.name + '<span>' + board.description + '</span></div>' +
          toolbarHtml + '</div>' + generateBoardList(board.children || []) + '</li>'
      })
      html += '</ol>'
      return html
    }

    const setCatDelete = id => {
      v.showDeleteCat = true
      console.log('setCatDelete', id)
    }
    const setCatEdit = id => {
      v.showEditCat = true
      console.log('setCatEdit', id)
    }
    const setBoardDelete = id => {
      v.showDeleteBoard = true
      console.log('setBoardDelete', id)
    }
    const setBoardEdit = id => {
      v.showEditBoard = true
      console.log('setBoardEdit', id)
    }
    const setBoardMods = id => {
      v.showEditBoardMods = true
      console.log('setBoardMods', id)
    }

    const expandAll = () => window.$('#nestable-categories').nestable('expandAll')
    const collapseAll = () => window.$('#nestable-categories').nestable('collapseAll')

    // Keeps nestable map up to date using serialized nestable data
    // this allows us to rebuild catListData when dom rebuilds to recompile nestable data
    const updateNestableMapForCats = (cats) => {
      if (!cats) return
      cats.map(cat => {
        cat.dataId = cat.id
        cat.id = cat.catId
        // console.log(cat.name, cat.children)
        v.nestableMap[cat.dataId].children = cat.children // maintain updated nestable map
        cat.boards = cat.children || []
        delete cat.catId
        delete cat.top
        delete cat.children
        updateNestableMapForBoards(cat.boards)
      })
      return cats
    }

    const updateNestableMapForBoards = catBoards => {
      if(!catBoards) return
      catBoards.map(board => {
        board.dataId = board.id
        v.nestableMap[board.dataId].children = board.children // maintain updated nestable map
        board.id = board.boardId
        delete board.boardId
        // recurse if there are children
        if (board.children && board.children.length > 0) updateNestableMapForBoards(board.children)
      })
    }

    // Rebuilds catListData using nestableMap, which contains ordering truth
    const updateCatListData = () => {
      v.catListData.map(cat => {
        cat.boards = []
        let children = v.nestableMap[v.catsDataIdMap[cat.view_order]].children
        if (children) children.forEach(c => cat.boards.push(v.nestableMap[c.dataId]))
        updateCatListDataBoards(cat.boards)
      })
    }

    const updateCatListDataBoards = catBoards => {
      if(!catBoards) return
      catBoards.map(board => {
        let newChildren = []
        console.log(v.boardsDataIdMap, board.slug)
        let children = v.nestableMap[v.boardsDataIdMap[board.slug]].children
        if (children) children.forEach(c => newChildren.push(v.nestableMap[c.dataId]))
        board.children = newChildren
        // recurse if there are children
        if (board.children.length > 0) updateCatListDataBoards(board.children)
      })
    }


    const insertNewCategory = () => {
      // serilize nestable html to get current ordering of cats, then turn into array of ids
      // The index of the id in the array determines the view order of the catListData category.
      let cats = window.$('#nestable-categories').nestable('serialize')
      // 1) updates nestable map and returns new cats in correct viewing order
      let ordering = updateNestableMapForCats(cats)
      // 2) Update catListData using nestable map (maintains moved child boards)
      updateCatListData()
      // 3) generate mapping for category ordering (uses name, id and num children for unique key)
      ordering = ordering.map(c => c.name + c.id + c.boards.length)
      // Add new category to vue controlled list of categories
      let newCat = {
        boards: [],
        created_at: null,
        id: "-1",
        imported_at: null,
        meta: null,
        name: v.newCatName,
        postable_by: null,
        updated_at: null,
        view_order: 0
      }
      v.newCategories.push(newCat) // add new cat to array of newly added cats
      v.catListData.unshift(newCat) // add newCat to catListData
      // Modifying catListData triggers watcher, recompiles html using catListData
      // Update view order using ordering array
      v.catListData.forEach(c => c.view_order = ordering.indexOf(c.name + c.id + c.boards.length))
      v.newCatName = '' // clear input for category name
    }

    const getCatDataId = () => v.catDataId++
    const getBoardDataId = () => v.boardDataId++

    // Generates nestable html for uncategorized boards
    const generateNoCatBoardsList = boards => {
      let emptyHtml = '<div class="dd-empty"></div>'
      let html = '<div class="dd" id="' + v.boardListId + '">'
      html += boards.length > 0 ? generateBoardList(boards) : emptyHtml
      html += '</div>'
      return html
    }

    const v = reactive({
      nestableMap: {},
      catsDataIdMap: {}, // DataId keyed by cat.view_order which is unique
      boardsDataIdMap: {}, // DataID keyed by board.slug TODO(akinsey): not unique prior to req
      catDataId: 0,
      boardDataId: 9999,
      catListData: null,
      nestableOpts: { protectedRoot: true, maxDepth: 5, group: 1 },
      catListId: 'categorized-boards',
      boardListId: 'uncategorized-boards',
      boardListData: null,
      newCatName: '',
      newCategories: [],
      uncompiledCatHtml: '',
      uncompiledBoardHtml: '',
      serializedCats: null,
      showEditBoard: false,
      showEditBoardMods: false,
      showDeleteBoard: false,
      showEditCat: false,
      showDeleteCat: false
    })

    const cleanBoardList = cats => cats.forEach(cat => cleanBoards(cat.boards))

    const cleanBoards = catBoards => {
      catBoards.forEach(board => {
        // remove this board from boardListData
        remove(v.boardListData, b => b.id === board.id)
        // recurse if there are children
        if (board.children.length > 0) { cleanBoards(board.children) }
      })
    }

    const generateNestableCatData = data => {
      if (!data) { data = [] }
      v.uncompiledCatHtml = null
      v.catDataId = 0
      let html = generateCategoryList(data)
      // Compile html so vue controls will work
      v.uncompiledCatHtml = html
      nextTick(() => window.$('#nestable-categories').nestable(v.nestableOpts))
    }

    const generateNestableBoardData = data => {
      if (!data) { data = [] }
      v.uncompiledBoardHtml = null
      v.boardDataId = 9999
      let html = generateNoCatBoardsList(data)
      // Compile html so vue controls will work
      v.uncompiledBoardHtml = html
      nextTick(() => window.$('#nestable-boards').nestable(v.nestableOpts))
    }

    watch(() => v.catListData, generateNestableCatData, { deep: true })

    watch(() => v.boardListData, generateNestableBoardData, { deep: true })

    return { ...toRefs(v), insertNewCategory, setCatDelete, setCatEdit, setBoardDelete, setBoardEdit, setBoardMods, generateNestableBoardData, generateNestableCatData, cleanBoardList, expandAll, collapseAll }
  }
}
</script>

<style lang="scss">
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
