<template>
  <!-- Column One -->
  <div class="theme-col-one settings half-column">
    <div class="preset-container" v-if="theme">
      <h5 class="thin-underline">Preset Themes</h5>
      <button style="display: inline-block;" ng-click="AdminSettingsCtrl.loadTheme('light')">
        <img src="/images/light-theme.png" alt="Light Theme" />
        <div class="center">Preview Light Theme</div>
      </button>
      &nbsp;&nbsp;
      <button style="display: inline-block;" ng-click="AdminSettingsCtrl.loadTheme('dark')">
        <img src="/images/dark-theme.png" alt="Dark Theme" />
        <div class="center">Preview Dark Theme</div>
      </button>
      &nbsp;&nbsp;
      <button style="display: inline-block;" ng-click="AdminSettingsCtrl.loadTheme('black')">
        <img src="/images/black-theme.png" alt="Black Theme" />
        <div class="center">Preview Black Theme</div>
      </button>
    </div>
    <h5 class="thin-underline">Font Settings
      <span class="info-tooltip" data-balloon="Allows you to adjust global font settings for the forum, variables such as color and font family must be valid css" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      <a class="right header-link show-mobile" ng-click="AdminSettingsCtrl.revert()">Revert to Default Theme</a></h5>
    <div class="setting-row">
      <div class="desc">
        <label for="base-font-size">Base Font Size</label>
        <label class="desc-label" for="base-font-size">Changes the base font size of entire forum <strong>(Between 10px - 18px)</strong></label>
      </div>
      <div class="postfix-input">
        <input id="base-font-size" type="text" ng-pattern="/^([1][0-8])/" ng-model="AdminSettingsCtrl.theme['base-font-size']" required />
        <div>px</div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-font-sans">Base Font Family</label>
        <label class="desc-label" for="base-font-sans">Changes the base font family of entire forum</label>
      </div>
      <input id="base-font-sans" class="input-block" type="text" ng-model="AdminSettingsCtrl.theme['base-font-sans']" ng-style="{ 'font-family': AdminSettingsCtrl.theme['base-font-sans'] }" required/>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-line-height">Base Line Height</label>
        <label class="desc-label" for="base-line-height">Changes the base line height of entire forum <strong>(Between 1.00rem - 2.00rem)</strong></label>
      </div>
      <div class="postfix-input">
        <input id="base-line-height" type="text" ng-pattern="/^(?=.+)((?:[1]\d*)?(?:\.\d{1,4})|(1|2|[2]\.0{1,4}))?$/" ng-model="AdminSettingsCtrl.theme['base-line-height']" />
        <div>rem</div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-font-color">Primary Font Color</label>
        <label class="desc-label" for="base-font-color">Changes the primary font color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input id="base-font-color" type="text" ng-model="AdminSettingsCtrl.theme['base-font-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['base-font-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="secondary-font-color">Seconday Font Color</label>
        <label class="desc-label" for="secondary-font-color">Changes the secondary font color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input id="secondary-font-color" type="text" ng-model="AdminSettingsCtrl.theme['secondary-font-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['secondary-font-color'] }"></div>
      </div>
    </div>
  </div>
  <!-- Column Two -->
  <div class="theme-col-two settings half-column">
    <h5 class="thin-underline">Layout Settings
      <span class="info-tooltip" data-balloon="Allows you to customize forum colors. Use preview mode to ensure that your color changes look good without affecting the current theme. Variables must be valid css" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      <a class="right header-link hide-mobile" ng-click="AdminSettingsCtrl.revert()">Revert to Default Theme</a></h5>
    <div class="toggle-row">
      <div class="toggle-wrap">
        <label>Avatar Shape</label>
        <label class="desc-label">Choose the default shape for user avatars</label>
      </div>
      <div class="radio-button">
        <input type="radio" class="hide-radio" name="avatar-shape" ng-value="true" ng-click="AdminSettingsCtrl.settings.website.default_avatar_shape = 'circle'" ng-model="AdminSettingsCtrl.defaultAvatarShapeCircle" id="avatar-shape-round" />
        <label for="avatar-shape-round">Circle</label>
      </div>
      <div class="radio-button">
        <input type="radio" class="hide-radio" name="avatar-shape" ng-value="false" ng-click="AdminSettingsCtrl.settings.website.default_avatar_shape = 'rect'" id="avatar-shape-square" ng-model="AdminSettingsCtrl.defaultAvatarShapeCircle" />
        <label for="avatar-shape-square">Rectangle</label>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-background-color">Background Color</label>
        <label class="desc-label" for="base-background-color">Changes the background color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input id="base-background-color" type="text" ng-model="AdminSettingsCtrl.theme['base-background-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['base-background-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="primary-color">Primary Color</label>
        <label class="desc-label" for="primary-color">Changes the primary color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input id="primary-color" type="text" ng-model="AdminSettingsCtrl.theme['color-primary']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['color-primary'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="header-bg-color">Header Background Color</label>
        <label class="desc-label" for="header-bg-color">Changes the header background color</label>
      </div>
      <div class="swatch-input">
        <input id="header-bg-color" type="text" ng-model="AdminSettingsCtrl.theme['header-bg-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['header-bg-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="header-font-color">Header Font Color</label>
        <label class="desc-label" for="header-font-color">Changes the header font color</label>
      </div>
      <div class="swatch-input">
        <input id="header-font-color" type="text" ng-model="AdminSettingsCtrl.theme['header-font-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['header-font-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="sub-header-color">Sub-Header Background Color</label>
        <label class="desc-label" for="sub-header-color">Changes the sub-header background color</label>
      </div>
      <div class="swatch-input">
        <input id="sub-header-color" type="text" ng-model="AdminSettingsCtrl.theme['sub-header-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['sub-header-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="border-color">Border Color</label>
        <label class="desc-label" for="border-color">Changes the all border colors</label>
      </div>
      <div class="swatch-input">
        <input id="border-color" type="text" ng-model="AdminSettingsCtrl.theme['border-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['border-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="input-background-color">Input Field Background Color</label>
        <label class="desc-label" for="input-background-color">Changes the background color of input fields</label>
      </div>
      <div class="swatch-input">
        <input id="input-background-color" type="text" ng-model="AdminSettingsCtrl.theme['input-background-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['input-background-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="input-font-color">Input Field Font Color</label>
        <label class="desc-label" for="input-font-color">Changes the font color of input fields</label>
      </div>
      <div class="swatch-input">
        <input id="input-font-color" type="text" ng-model="AdminSettingsCtrl.theme['input-font-color']" color-validator />
        <div ng-style="{ 'background-color': AdminSettingsCtrl.theme['input-font-color'] }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, inject } from 'vue'
import { adminApi, themeApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import { cloneDeep } from 'lodash'

export default {
  name: 'ThemeSettings',
  beforeRouteEnter(to, from, next) {
    adminApi.configurations().then(data => next(vm => {
      vm.config = data
      vm.originalConfig = cloneDeep(data)
      vm.defaultAvatarShapeCircle = data?.website?.default_avatar_shape === 'circle'
      themeApi.get(to.query.preview ? { preview: true } : undefined).then(t => vm.theme = t)
    }))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      this.originalConfig = cloneDeep(data)
      this.defaultAvatarShapeCircle = data?.website?.default_avatar_shape === 'circle'
      themeApi.get(to.query.preview ? { preview: true } : undefined).then(t => this.theme = t)
      next()
    })
  },
  setup() {
    const saveListener = () => {
      themeApi.save(v.legal)
      .then(() => $alertStore.success('Successfully updated theme settings!'))
      .catch(() => $alertStore.error('Error saving theme settings'))
    }
    const resetListener = () => v.legal = cloneDeep(v.originalConfig)

    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })

    const loadTheme = theme => console.log(theme)
    const revert = () => console.log('Revert Theme')

    const $alertStore = inject('$alertStore')

    const v = reactive({
      originalConfig: null,
      config: null,
      theme: {},
      defaultAvatarShapeCircle: null
    })

    return { ...toRefs(v), loadTheme, revert }
  }
}
</script>

<style lang="scss" scoped>
  .preset-container { margin-bottom: 1.5rem; }
  .theme-col-one { grid-column: 1; }
  .theme-col-two { grid-column: 2; }
  .setting-row {
    display: flex;
    width: 100%;
    flex-direction: row;
    .desc { flex: 65%; }
    .input-block { width: auto; }
    &:last-child { flex: 1; }
    .radio-select { line-height: 3.25rem; }
    .radio-button { display: inline-block; }
    .radio-button label {
      display: inline-block;
      padding: 0 .9rem;
      border-radius: 3px;
      line-height: 2rem;
    }
    .radio-button:last-child label { margin-right: 0; }
  }
  .swatch-input {
    position: relative;
    input { margin-bottom: 0; }
    div { position: absolute; top: 0.2rem; right: 0.2rem; height: 1.925rem; width: 1rem; border: 1px solid $border-color; }
  }
  .postfix-input {
    height: 2.3125rem;
    position: relative;
    input { margin-bottom: 0; }
    div {
      position: absolute;
      top: 1px;
      right: 1px;
      bottom: 1px;
      background-color: $sub-header-color;
      padding: 0.5rem;
      font-size: 0.875rem;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      color: $secondary-font-color-dark;
    }
  }
</style>
