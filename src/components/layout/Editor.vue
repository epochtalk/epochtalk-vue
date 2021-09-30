<template>
  <div class="messages-wrap">
    <div :class="editorPosition" v-if="showEditor">
      <!-- Editor Container-->
      <div class="editor-container" :class="{ 'new-message' : editorConvoMode, 'new-thread' : threadEditorMode, 'add-poll' : thread.addPoll }">
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
                <input type="text" id="threadTitle" v-model="thread.title" :class="{ 'rtl': rightToLeft }">
              </div>
            </div>
            <!-- Thread Options -->
            <div class="padded-row" v-if="canLock() || canSticky() || canModerate() || canCreatePoll()">
              <div class="fill-row">
                <label>Options:</label>
                <div class="option" v-if="canLock()">
                  <input type="checkbox" id="lockThread" v-model="thread.locked">
                  <label for="lockThread">Lock Thread</label>
                </div>

                <div class="option" v-if="canSticky()">
                  <input type="checkbox" id="stickyThread" v-model="thread.sticky">
                  <label for="stickyThread">Sticky Thread</label>
                </div>

                <div class="option" v-if="canModerate()">
                  <input type="checkbox" id="moderateThread" v-model="thread.moderated">
                  <label for="moderateThread">Moderate Thread</label>
                </div>

                <div class="option" v-if="canCreatePoll()">
                  <input type="checkbox" id="threadPoll" v-model="thread.addPoll">
                  <label for="threadPoll">Add a Poll</label>
                </div>
              </div>
            </div>
          </div>

          <!--  Message Editor Mode -->
          <div v-if="editorConvoMode">
            <!-- Select User -->
            <label>To</label>
            <input type="text"></div>
           <!--  <tags-input min-length="1" placeholder="Type username(s) to message" add-from-autocomplete-only="true" replace-spaces-with-dashes="false" display-property="username" allow-leftover-text="false" ng-model="receivers" modal-focus="{{showEditor && editorConvoMode}}">
                <auto-complete min-length="1" debounce-delay="250" source="loadTags($query)"></auto-complete>
              </tags-input> -->
            <!-- Subject -->
            <label>Subject</label>
            <input type="text" v-model="newMessage.content.subject" minlength="1" maxlength="255" />
          </div>

          <!--  Post Editor Mode -->
          <div class="buttons" v-if="postEditorMode">
            <div class="left toolbar-title" title="Click to go to this post" v-if="posting.post.id">
                Editing Post:&nbsp;&nbsp;<a ui-sref="posts.data({ slug: thread.slug, page: posting.post.page, '#': posting.post.id })">{{ posting.post.id }}</a>
              </a>
            </div>

            <div class="toolbar-title" v-if="!posting.post.id">
              New Post in "{{ thread.title}}"
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
              <tt>TeleText</tt>:<div class="right">[tt][/tt]</div><br />
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
<!--         <poll-creator poll="thread.poll" valid="thread.pollValid" ng-if="thread.addPoll"></poll-creator> -->

        <!-- Editor -->
        <form name="form" class="editor-form" novalidate>
          <!-- START EDITOR -->
          <div class="editor-header">
            <a class="first" :class="{'selected': !preview }" tabindex="-1" @click="preview = false">Compose</a>
            <a :class="{'selected': preview }" tabindex="-1" @click="preview = true">Preview</a>
          </div>

          <div class="editor-body">
            <div class="editor-column-input" :class="{ 'hidden': preview }">
              <textarea class="editor-input" :class="{ 'rtl': rtl }" placeholder="Enter your reply here. (BTW, you can drag and drop images directly into the editor panel)" :maxlength="{{post_max_length || 10000 }}"></textarea>
              <div class="editor-drag-container">
                <div class="editor-drag">
                  <div class="editor-drag-text">Drag and Drop Images</div>
                </div>
              </div>
            </div>
            <div class="editor-column-preview"  :class="{ 'hidden': !preview }">
              <!-- TODO(akinsey): post-processing="bodyHtml" style-fix="false" -->
              <div class="editor-preview" :class="{ 'rtl': rtl }" ></div>
            </div>
          </div>

          <div class="editor-footer">
<!--             <image-uploader class="editor-image-uploader" purpose="editor" reset="resetImages" on-done="insertImageUrl(data)"></image-uploader> -->
          </div>
          <!-- END EDITOR -->
        </form>

        <div class="editor-tools">
          <div class="tools">
            <a data-balloon="Formatting Help" @click="showFormatting = true"><i class="fa fa-code"></i></a>
            <a :data-balloon="{{ isMinimized ? 'Expand Editor' : 'Minimize Editor' }}" @click="fullscreen()"><i class="fa expand" :class="{ 'fa-expand': isMinimized, 'fa-compress': !isMinimized }"></i></a>
          </div>
        </div>

        <!-- Message Editor Controls -->
        <div class="editor-button-container" v-if="!threadEditorMode && !postEditorMode">
          <button class="inverted-button cancel" @click="cancel()">
            Cancel
          </button>
          <button class="no-animate send" v-if="editorConvoMode" @click="createAction().then(closeEditor);"  :disabled="form.title.$error.required || !canCreate() || !newMessage.content.body.length || !newMessage.content.subject.length || !receivers.length">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Send
          </button>
          <button class="no-animate send" v-if="!editorConvoMode" class="send" @click="updateAction().then(closeEditor);" :disabled="form.title.$error.required || !canUpdate() || !newMessage.content.body.length">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Send Reply
          </button>

          <span class="label alert" v-if="posting.error" v-html="posting.error.message"></span>
        </div>

        <!-- Post Editor Controls -->
        <div class="editor-button-container" ng-if="postEditorMode">
          <button class="inverted-button cancel" ng-click="cancel()">
            Cancel
          </button>
          <button class="send" ng-click="createAction().then(closeEditor);" ng-disabled="form.title.$error.required || !canCreate()">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;{{ posting.post.id ? 'Edit Post' : 'Send Reply' }}
          </button>

          <span class="label alert" ng-if="posting.error" ng-bind="posting.error.message"></span>
        </div>

        <!-- Thread Editor Controls -->
        <div class="editor-button-container" ng-if="threadEditorMode">
          <button class="inverted-button cancel" ng-click="cancel()">
            Cancel
          </button>
          <button class="send" ng-click="createAction().then(closeEditor);" ng-disabled="!thread.title.length || form.title.$error.required || !canCreate() || (thread.addPoll && !thread.pollValid)">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Start Thread
          </button>

          <span class="label alert" ng-if="posting.error" ng-bind="posting.error.message"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
// import { useRoute, useRouter } from 'vue-router'

export default {
  props: ['editorConvoMode', 'threadEditorMode', 'postEditorMode', 'createAction'],
  setup(props) {

    const canLock = () => true
    const canSticky = () => true
    const canModerate = () => true
    const canCreatePoll = () => true
    const fullscreen = () => console.log('fullscreen')
    const cancel = () => showEditor = false
    const closeEditor = () => showEditor = false
    /* Internal Data */
    // const $route = useRoute()
    // const $router = useRouter()

    /* View Data */
    const v = reactive({
      isMinimized: true,
      editorPosition: null,
      showFormatting: false,
      preview: false,
      showEditor: false,
      draftStatus: null,
      receivers: [],
      posting: {},
      newMessage: { content: { subject: '', body: '', subject: '' } }
      rightToLeft: false,
      rtl: false
    })

    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">

</style>
