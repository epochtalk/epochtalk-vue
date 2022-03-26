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
    <a ng-href="#" ng-click="showAddBoard = true" class="input-spacer button">Add New Board</a>
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

<style lang="scss">
a.input-spacer { margin-bottom: 1rem; }
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
