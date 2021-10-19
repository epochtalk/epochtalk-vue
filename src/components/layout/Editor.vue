<template>
  <div class="messages-wrap">
    <div :class="fullscreen ? 'editor-full-screen' : 'editor-fixed-right'" v-if="showEditor">
      <!-- Editor Container-->
      <div class="editor-container" :class="{ 'new-message' : editorConvoMode, 'new-thread' : threadEditorMode, 'add-poll' : threadCopy?.addPoll }">
        <!-- Draft Alert -->
        <span class="alert-form-input">{{draftStatus}}</span>

        <!-- Editor Header -->
        <div class="editor-top-bar">

          <!--  Thread Editor Mode -->
          <div v-if="threadEditorMode">
            <!-- Thread Title -->
            <div class="padded-row">
              <div class="fill-row">
                <label>Thread Title</label>
                <!-- modal-focus="{{showEditor && threadEditorMode}}" -->
                <input type="text" id="threadTitle" v-model="threadCopy.title" :class="{ 'rtl': rightToLeft }" ref="threadTitleEl">
              </div>
            </div>
            <!-- Thread Options -->
            <div class="padded-row" v-if="canLock() || canSticky() || canModerate() || canCreatePoll()">
              <div class="fill-row">
                <label>Options:</label>
                <div class="option" v-if="canLock()">
                  <input type="checkbox" id="lockThread" v-model="threadCopy.locked">
                  <label for="lockThread">Lock Thread</label>
                </div>

                <div class="option" v-if="canSticky()">
                  <input type="checkbox" id="stickyThread" v-model="threadCopy.sticky">
                  <label for="stickyThread">Sticky Thread</label>
                </div>

                <div class="option" v-if="canModerate()">
                  <input type="checkbox" id="moderateThread" v-model="threadCopy.moderated">
                  <label for="moderateThread">Moderate Thread</label>
                </div>

                <div class="option" v-if="canCreatePoll()">
                  <input type="checkbox" id="threadPoll" v-model="threadCopy.addPoll">
                  <label for="threadPoll">Add a Poll</label>
                </div>
              </div>
            </div>
          </div>

          <!--  Message Editor Mode -->
          <div v-if="editorConvoMode">
            <!-- Select User -->
            <label>To</label>
            <Multiselect v-model="msgTagsInput.value" v-bind="msgTagsInput" ref="messageReceiverEl" />
            <label>Subject</label>
            <input type="text" v-model="newMessage.content.subject" minlength="1" maxlength="255" />
            <!--  <tags-input min-length="1" placeholder="Type username(s) to message" add-from-autocomplete-only="true" replace-spaces-with-dashes="false" display-property="username" allow-leftover-text="false" ng-model="receivers" modal-focus="{{showEditor && editorConvoMode}}">
                <auto-complete min-length="1" debounce-delay="250" source="loadTags($query)"></auto-complete>
              </tags-input> -->
            <!-- Subject -->
          </div>

          <!--  Post Editor Mode -->
          <div class="buttons" v-if="postEditorMode">
            <div class="left toolbar-title" title="Click to go to this post" v-if="posting?.post?.id">
                Editing Post:&nbsp;&nbsp;<a ui-sref="posts.data({ slug: thread.slug, page: posting.post.page, '#': posting.post.id })">{{ posting.post.id }}</a>
            </div>

            <div class="toolbar-title" v-if="!posting?.post?.id">
              New Post in "{{ threadCopy?.title}}"
            </div>
          </div>

          <div class="editor-formatting" v-if="showFormatting">
            <a class="close-formatting" @click="showFormatting = false">Close</a>
            <div class="thin-underline fill-row">
              <a href="https://github.com/epochtalk/bbcode-parser" target="_blank">
                <h4>BBCode Lookup</h4>
              </a>
            </div>
            <div class="half-column">
              <strong>Bold</strong>:<div class="right">[b][/b]</div><br />
              <em>Italics</em>:<div class="right">[i][/i]</div><br />
              <u>Underline</u>:<div class="right">[u][/u]</div><br />
              <del>Strikethrough</del>:<div class="right">[s][/s]</div><br />
              BTC:<div class="right">[btc][/btc]</div><br />
              <span style="background-color: green">Glow</span>:
              <div class="right">[glow={color}][/glow]</div><br />
              <span style="text-shadow: red 1px 1px 5px;">Shadow</span>:
              <div class="right">[shadow={color}, {direction}, {blur}][/shadow]</div><br />
              Font Size:<div class="right">[size={size}][/size]</div><br />
              <sup>Superscript</sup>:<div class="right">[sup][/sup]</div><br />
              <sub>Subscript</sub>:<div class="right">[sub][/sub]</div><br />

              <hr class="clear" />

              <code class="preview">Code</code>:<div class="right">[code][/code]</div><br />

              <code>TeleText</code>:<div class="right">[tt][/tt]</div><br />
              Preformatted Text:<div class="right">[pre][/pre]</div><br />
              Justify Left:<div class="right">[left][/left]</div><br />
              Justify Right:<div class="right">[right][/right]</div><br />
              Justify Center:<div class="right">[center][/center]</div><br />

              <hr class="clear" />

              Horizontal Rule:<div class="right">[hr][/hr]</div><br /><br />
            </div>
            <div class="half-column">
              Black:<div class="right">[black][/black]</div><br />
              Blue:<div class="right">[blue][/blue]</div><br />
              Green:<div class="right">[green][/green]</div><br />
              Red:<div class="right">[red][/red]</div><br />
              White:<div class="right">[white][/white]</div><br />
              Additional Colors:<div class="right">[color={color}][/color]</div><br />

              <hr class="clear" />

              Image:<div class="right">[img]{URL}[/img]</div><br />
              URL:<div class="right">[url={URL}][/url]</div><br />
              Email:<div class="right">[email={email}][/email]</div><br />
              FTP:<div class="right">[ftp={URL}][/ftp]</div><br />

              <hr class="clear" />

              Lists:
              <div class="right">
                [list]<br />
                &nbsp;&nbsp;[li][/li]<br />
                &nbsp;&nbsp;[li][/li]<br />
                [/list]<br /><br />
              </div>

              <hr class="clear" />

              Tables:
              <div class="right">
                [table]<br />
                &nbsp;&nbsp;[tr]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;[td][/td]<br />
                &nbsp;&nbsp;[/tr]<br />
                [/table]
              </div><br />
            </div>
          </div>
        </div>

        <!-- Poll Creator -->
        <div class="fill-row" v-if="threadCopy.addPoll">
          <poll-creator @poll-validation="onPollValidation"></poll-creator>
        </div>

        <!-- Editor -->
        <form name="form" class="editor-form" novalidate>
          <!-- START EDITOR -->
          <div class="editor-header">
            <a class="first" :class="{'selected': !preview }" tabindex="-1" @click="preview = false">Compose</a>
            <a :class="{'selected': preview }" tabindex="-1" @click="preview = true">Preview</a>
          </div>

          <div class="editor-body" @dragenter.prevent="showDropzone = true" @dragover.prevent="showDropzone = true">
            <div class="editor-column-input" :class="{ 'hidden': preview }">
              <textarea class="editor-input" v-if="threadEditorMode" v-model="threadCopy.body" :class="{ 'rtl': rightToLeft }" placeholder="Write someting interesting! (BTW, you can drag and drop images directly into the editor panel)" :maxlength="postMaxLength || 10000"></textarea>
              <textarea class="editor-input" v-if="postEditorMode" v-model="posting.post.body" :class="{ 'rtl': rightToLeft }" placeholder="Enter your reply here. (BTW, you can drag and drop images directly into the editor panel)" :maxlength="postMaxLength || 10000" ref="postEditorEl"></textarea>
              <textarea class="editor-input" v-if="editorConvoMode || (!threadEditorMode && !editorConvoMode && !postEditorMode)" v-model="newMessage.content.body" :class="{ 'rtl': rightToLeft }" :placeholder="editorConvoMode ? 'Enter your message here. (BTW, you can drag and drop images directly into the editor panel)' : 'Enter your reply here. (BTW, you can drag and drop images directly into the editor panel)'" :maxlength="postMaxLength || 10000" ref="messageEditorEl"></textarea>
              <div class="editor-drag-container" :class="{ 'visible': showDropzone}">
                <div class="editor-drag">
                  <div class="editor-drag-text">Drag and Drop Images</div>
                </div>
              </div>
            </div>
            <div class="editor-column-preview"  :class="{ 'hidden': !preview }">
              <!-- TODO(akinsey): post-processing="bodyHtml" style-fix="false" -->
              <div class="editor-preview" :class="{ 'rtl': rightToLeft }" ></div>
            </div>
          </div>

          <div class="editor-footer">
            <div class="editor-image-uploader">
              <image-uploader purpose="editor" @upload-success="() => {}" @upload-error="() => {}" :show-dropzone="showDropzone" @hover-stop="showDropzone = false" />
            </div>
          </div>
          <!-- END EDITOR -->
        </form>

        <div class="editor-tools">
          <div class="tools">
            <a href="#" data-balloon="Formatting Help" @click.prevent="showFormatting = !showFormatting"><i class="fa fa-code"></i></a>
            <a href="#" :data-balloon="fullscreen ? 'Minimize' : 'Fullscreen'" @click.prevent="fullscreen = !fullscreen"><i class="fa expand" :class="{ 'fa-expand': !fullscreen, 'fa-compress': fullscreen }"></i></a>
          </div>
        </div>

        <!-- Message Editor Controls -->
        <div class="editor-button-container" v-if="!threadEditorMode && !postEditorMode">
          <button class="inverted-button cancel" @click="cancel()">
            Cancel
          </button>
          <button class="no-animate send" v-if="editorConvoMode" @click.prevent="createAction().then(closeEditor);" :disabled="!canCreate() || !newMessage.content.body.length || !newMessage.content.subject.length || !receivers.length">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Send
          </button>
          <button class="no-animate send" v-if="!editorConvoMode" @click.prevent="updateAction().then(closeEditor);" :disabled="!canUpdate() || !newMessage.content.body.length">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Send Reply
          </button>

          <span class="label alert" v-if="posting.error" v-html="posting.error.message"></span>
        </div>

        <!-- Post Editor Controls -->
        <div class="editor-button-container" v-if="postEditorMode">
          <button class="inverted-button cancel" @click="cancel()">
            Cancel
          </button>
          <button class="send" @click.prevent="createAction(posting.post).then(closeEditor);" :disabled="!canCreate()">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;{{ posting?.post?.id ? 'Edit Post' : 'Send Reply' }}
          </button>

          <span class="label alert" v-if="posting.error" v-html="posting.error.message"></span>
        </div>

        <!-- Thread Editor Controls -->
        <div class="editor-button-container" v-if="threadEditorMode">
          <button class="inverted-button cancel" @click="cancel()">
            Cancel
          </button>
          <button class="send" @click.prevent="createAction(threadCopy).then(closeEditor);" :disabled="!threadCopy?.title.length || !canCreate() || (threadCopy.addPoll && !threadCopy.pollValid)">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Start Thread
          </button>

          <span class="label alert" v-if="posting.error" v-html="posting.error.message"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, watch, nextTick } from 'vue'
// import { useRoute, useRouter } from 'vue-router'
import ImageUploader from '@/components/images/ImageUploader.vue'
import PollCreator from '@/components/polls/PollCreator.vue'
import Multiselect from '@vueform/multiselect'
import { usersApi } from '@/api'

export default {
  props: ['editorConvoMode', 'threadEditorMode', 'postEditorMode', 'createAction', 'updateAction', 'showEditor', 'thread' ],
  emits: ['close'],
  components: { ImageUploader, PollCreator, Multiselect },
  setup(props, { emit }) {
    /* Internal Methods */
    const canCreate = () => true
    const canUpdate = () => true
    const canLock = () => true
    const canSticky = () => true
    const canModerate = () => true
    const canCreatePoll = () => true
    const cancel = () => emit('close')
    const closeEditor = () => emit('close')
    /* Internal Data */
    // const $route = useRoute()
    // const $router = useRouter()

    /* View Data */
    const v = reactive({
      isMinimized: true,
      threadCopy: props.thread,
      fullscreen: false,
      showFormatting: false,
      preview: false,
      showEditor: props.showEditor,
      showDropzone: false,
      draftStatus: null,
      receivers: [],
      postMaxLength: window.post_max_length,
      posting: { post: { title: '', body: '', thread_id: props?.thread?.id }},
      newMessage: { content: { subject: '', body: '' } },
      rightToLeft: false,
      threadTitleEl: null,
      msgTagsInput: {
        mode: 'tags',
        value: [],
        placeholder: 'Type username(s) to message',
        noOptionsText: 'Enter a username to start lookup...',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          return await usersApi.lookup(q, { restricted: true })
          // convert array into array of objects
          .then(d => d.map(u =>{ return { label: u.username, value: { username: u.username, user_id: u.id } } }))
          .catch(() => { return [] })
        }
      }
    })

    watch(() => props.thread, t => {
      v.posting.post.thread_id = t.id
      v.posting.post.title = t.title
    })

    watch(() => props.showEditor, visible => {
      console.log(visible, props.threadEditorMode)
      if (visible && props.threadEditorMode) nextTick(() => v.threadTitleEl.focus())
    })

    return { ...toRefs(v), canLock, canCreate, canUpdate, canSticky, canModerate, canCreatePoll, cancel, closeEditor }
  }
}
</script>

<style lang="scss">
  .editor-container {
    z-index: 5000;
    display: flex;
    flex-direction: column;
  }
  .editor-fixed-bottom {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 1000;
  }
  .editor-fixed-right {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: calc(((100vw - 1300px)/2) + 240px);
    z-index: 5000;
    @include break-max-xlarge { width: calc(#{$sidebarWidth} + #{$base-grid-padding}); }
    @include break-mobile-sm {
      top: initial;
      left: 0;
      bottom: 0;
      bottom: 0;
      width: 100%;
      // height: calc(100vh - 6rem);
      height: 100%;
      box-shadow: 0 8px 16px rgba(0, 0, 0, .2);
      z-index: 5000;
    }
  }
  .editor-full-screen {
    width: calc(100vw - 4rem);
    position: fixed;
    bottom: 0;
    top: 0;
    right: 0;
    // z-index: 3000;
    @include break-mobile-sm {
      top: initial;
      left: 0;
      bottom: 0;
      bottom: 0;
      width: 100%;
      height: calc(100vh - 80px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, .5);
      z-index: 9000;
    }
  }

  .post-toolbar {
    position: fixed;
    bottom: 1.25rem;
    list-style: none;
    right: 1.25rem;
    z-index: 10;
    margin: 0;
    li {
      color: #fff;
      background-color: $color-primary;
      cursor: pointer;
      padding: 0 1.0625rem;
      line-height: 3rem;
      height: 3rem;
      -webkit-border-radius:  1.5625rem;
      -moz-border-radius:     1.5625rem;
      border-radius:          1.5625rem;
      box-shadow: 0px 0.3125rem 0.625rem rgba(0, 0, 0, 0.1);
      span {
        font-weight: bold;
        font-size: 1.25rem;
      }
    }
  }

  .editor-container {
    background-color: $base-background-color;
    display: flex;
    position: relative;
    height: 100vh;
    border: 1px solid $border-color;
    border-bottom: 0;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
    z-index: 5000;
    @include break-mobile-sm { height: 100%; }
  }

  .editor-container-bar {
    display: block;
    position: absolute;
    top: 5px;
    left: 40%;
    right: 40%;
    height: 10px;
    z-index: 10;
    cursor: ns-resize;
    .bar {
      height: 5px;
      width: 35px;
      border-radius: 10px;
      background-color: gray;
      margin: auto;
    }
  }

  .editor-top-bar {
    .toolbar-title {
      font-size: $font-size-xs;
      width: 90%;
      padding-top: 15px;
      color: $secondary-font-color;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      .underline { text-decoration: underline; }
      a { color: $color-primary; }
    }
    button {
      height: 25px;
      padding: 2px 10px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    .editor-formatting {
      position: absolute;
      top: 10px;
      bottom: 83px;
      left: 10px;
      right: 10px;
      background-color: $sub-header-color;
      z-index: 10;
      overflow: auto;
      padding: 2rem;
      border: 1px solid $border-color;
      h4 {  color: $color-primary; }
      .clear { clear: both; }
      .close-formatting {
        cursor: pointer;
        line-height: 1;
        font-weight: bold;
        color: $secondary-font-color;
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }
  }

  .editor-form {
    flex: 3 0 auto;
    display: flex;
    flex-direction: column;
    label {
      color: $secondary-font-color-light;
      margin-top: 0;
    }
    .editor-body {
      width: 100%;
      flex: 1 0 auto;
      display: flex;
      .editor-column-input {
        flex: 1 0 auto;
        height: auto;
      }
      input[type],
      .editor-input,
      .editor-preview {
        color: $base-font-color;
        background-color: $base-background-color;
        border: 0;
        border-top: 1px solid $border-color;
        border-bottom: 1px solid $border-color;
        padding: 1rem;
        resize: none;
        ul, ol { margin-left: 1.25rem; }
        ul { white-space: normal; }
      }
      .editor-drag-container {
        display: none;
        position: absolute;
        top: 0;
        z-index: 899;
        left: 0;
        right: 0;
        text-align: center;
        height: 100%;
        margin: 0rem;
        &.visible { display: block; }
        .editor-drag {
          position: relative;
          top: 50%;
          height: 75%;
          margin: 0px 4%;
          border: 0.5rem dashed rgba($border-color, 0.9);
          background-color: rgba($sub-header-color, 0.75);
          transform: translateY(-50%);
          bottom: -14rem;
          .editor-drag-text {
            position: relative;
            top: 50%;
            transform: translateY(-50%);
            color: $secondary-font-color-dark;
            font-size: 2rem;
          }
        }
      }
    }

    .editor-column-input,
    .editor-column-preview {
      height: 100%;
      &.hidden { display: none; }
    }
    .editor-input {
      white-space: pre-wrap;
      overflow: auto;
      height: 100%;
      p { margin: 0; }
      span {
        font-family: inherit;
        font-size: 1rem;
        line-height: 1.6;
      }
    }
    .editor-preview {
      white-space: pre-wrap;
      overflow: auto;
      height: 100%;
      word-wrap: break-word;
      p { margin: 0; }
    }
    .editor-footer {
      color: $secondary-font-color-light;
      font-size: .875rem;
      position: absolute;
      bottom: 0px;
      width: 100%;
      background-color: $base-background-color;
      height: 3rem;
      border-top: 1px solid $border-color;
      .upload-editor {
        text-align: left;
        padding-left: 1rem;
        position: absolute;
        top: -1.35rem;
        z-index: 500;
        a {
          color: $secondary-font-color-dark;
          &:hover { color: $secondary-font-color; }
        }
      }
    }
    .editor-images-container {
      height: 100%;
      padding-left: 0px;
      padding-right: 5px;
      line-height: 3rem;
    }
    .editor-image-uploader {
      display: block;
      width: 100%;
      text-align: center;
    }
    .editor-images {
      height: 100%;
      width: 100%;
    }
    .editor-images:hover {
      background: rgba(0,0,0,0.1);
      border: 2px dashed $secondary-font-color-dark;
      padding-top: 9px;
    }
  }

  .editor-button-container.admin {
    padding-left: $base-grid-padding;
    padding-right: $base-grid-padding;
  }

  .editor-form.admin .editor-footer {
    left: 0;
    width: 100%;
    .progress-editor {
      margin-left: 0;
      @include break-mobile-sm { margin-left: 0; }
    }
    .upload-editor { margin-left: 0; }
  }
  .child-elements { pointer-events: none; }
  .editor-tools {
    color: $secondary-font-color-dark;
    flex: 0 0 auto;
    padding: 0 1rem;
    line-height: 1.5rem;
    a {
      color: $secondary-font-color-dark;
      &:hover { color: $secondary-font-color; }
    }
    .tools {
      width: 100%;
      text-align: right;
      .expand { margin-left: 1rem; }
    }
  }
  .editor-form div label { margin-top: 10px; }
  .editor-form small {
    display: block;
    line-height: 1;
    padding: 0.25rem 0.5rem 0.375rem;
    font-size: 0.6875rem;
    margin: 0;
  }
  .editor-button-container {
    flex: 0 0 auto;
    padding: 0.5rem 1rem;
    height: 3rem;
    text-align: right;
    width: 100%;
    button {
      margin-right: 1.9%;
      padding: 0.35rem 1rem;
      &:last-child { margin-right: 0; }
      &.send { display: inline-block; border: 1px solid transparent; }
      &.cancel {
        background-color: transparent;
        color: $secondary-font-color;
        display: inline-block;
        &:hover { color: $color-primary; }
      }
    }
  }
  .editor-form.new-thread {
    .editor-header a {
      line-height: 1rem;
      height: 1.45rem;
    }
    .editor-body .editor-input, .editor-body .editor-preview { border: 1px solid $border-color; }
    .editor-footer {
      border-top: 0;
      height: 0;
      .progress .meter { margin-top: -0.5rem; }
      .upload-editor {
        width: $max-width;
        padding-left: 0;
        i::after{
          font-family: $base-font-sans;
          margin-left: 0.35rem;
          content: "Click here or drag and drop images in the compose pane to upload";
          @include break-mobile-sm {
            content: "Click here to upload images";
          }
        }
      }
    }
    .editor-body { bottom: 2rem; }
  }
  .image-picker {
    .header {
      background-color: #4b4b4b;
      color: #777777;
      padding-left: 5px;
      border-bottom: 5px solid #ccc;
      font-size: smaller;
    }
    .picker-body {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .picker-body img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .thread-editor-container {
    position: relative;
    background-color: $base-background-color;
    height: 500px;
  }
  .thread-editor-container > .editor-form { top: 0px; }
  .editor-preview .imageContainer { display: inline; }
  .editor-header {
    a {
      font-size: $font-size-xs;
      line-height: 2.75rem;
      display: inline-block;
      height: 2.2rem;
      width: 6rem;
      text-align: center;
      text-transform: uppercase;
      color: $secondary-font-color-dark;
      &.first { margin-left: 0.25rem; }
      &.selected { color: $color-primary; border-bottom: 2px solid $color-primary; }
    }
  }
  .editor-header, .editor-body, .editor-footer, .editor-top-bar {
    width: 100%;
    padding: 0;
    .editor-column-input {
      // @include span-columns(12);
      width: 100%;
    }
    .editor-column-preview {
      width: 100%;
      // @include span-columns(12);
      // @include omega;
    }
  }
  .editor-header { flex: 0 0 auto; }
  @include break-mobile-sm {
    .editor-form .editor-body {
      bottom: 5rem;
      top: 42px;
    }
    .editor-form .editor-header {
      height: 2.6rem;
      line-height: 3.5rem;
    }
    .editor-tools {
      bottom: 2.5rem;
      height: 2.5rem;
      line-height: 2.5rem;
      padding: 0 2rem;
      left: 50vw;
      z-index: 999;
      a {
        font-size: 1.25rem;
        height: 100%;
        display: inline-block;
        padding: 0 0.5rem;
        &:last-child { margin-right: -0.5rem; }
      }
      .tools {
        float: none;
        height: 100%;
        .expand { margin-left: 0; }
      }
    }
    .editor-button-container {
      padding: 0 $base-grid-padding;
      height: 2.5rem;
      padding-top: 0.425rem;
      border-top: 1px solid $border-color;
      button {
        // @include span-columns(4);
        // @include omega(2n);
        margin-bottom: 0;
        padding: 0.15rem 0.76rem;
      }
    }
    .editor-form .editor-footer {
      background-color: transparent;
      border: 0;
      .upload-editor {
        top: -2rem;
        padding-left: 2rem;
        height: 2.5rem;
        line-height: 2.5rem;
        span a { font-size: 0.875rem; }
        a {
          i { font-size: 0.875rem; }
          font-size: 1.25rem;
          height: 100%;
          display: inline-block;
          padding: 0 0.5rem;
          margin-left: -0.5rem;
        }
      }
    }
  }
  .thread-editor-container {
    .editor-form {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      div label, .editor-form div label { margin: 0; color: $secondary-font-color-dark; }
      .editor-body { top: 1.5625rem; }
      .editor-header, .editor-body, .editor-top-bar { @include pad(0); }
      .editor-footer { padding-left: 0; padding-right: 0; color: $secondary-font-color-dark; }
      .editor-images-container { @include pad(0); }
    }
    @include break-mobile-sm {
      height: 300px;
      // .editor-column-left { @include span-columns(8); @include omega; }
      .editor-form .editor-body { bottom: 2.5rem; top: 2.7rem; }
    }
  }
  .editor-fixed-bottom, .editor-full-screen {
    // .editor-images-container { @include span-columns(6); @include pad(0); }
    .editor-button-container {
    }
    @include break-mobile-sm {
      .editor-top-bar .buttons {
        width: 100%;
        padding: 0 $base-grid-padding;
      }
      .editor-top-bar button:first-child { float: left; }
      .editor-top-bar button:first-child { float: left; }
      .editor-top-bar, .editor-body, .editor-header { padding: 0; }
      // .editor-column-left { @include span-columns(8); @include omega; }
      .editor-formatting h4 { display: inline-block; }
    }
  }
  .post-editor-overlay {
    background: rgba(0, 0, 0, 0.15);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }
  .messages-wrap {
    position: relative;
    z-index: 5000;
    .new-thread.add-poll .editor-form { top: 49.4375rem; }
    .editor-button-container { padding: 0.5rem;}
    .progress-editor { margin-left: 0; }
    .editor-footer {
      left: 0;
      width: 100%;
      .upload-editor {
        margin-left: 0px;
        padding-left: 1rem;
      }
    }
    .new-message .editor-top-bar {
      flex: 0 0 auto;
      height: auto;
      padding: 1rem;
      padding-bottom: 0;
    }
    .new-thread .editor-top-bar {
      padding: 1rem;
      div:first-child {
        padding: 0;
        text-align: left;
      }
    }
  }
</style>
