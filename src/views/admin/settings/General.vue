<template>
  <!-- Forum Configurations -->
  <div class="settings-col" v-if="config">
    <h4 v-if="config.revision">Running version <a href="https://github.com/epochtalk/epochtalk/commits/{{config.revision}}">{{config.revision}}</a><br /><br /></h4>
    <div class="setting-row">
      <h5 class="thin-underline">
        Forum Configurations
        <span class="info-tooltip" data-balloon="General configurations which allow you to restrict/grant access to your forum" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </h5>
    </div>
    <div class="setting-row switch">
      <div class="switch-desc">
        <label for="public-forum">
          Private Forum
        </label>
        <label class="desc-label" for="public-forum">Guests must register to view forum content</label>
      </div>
      <div class="switch-block">
        <!-- ng-true-value="false" ng-false-value="true" -->
        <input id="public-forum" class="toggle-switch" type="checkbox" v-model="config.login_required">
        <label for="public-forum"></label>
      </div>
    </div>
    <div class="setting-row switch">
      <div class="switch-desc">
        <label for="verify-registration">
          Verify Registration
        </label>
        <label class="desc-label" for="verify-registration">Users must verify their accounts via email when registering</label>
      </div>
      <div class="switch-block">
        <input id="verify-registration" class="toggle-switch" type="checkbox" v-model="config.verify_registration">
        <label for="verify-registration"></label>
      </div>
    </div>
    <div class="setting-row switch">
      <div class="switch-desc">
        <label for="invite-only">Invite Only</label>
        <label class="desc-label" for="invite-only">Disable public registration</label>
      </div>
      <div class="switch-block">
        <input id="invite-only" class="toggle-switch" type="checkbox" v-model="config.invite_only">
        <label for="invite-only"></label>
      </div>
    </div>
    <div class="setting-row switch">
      <div class="switch-desc">
        <label for="post-max-length">Max Post Length</label>
        <label class="desc-label" for="post-max-length">The number of characters allowed per post</label>
      </div>
      <div class="switch-block">
        <input id="post-max-length" type="number" min="100" max="25000" v-model="config.post_max_length">
      </div>
    </div>
    <!-- Portal Configurations -->
    <div class="setting-row">
      <h5 class="thin-underline section-header-top-spacing">
        Portal Configurations
        <span class="info-tooltip" data-balloon="Enabling portal mode allows you to choose a specific board to be the main feed of the homepage as opposed to a listing of all the boards" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </h5>
      <div class="setting-row switch">
        <div class="switch-desc">
          <label for="public-forum">Enable Portal</label>
          <label class="desc-label" for="public-forum">Default the homepage to the portal</label>
        </div>
        <div class="switch-block">
          <input id="portal-enabled" class="toggle-switch" type="checkbox" v-model="config.portal.enabled">
          <label for="portal-enabled"></label>
        </div>
      </div>
      <div class="setting-row">
        <label for="portal-boardId">Board to Show</label>
        <div class="control-full-width">
          <select name="boards" id="portal-boardId" v-model="config.portal.board_id">
            <option value="" disabled hidden>Select a Board to display in the Portal</option>
            <optgroup v-for="(boards, parentName) in boardsMovelist" :label="parentName" :key="parentName">
              <option v-for="board in boards" :value="board.id" :key="decode(board.name)">{{decode(board.name)}}</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>

    <!-- MOTD -->
    <div class="settings-row" v-if="motdData">
      <h5 class="thin-underline section-header-top-spacing">
        Announcement Configuration
        <span class="info-tooltip" data-balloon="Allows the forum owners to create an announcements which can be broadcast across the whole forum, or just the main page" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </h5>
      <div class="setting-row switch">
        <div class="switch-desc">
          <label for="main-only">Main Page Only</label>
          <label class="desc-label" for="main-only">If enabled, the announcement is only shown on the main page. If disabled, the announcement is show on every page</label>
        </div>
        <div class="switch-block">
          <input id="main-only" class="toggle-switch" type="checkbox" v-model="motdData.main_view_only">
          <label for="main-only"></label>
        </div>
      </div>
      <label for="motd">Announcement Text</label>
      <label class="desc-label">
        This is an announcement message that will be shown at the
        top of the page to all users.
      </label>
      <textarea id="motd" v-model="motdData.motd"></textarea>
      <!-- TODO(akinsey): implement preview for motd -->
      <label v-if="motdData.preview?.length">Announcement Preview</label>
      <div v-if="motdData.preview?.length" class="boxed-section">
        <div class="content" post-processing="motdData.preview" style-fix="false"></div>
      </div>
    </div>

    <!-- Analytics -->
    <div class="setting-row">
      <h5 class="thin-underline section-header-top-spacing">
        Google Analytics
        <span class="info-tooltip" data-balloon="Enter your Google Analytics Key to enable analytics of the forum" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </h5>
      <label for="google-analytics-key">Google Analytics Key</label>
      <input type="text" class="input-text" id="google-analytics-key" v-model="config.ga_key" placeholder="UA-XXXXX-Y" />
    </div>

    <!-- SMTP Configurations -->
    <div class="setting-row" v-if="!config.saas_mode">
      <h5 class="thin-underline section-header-top-spacing">
        SMTP Configurations
        <span class="info-tooltip" data-balloon="SMTP settings must be configured in order for the forum to send emails for forum invites, registration verifications or to reset your password" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </h5>
      <div>
        <label for="smtp-sender">SMTP Sender Email Address</label>
        <input type="text" class="input-text" id="smtp-sender" v-model="config.emailer.sender" placeholder="Example: ept@epochtalk.com" />
      </div>
      <div class="input-nine-three-col">
        <div>
          <label for="smtp-server">SMTP Server</label>
          <input type="text" class="input-text" id="smtp-server" v-model="config.emailer.options.host" placeholder="Example: http://smtp.gmail.com" />
        </div>
        <div>
          <label for="smtp-port">SMTP Port</label>
          <input type="text" class="input-text" id="smtp-port" v-model="config.emailer.options.port" placeholder="Example: 587" />
        </div>
      </div>
      <div class="input-two-col">
        <div>
          <label for="smtp-username">SMTP Username</label>
          <input type="text" class="input-text" id="smtp-username" v-model="config.emailer.options.auth.user" placeholder="Username" />
        </div>
        <div>
          <label for="smtp-password">SMTP Password</label>
          <input class="secret" type="password" id="smtp-password" v-model="config.emailer.options.auth.pass" placeholder="Password" />
        </div>
      </div>
    </div>
  </div>

  <div class="settings-col" v-if="config">
    <div class="setting-row">
      <h5 class="thin-underline">
        Web Configurations
        <span class="info-tooltip" data-balloon="Web configurations will affect how your forum is picked up by search engines. Setting website logo and website favicon will allow you to brand the forum" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </h5>
      <label for="website-title">Website Title</label>
      <input type="text" class="input-text" id="website-title" v-model="config.website.title" placeholder="Example: Epochtalk Forums" />
      <label for="website-description">Website Description</label>
      <input type="text" class="input-text" id="website-description" v-model="config.website.description" placeholder="Example: Support forums for Epochtalk software" />
      <label for="website-keywords">Website Keywords</label>
      <input type="text" class="input-text" id="website-keywords" v-model="config.website.keywords" placeholder="Example: epochtalk, forum, open source, support" />
      <!-- TODO(akinsey): <image-uploader  model="config.website.logo" purpose="logo"></image-uploader> -->
      <div class="row">
        <div class="column">
          <label for="website-logo-upload-btn">Website Logo</label>
          <input type="text" class="input-text upload-input" v-model="config.website.logo" placeholder="default_logo.png" />
          <div class="upload-err">{{ logoError ? 'Selected image exceeds 100kB' : null }}</div>
          <image-uploader purpose="avatar" inputId="website-logo" @upload-success="url => { config.website.logo = url; logoError = null }" @upload-error="err => logoError = err" />
        </div>
        <div class="column">
          <label for="website-favicon-upload-btn">Website Favicon</label>
          <!-- TODO(akinsey): <image-uploader class="editor-image-uploader" model="config.website.favicon" purpose="favicon"></image-uploader> -->
          <input type="text" class="input-text upload-input" v-model="config.website.favicon" placeholder="favicon.ico" />
          <div class="upload-err">{{ faviconError ? 'Selected image exceeds 100kB' : null }}</div>
          <image-uploader purpose="avatar" inputId="website-favicon" @upload-success="url => { config.website.favicon = url; faviconError = null }" @upload-error="err => faviconError = err" />
        </div>
      </div>
    </div>

    <!-- Image Server Configurations -->
    <div class="settings-row" v-if="!config.saas_mode">
      <h5 class="thin-underline section-header-top-spacing">
        Image Server Configurations
        <span class="info-tooltip" data-balloon="Image server configurations give the option of hosting the forums images locally or using an Amazon s3 bucket" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </h5>
      <div class="row">
        <div class="column">
          <label>Image Server Host</label>
          <label class="desc-label">Host image server locally or on Amazon S3</label>
        </div>
        <div class="column">
          <div class="row">
            <div class="radio-button column">
              <input type="radio" class="hide-radio" name="image-type" :value="true" @click=" localImageServer = true" v-model="localImageServer" id="image-type-local" />
              <label for="image-type-local" class="radio-label">Local</label>
            </div>
            <div class="radio-button column">
              <input type="radio" class="hide-radio" name="image-type" :value="false" @click="config.images.storage = 's3'" id="image-type-s3" v-model="localImageServer" />
              <label for="image-type-s3" class="radio-label">S3</label>
            </div>
          </div>
        </div>
      </div>
      <div class="input-three-col">
        <div>
          <label for="image-size">Max Image Size
            <span class="info-tooltip" data-balloon="Max image upload size in bytes, anything larger will be rejected. Default is 10 megabytes" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="image-size" v-model="config.images.max_size" placeholder="Max Image Upload Size in MegaBytes ( Example: 10 )" />
        </div>
        <div>
          <label for="image-expiration">Image Expiration
            <span class="info-tooltip" data-balloon="Expiration in milliseconds for images that were uploaded but not posted ( Example: 7,200,000 )" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="image-expiration" v-model="config.images.expiration" placeholder="Expiration in milliseconds for images that were uploaded but not posted ( Example: 7,200,000 )" />
        </div>
        <div>
          <label for="image-interval">Clean Interval
            <span class="info-tooltip" data-balloon="How often to check for expired images in milliseconds ( Example: 900,000 )" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="image-interval" v-model="config.images.interval" placeholder="How often to check for expired images in milliseconds ( Example: 900,000 )" />
        </div>
      </div>
      <!-- Only shown if Local is selected as image server host -->
      <div v-if="localImageServer">
        <label for="image-local-dir">Local Image Directory</label>
        <input type="text" class="input-text" id="image-local-dir" v-model="config.images.local.dir" placeholder="Enter the http directory where images should be saved" />
        <label for="image-local-path">Local Image Path</label>
        <input type="text" class="input-text" id="image-local-path" v-model="config.images.local.path" placeholder="Enter the path where images should be saved" />
      </div>
      <!-- Only shown if S3 is selected as image server host -->
      <div v-if="!localImageServer">
        <label for="image-s3-root">S3 Root URL</label>
        <input type="text" class="input-text" id="image-s3-root" v-model="config.images.s_3.root" placeholder="Example: http://example.com" />
        <label for="image-s3-dir">S3 Directory</label>
        <input type="text" class="input-text" id="image-s3-dir" v-model="config.images.s_3.dir" placeholder="Example: /epochtalk" />
        <label for="image-s3-bucket">S3 Bucket</label>
        <input type="text" class="input-text" id="image-s3-bucket" v-model="config.images.s_3.bucket" placeholder="Example: bukkit" />
        <label for="image-region">S3 Region</label>
        <input type="text" class="input-text" id="image-s3-region" v-model="config.images.s_3.region" placeholder="Example: US West" />
        <label for="image-s3-access-key">S3 Access Key</label>
        <input class="input-text" type="text" id="image-s3-access-key" v-model="config.images.s_3.access_key" placeholder="Amazon S3 Access Key" />
        <label for="image-s3-secret-key">S3 Secret Key</label>
        <input class="secret" type="password" id="image-s3-secret-key" v-model="config.images.s_3.secret_key" placeholder="Amazon S3 Secret Key" />
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, inject } from 'vue'
import { adminApi, motdApi, boardsApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import ImageUploader from '@/components/images/ImageUploader.vue'
import { cloneDeep, groupBy } from 'lodash'
import decode from '@/composables/filters/decode'

export default {
  name: 'GeneralSettings',
  components: { ImageUploader },
  beforeRouteEnter(to, from, next) {
    adminApi.configurations().then(data => next(vm => {
      vm.config = data
      vm.originalConfig = cloneDeep(data)
      vm.localImageServer = data.images.storage === 'local'
      motdApi.get().then(mData => vm.motdData = mData)
      boardsApi.movelist()
      .then(ml => groupBy(ml, 'parent_name'))
      .then(movelist => vm.boardsMovelist = movelist)
    }))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      this.originalConfig = cloneDeep(data)
      this.localImageServer = data.images.storage === 'local'
      motdApi.get().then(mData => this.motdData = mData)
      boardsApi.movelist()
      .then(ml => groupBy(ml, 'parent_name'))
      .then(movelist => this.boardsMovelist = movelist)
      next()
    })
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

    const saveListener = () => {
      adminApi.updateConfigurations(v.config)
      .then(() => motdApi.save(v.motdData))
      .then(() => $alertStore.success('Successfully updated forum settings!'))
      .catch(() => $alertStore.error('Error saving forum settings'))
    }
    const resetListener = () => v.config = cloneDeep(v.originalConfig)

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Methods */
    const v = reactive({
      originalConfig: null,
      config: null,
      motdData: null,
      localImageServer: null,
      faviconError: null,
      boardsMovelist: null,
      logoError: null
    })
    return { ...toRefs(v), decode }
  }
}
</script>

<style lang="scss">
  .input-text.upload-input { margin-bottom: 0; }
  .upload-err { height: 1rem; font-size: .725rem; color: #ff0000; }
  .file-input, .input-container { height: auto; }
  .input-container { margin-bottom: 1rem; }
  .radio-label {
    height: 3.25rem;
    line-height: 2.25rem;
    text-align: center;
    border-radius: 3px;
  }
  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    column-gap: 1rem;
    .progress-container { margin-top: .5rem; }
  }
  .column {
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
  }
  .setting-row.switch {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
      .switch-desc { width: 75%; }
      .switch-block { width: 25%; }
   }
</style>
