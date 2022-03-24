<template>
  <!-- Column One -->
  <div v-if="theme" class="theme-col-one settings half-column">
    <div class="preset-container">
      <h5 class="thin-underline">Preset Themes</h5>
      <button style="display: inline-block;" @click="loadTheme('light')">
        <img src="/images/light-theme.png" alt="Light Theme" />
        <div class="center">Preview Light Theme</div>
      </button>
      &nbsp;&nbsp;
      <button style="display: inline-block;" @click="loadTheme('dark')">
        <img src="/images/dark-theme.png" alt="Dark Theme" />
        <div class="center">Preview Dark Theme</div>
      </button>
      &nbsp;&nbsp;
      <button style="display: inline-block;" @click="loadTheme('black')">
        <img src="/images/black-theme.png" alt="Black Theme" />
        <div class="center">Preview Black Theme</div>
      </button>
    </div>
    <h5 class="thin-underline">Font Settings
      <span class="info-tooltip" data-balloon="Allows you to adjust global font settings for the forum, variables such as color and font family must be valid css" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      <a class="right header-link show-mobile" @click="revert()">Revert to Default Theme</a></h5>
    <div class="setting-row">
      <div class="desc">
        <label for="base-font-size">Base Font Size</label>
        <label class="desc-label" for="base-font-size">Changes the base font size of entire forum <strong>(Between 10px - 18px)</strong></label>
      </div>
      <div class="postfix-input">
        <input :class="{ 'invalid': false === formValid['base-font-size'] }" id="base-font-size" type="text" v-model="theme['base-font-size']" required />
        <div>px</div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-font-sans">Base Font Family</label>
        <label class="desc-label" for="base-font-sans">Changes the base font family of entire forum</label>
      </div>
      <input :class="{ 'invalid': false === formValid['base-font-sans'] }" id="base-font-sans" class="input-block" type="text" v-model="theme['base-font-sans']" :style="{ 'font-family': theme['base-font-sans'] }" required/>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-line-height">Base Line Height</label>
        <label class="desc-label" for="base-line-height">Changes the base line height of entire forum <strong>(Between 1.00rem - 2.00rem)</strong></label>
      </div>
      <div class="postfix-input">
        <input :class="{ 'invalid': false === formValid['base-line-height'] }" id="base-line-height" type="text" v-model="theme['base-line-height']" />
        <div>rem</div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-font-color">Primary Font Color</label>
        <label class="desc-label" for="base-font-color">Changes the primary font color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['base-font-color'] }" id="base-font-color" type="text" v-model="theme['base-font-color']" />
        <div :style="{ 'background-color': theme['base-font-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="secondary-font-color">Seconday Font Color</label>
        <label class="desc-label" for="secondary-font-color">Changes the secondary font color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['secondary-font-color'] }" id="secondary-font-color" type="text" v-model="theme['secondary-font-color']" />
        <div :style="{ 'background-color': theme['secondary-font-color'] }"></div>
      </div>
    </div>
  </div>
  <!-- Column Two -->
  <div v-if="theme" class="theme-col-two settings half-column">
    <h5 class="thin-underline">Layout Settings
      <span class="info-tooltip" data-balloon="Allows you to customize forum colors. Use preview mode to ensure that your color changes look good without affecting the current theme. Variables must be valid css" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      <a class="right header-link hide-mobile" @click="revert()">Revert to Default Theme</a></h5>
    <div class="setting-row">
      <div class="desc">
        <label>Avatar Shape</label>
        <label class="desc-label">Choose the default shape for user avatars</label>
      </div>
      <div class="radio-select">
        <div class="radio-button">
          <input type="radio" class="hide-radio" name="avatar-shape" :value="true" @click="config.website.default_avatar_shape = 'circle'" v-model="defaultAvatarShapeCircle" id="avatar-shape-round" />
          <label for="avatar-shape-round">Circle</label>
        </div>
        <div class="radio-button">
          <input type="radio" class="hide-radio" name="avatar-shape" :value="false" @click="config.website.default_avatar_shape = 'rect'" id="avatar-shape-square" v-model="defaultAvatarShapeCircle" />
          <label for="avatar-shape-square">Rectangle</label>
        </div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="base-background-color">Background Color</label>
        <label class="desc-label" for="base-background-color">Changes the background color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['base-background-color'] }" id="base-background-color" type="text" v-model="theme['base-background-color']" />
        <div :style="{ 'background-color': theme['base-background-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="primary-color">Primary Color</label>
        <label class="desc-label" for="primary-color">Changes the primary color of entire forum</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['color-primary'] }" id="primary-color" type="text" v-model="theme['color-primary']" />
        <div :style="{ 'background-color': theme['color-primary'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="header-bg-color">Header Background Color</label>
        <label class="desc-label" for="header-bg-color">Changes the header background color</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['header-bg-color'] }" id="header-bg-color" type="text" v-model="theme['header-bg-color']" />
        <div :style="{ 'background-color': theme['header-bg-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="header-font-color">Header Font Color</label>
        <label class="desc-label" for="header-font-color">Changes the header font color</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['header-font-color'] }" id="header-font-color" type="text" v-model="theme['header-font-color']" />
        <div :style="{ 'background-color': theme['header-font-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="sub-header-color">Sub-Header Background Color</label>
        <label class="desc-label" for="sub-header-color">Changes the sub-header background color</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['sub-header-color'] }" id="sub-header-color" type="text" v-model="theme['sub-header-color']" />
        <div :style="{ 'background-color': theme['sub-header-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="border-color">Border Color</label>
        <label class="desc-label" for="border-color">Changes the all border colors</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['border-color'] }" id="border-color" type="text" v-model="theme['border-color']" />
        <div :style="{ 'background-color': theme['border-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="input-background-color">Input Field Background Color</label>
        <label class="desc-label" for="input-background-color">Changes the background color of input fields</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['input-background-color'] }" id="input-background-color" type="text" v-model="theme['input-background-color']" />
        <div :style="{ 'background-color': theme['input-background-color'] }"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="desc">
        <label for="input-font-color">Input Field Font Color</label>
        <label class="desc-label" for="input-font-color">Changes the font color of input fields</label>
      </div>
      <div class="swatch-input">
        <input :class="{ 'invalid': false === formValid['input-font-color'] }" id="input-font-color" type="text" v-model="theme['input-font-color']" />
        <div :style="{ 'background-color': theme['input-font-color'] }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, inject, watch } from 'vue'
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
      themeApi.get(to.query.preview ? { preview: true } : undefined).then(t => {
        vm.theme = t
        vm.removeVarPostFix()
      })
    }))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      this.originalConfig = cloneDeep(data)
      this.defaultAvatarShapeCircle = data?.website?.default_avatar_shape === 'circle'
      themeApi.get(to.query.preview ? { preview: true } : undefined).then(t => {
        this.theme = t
        this.removeVarPostFix()
      })
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

    const validColor = str => {
      // Do not allow these values
      if (str === '') return false
      if (str === 'inherit') return false
      if (str === 'transparent') return false

      // Strict RGB Validation
      if (str.substring(0, 3).toLowerCase() === 'rgb') {
        if (str.substring(str.length-1) !== ')') return false // check ending for closing paren
        let rgb = str.split('(')[1].split(')')[0].split(',')
        if (str.substring(0, 4).toLowerCase() === 'rgba' && rgb.length !== 4) return false // rgba 4 args
        for (let x = 0; x < rgb.length; x++) {
          if (x === 3 && (rgb[x] < 0 || rgb[x] > 1)) return false // opacity between 0-1
          if (rgb[x] < 0 || rgb[x] > 255) return false // rgb between 0-255
        }
      }

      // Strict HSL Validation
      if (str.substring(0, 3).toLowerCase() === 'hsl') {
        if (str.substring(str.length-1) !== ')') return false // check ending for closing paren
        let hsl = str.split('(')[1].split(')')[0].split(',')
        if (str.substring(0, 4).toLowerCase() === 'hsla' && hsl.length !== 4) return false // hsla 4 args
        for (let i = 0; i < hsl.length; i++) {
          if (i === 3 && (hsl[i] < 0 || hsl[i] > 1)) return false // opacity between 0-1
          if (i === 0 && (hsl[i] < 0 || hsl[i] > 360)) return false // h between 0-360
          if ((i === 1 || i === 2) && (hsl[i].split('%')[0] < 0 || hsl[i].split('%')[0] > 100)) return false  // s and l between 0-255
        }
      }

      // Try to apply style to new image element and see if it sticks
      let image = new Image()
      image.style.color = 'rgb(0, 0, 0)'
      image.style.color = str
      if (image.style.color !== 'rgb(0, 0, 0)') return true
      image.style.color = 'rgb(255, 255, 255)'
      image.style.color = str
      return image.style.color !== 'rgb(255, 255, 255)'
    }

    const baseFontSizeRegex = /^([1][0-8])/
    const baseLineHeightRegex = /^(?:2(?:\.00?0?)?|[1](?:\.[0-9]([0-9])?([0-9])?)?|1?\.[1-9])$/

    const loadTheme = theme => console.log(theme)
    const revert = () => console.log('Revert Theme')

    const removeVarPostFix = () => {
      v.theme['base-font-size'] = v.theme['base-font-size'].split('px')[0]
      v.theme['base-line-height'] = v.theme['base-line-height'].split('rem')[0]
    }

    const addVarPostFix = () => {
      v.themeCopy = cloneDeep(v.theme)
      v.themeCopy['base-font-size'] = v.themeCopy['base-font-size'] + 'px';
      v.themeCopy['base-line-height'] = v.themeCopy['base-line-height'] + 'rem';
    }

    const $alertStore = inject('$alertStore')

    const v = reactive({
      originalConfig: null,
      config: null,
      theme: {},
      themeCopy: {},
      formValid: {},
      defaultAvatarShapeCircle: null
    })

    let watchColorProps = ['base-background-color', 'base-font-color', 'border-color', 'color-primary', 'header-bg-color', 'header-font-color', 'input-background-color', 'input-font-color', 'secondary-font-color', 'sub-header-color']
    watchColorProps.forEach(p => watch(() => v.theme[p], val => v.formValid[p] = validColor(val)))

    watch(() => v.theme['base-font-size'], val => v.formValid['base-font-size'] = baseFontSizeRegex.test(val))
    watch(() => v.theme['base-line-height'], val => v.formValid['base-line-height'] = baseLineHeightRegex.test(val))
    watch(() => v.theme['base-font-sans'], val => v.formValid['base-font-sans'] = !!val)

    return { ...toRefs(v), loadTheme, revert, removeVarPostFix, addVarPostFix }
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
