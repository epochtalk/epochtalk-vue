<template>
    <input type="file" name="fileInput" id="fileInput" @change="uploadFile()" ref="fileInput" multiple><br>
    <progress ref="progressBar" value="0" max="100"></progress>
    <h3 ref="status"></h3>
    <p ref="amountUploaded"></p>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { policy } from '@/composables/services/image-upload'

export default {
  name: 'single-image-uploader',
  props: ['onUpload-success', 'onUpload-error', 'purpose'],
  setup(props) { //, { emit }) {
    /* View Methods */
    const uploadFile = () => {
      var images = []
      for (var i = 0; i < v.fileInput.files.length; i++) {
        var file = v.fileInput.files[i]
        if (!file.type.match(/image.*/)) continue
        images.push(file)
      }
      if (props.purpose === 'avatar' || props.purpose === 'logo' || props.purpose === 'favicon') { images = [images[0]] }

      if (images.length > 0) {
        // if (v.fileInput.files.length > 10) {
        //   return $timeout(function() { Alert.error('Error: Exceeded 10 images.'); });
        // }

        // (re)prime loading and progress variables
        v.imagesUploading = true
        // let imagesProgress = 0
        // let imagesProgressSum = 0
        let errImages = []
        let maxImageSize = props.purpose === 'avatar' ? 102400 : 10485760 // TODO(akinsey): forumData.max_image_size;

        /**
         * Image = {
         *   name: {string} The filename of the string (provided by host computer),
         *   file: {ImageOjbect} The image itself,
         *   status: {string} The status of the image upload,
         *   progress: {number} Progession of the upload as percent,
         *   policy: {policyObject} S3 or local policy object,
         *   url: {string} The url where the image is hosted (upon upload completion)
         */
         // prep each image
        v.fileInput.files.forEach(fsImage => {
          let image = {
            name: fsImage.name,
            file: fsImage,
            status: 'Initializing',
            progress: 0
          }
          if (fsImage.size > maxImageSize) {
            errImages.push(fsImage.name)
          }
          else {
            v.currentImages.push(image)
          }
        })

        // let warningMsg = 'Some images exceeded the max image upload size(' + maxImageSize + ' bytes): [' + errImages.join(', ') + ']'

        if (!v.currentImages.length) {
          v.imagesUploading = false
          // return $timeout(function() { Alert.warning(warningMsg); });
        }
        // the number of images that are still being uploaded
        v.uploadingImages = v.currentImages.length

        console.log(policy(v.currentImages))
      }
    }

    // const progressHandler = e => {
    //   v.amountUploaded.innerHTML = 'Uploaded ' + e.loaded + ' bytes of ' + e.total
    //   var percent = (e.loaded / e.total) * 100
    //   v.progressBar.value = Math.round(percent)
    //   v.status.innerHTML = Math.round(percent) + '% uploaded... please wait'
    // }

    // const completeHandler = e => {
    //   v.status.innerHTML = e.target.responseText
    //   emit('upload-success')
    //   v.progressBar.value = 0
    // }

    // const errorHandler = e => {
    //   v.status.innerHTML = 'Upload Failed'
    //   v.status.innerHTML = e.target.responseText
    //   emit('upload-error')
    // }

    // const abortHandler = () => {
    //   v.status.innerHTML = 'Upload Aborted'
    //   emit('upload-error')
    // }

    const v = reactive({
      fileInput: null,
      progressBar: null,
      amountUploaded: null,
      currentImages: [],
      imagesUploading: false,
      uploadingImages: 0,
      status: null
    })

    return { ...toRefs(v), uploadFile }
  }
}
</script>
