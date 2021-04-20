<template>
    <input type="file" name="fileInput" id="fileInput" @change="uploadFile()" ref="fileInput"><br>
    <progress ref="progressBar" value="0" max="100"></progress>
    <h3 ref="status"></h3>
    <p ref="amountUploaded"></p>
</template>

<script>
import { reactive, toRefs } from 'vue'

export default {
  name: 'single-image-uploader',
  props: ['onUpload-success', 'onUpload-error'],
  setup(props, { emit }) {
    /* View Methods */
    const uploadFile = () => {
      var file = v.fileInput.files[0]
      // alert(file.name+" | "+file.size+" | "+file.type);
      var formdata = new FormData()
      formdata.append('fileInput', file)
      var ajax = new XMLHttpRequest()
      ajax.upload.addEventListener('progress', progressHandler, false)
      ajax.addEventListener('load', completeHandler, false)
      ajax.addEventListener('error', errorHandler, false)
      ajax.addEventListener('abort', abortHandler, false)
      //TODO(akinsey): post data with s3 policy
      ajax.send(formdata);
    }

    const progressHandler = e => {
      v.amountUploaded.innerHTML = 'Uploaded ' + e.loaded + ' bytes of ' + e.total
      var percent = (e.loaded / e.total) * 100
      v.progressBar.value = Math.round(percent)
      v.status.innerHTML = Math.round(percent) + '% uploaded... please wait'
    }

    const completeHandler = e => {
      v.status.innerHTML = e.target.responseText
      emit('upload-success')
      v.progressBar.value = 0
    }

    const errorHandler = e => {
      v.status.innerHTML = 'Upload Failed'
      v.status.innerHTML = e.target.responseText
      emit('upload-error')
    }

    const abortHandler = () => {
      v.status.innerHTML = 'Upload Aborted'
      emit('upload-error')
    }

    const v = reactive({
      fileInput: null,
      progressBar: null,
      amountUploaded: null,
      status: null
    })

    return { ...toRefs(v), uploadFile }
  }
}
</script>
