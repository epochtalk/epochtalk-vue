<script>
import { compile } from 'vue/dist/vue.esm-bundler.js'
import { watch, reactive, toRefs } from 'vue'

export default {
  name: 'RenderNestable',
  props: ['uncompiled', 'setCatDelete', 'setCatEdit', 'setBoardDelete', 'setBoardEdit', 'setBoardMods'],
  setup (props) {
    const v = reactive({ html: compile(props.uncompiled) })

    watch (() => props.uncompiled, () => {
      v.html = compile(props.uncompiled)
    })
    return { ...toRefs(v) }
  },
  render() { return this.html(this) }
}
</script>
