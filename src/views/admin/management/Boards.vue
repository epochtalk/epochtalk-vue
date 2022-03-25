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
        <a ng-click="expandAll()"><i class="fa fa-expand"></i> Expand</a>&nbsp;
        <a ng-click="collapseAll()"><i class="fa fa-compress"></i> Collapse</a>
      </div>
    </h5>
    <div id="nestable-categories"></div>
  </div>
  <div>
    <a ng-href="#" ng-click="showAddBoard = true" class="input-spacing button">Add New Board</a>
    <h5 class="thin-underline">Uncategorized Boards
      <span class="info-tooltip" data-balloon="Drag the boards from the Uncategorized Boards list to the Categorized Boards list to make them visible to the public. Boards left in the Uncategorized Boards list will be inaccessable and hidden from public view" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>
    <!-- <nestable-boards></nestable-boards> -->
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, watch } from 'vue'
import { boardsApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import { sortBy } from 'lodash'
import $ from 'jquery'
// eslint-disable-next-line no-unused-vars
// import * as nestable from 'nestable'

export default {
  name: 'BoardManagement',
  beforeRouteEnter(to, from, next) {
    boardsApi.unfiltered().then(data => next(vm => vm.catListData = data))
  },
  beforeRouteUpdate(to, from, next) {
     boardsApi.unfiltered().then(data => {
      this.catListData = data
      next()
    })
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
        let dataId = getDataId()
        let boardIds = []
        let catBoards = cat.boards || []
        catBoards.forEach(board => boardIds.push(board.id))
        v.nestableMap[dataId] = {
          id: cat.id,
          name: cat.name,
          viewable_by: cat.viewable_by,
          children: catBoards
        }
        // Edit pencil and trash buttons
        let toolbarHtml = '<i @click="setCatDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
          '<i @click="setEditCat(' +
          dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>'
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
      boards.forEach(function(board) {
        let dataId = getDataId()

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
        let toolbarHtml = '<i @click="setBoardDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i><i @click="setEditBoard(' +
          dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i><i @click="setModBoard(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-user"></i>'
        let status = '<i class="fa status"></i>'
        html += '<li class="dd-item" data-board-id="' + board.id + '" data-id="' + dataId + '">' +
          '<div class="dd-grab"></div><div class="dd-handle">' + status + '<div class="dd-desc">' + board.name + '<span>' + board.description + '</span></div>' +
          toolbarHtml + '</div>' + generateBoardList(board.children || []) + '</li>'
      })
      html += '</ol>'
      return html
    }

    const insertNewCategory = () => {
      let category = { name: v.newCatName }

      if (category.name) {
        let dataId = getDataId()
        // Update hashmap of list items
        v.nestableMap[dataId] = { id: -1, name: category.name }
        category.dataId = dataId
        v.newCategories.push(category)

        // Edit pencil and trash buttons
        let toolbarHtml = '<i @click="setCatDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
          '<i @click="setEditCat(' +
            dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>'
        let status = '<i class="fa status modified"></i>'
        let newCatHtml = '<li class="dd-item dd-root-item" data-cat-id="' + -1 + '"  data-id="' + dataId + '" data-top="true" data-name="' + category.name +
          '"><div class="dd-grab-cat"></div><div class="dd-handle dd-root-handle">' +
          status + '<div class="dd-desc">' + category.name + '</div>' + toolbarHtml + '</div></li>'

        // Compile and prepend new category html
        $('#' + v.catListId + ' > .dd-list').prepend(newCatHtml)
        $('#' + v.catListId).nestable(v.catListOpts)
      }
      v.newCatName = ''
    }

    const getDataId = () => v.dataId++

    const v = reactive({
      nestableMap: {},
      dataId: 0,
      catListData: null,
      catListOpts: { protectedRoot: true, maxDepth: 5, group: 1 },
      catListId: 'categorized-boards',
      boardListId: 'uncategorized-boards',
      newCatName: '',
      newCategories: [],
      compiledHtml: ''
    })

    watch(() => v.catListData, data => {
      if (!data) { data = [] }
      let html = generateCategoryList(data)
      // Compile html so angular controls will work
      let compiledHtml = html
      console.log( document.getElementById('nestable-categories').innerHTML = compiledHtml)
      $('#nestable-categories').html(compiledHtml)
    }, { deep: true })

    return { ...toRefs(v), insertNewCategory }
  }
}
</script>

<style lang="scss" scoped>
a.input-spacing { margin-bottom: 1rem; }
</style>
