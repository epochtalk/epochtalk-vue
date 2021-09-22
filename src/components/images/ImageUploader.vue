<template>
    <input type="file" name="fileInput" id="fileInput" @change="uploadFile()" ref="fileInput" :multiple="multiple"><br>
    <progress ref="progressBar" style="width: 100%" :value="imagesProgress" max="100"></progress>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { policy, upload } from '@/composables/services/image-upload'

Promise.each = async function(arr, fn) { // take an array and a function
   for(const item of arr) await fn(item);
}

export default {
  name: 'image-uploader',
  props: ['onUpload-success', 'onUpload-error', 'purpose'],
  setup(props, { emit }) { //, { emit }) {
    /* View Methods */
    const uploadFile = () => {
      for (var i = 0; i < v.fileInput.files.length; i++) {
        var file = v.fileInput.files[i]
        if (!file.type.match(/image.*/)) continue
        v.images.push(file)
      }
      console.log(props.purpose)
      if (props.purpose === 'avatar' || props.purpose === 'logo' || props.purpose === 'favicon') { v.images = [v.images[0]] }

        console.log(v.images)

      if (v.images.length > 0) {
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
        v.images.forEach(fsImage => {
          let image = {
            name: fsImage.name,
            file: fsImage,
            status: 'Initializing',
            progress: 0
          }
          if (fsImage.size > maxImageSize) errImages.push(fsImage.name)
          else v.currentImages.push(image)
        })

        if (errImages.length) {
          v.warningMsg = 'Some images exceeded the max image upload size(' + maxImageSize + ' bytes): [' + errImages.join(', ') + ']'
        }

        if (!v.currentImages.length) {
          v.imagesUploading = false
          // return $timeout(function() { Alert.warning(warningMsg); });
        }
        // the number of images that are still being uploaded
        v.uploadingImages = v.currentImages.length
        return policy(v.currentImages)
        // upload each image
        .then(images => {
          let index = 0
          return Promise.each(images, image => {
            v.currentImages[index].status = 'Starting'
            return Promise.resolve(upload(image).progress(p => updateImagesUploading(index, p))
            .error(err => {
              updateImagesUploading(index)
              var message = 'Image upload failed for: ' + image.name + '. '
              if (err.status === 429) { message += 'Exceeded 10 images in batch upload.' }
              else if (err.message) { console.log(err) }
              else { message += 'Error: ' + err.message }
              emit('upload-error', message)
              // Alert.error(message);
            })
            .success(url => {
              updateImagesUploading(index, 100, url)
              // if ($scope.onDone) { $scope.onDone({data: url}); }
              if (props.purpose === 'avatar' || props.purpose === 'logo' || props.purpose === 'favicon') {
                v.model = url
                emit('upload-success', 'http://localhost:8080' + url)
              }
              else {
                v.images.push(image)
              }
            })
            .catch(function(err) {
              updateImagesUploading(index)
              var message = 'Image upload failed for: ' + image.name + '. '
              if (err.status === 429) { message += 'Exceeded 10 images in batch upload.' }
              else { message += 'Error: ' + err.message }
              // Alert.error(message);
              emit('upload-error', message)

            }))
            .finally(() => index++)
          })
          .then(function() {
            // log error images after all uploads finish
            if (errImages.length) {
              emit('upload-error', v.warningMsg)
              // TODO(akinsey) return $timeout(function() { Alert.warning(warningMsg); })
            }
          })
        })
        .catch(() => {
          emit('upload-error', v.warningMsg)
        })
      }
    }

    // update loading status
    function updateImagesUploading(index, percent, url) {
      // on successful update
      if (percent) {
        // update images' progress sum
        // (subtract old value and add new value)
        v.imagesProgressSum = v.imagesProgressSum - v.currentImages[index].progress + percent
        // update the image's progress
        v.currentImages[index].progress = percent
        // update the image's properties
        if (percent === 100 && url) {
          // on complete, with url populated
          // set the image URL
          // and remove from currentlyUploadingImages
          v.currentImages[index].status = 'Complete'
          v.currentImages[index].url = url
          v.uploadingImages--
        }
        else v.currentImages[index].status = 'Uploading'
      }
      // on upload error or failure
      else {
        v.imagesProgressSum = v.imagesProgressSum - v.currentImages[index].progress
        v.currentImages[index].progress = '--'
        v.currentImages[index].status = 'Failed'
        v.uploadingImages--
      }

      v.imagesProgress = v.imagesProgressSum / v.currentImages.length

      if (v.uploadingImages <= 0) v.imagesUploading = false
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
      multiple: !props.purpose,
      progressBar: null,
      amountUploaded: null,
      currentImages: [],
      images: [],
      imagesUploading: false,
      imagesProgress: 0,
      imagesProgressSum: 0,
      uploadingImages: 0,
      warningMsg: '',
      model: null,
      status: null
    })

    return { ...toRefs(v), uploadFile }
  }
}
</script>
