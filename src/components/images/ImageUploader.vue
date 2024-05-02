<template>
  <div class="input-container" @dragend.prevent.self="hover=false;" @dragexit.prevent.self="hover=false" @dragleave.prevent.self="hover=false">
    <div>
      <label v-if="purpose !== 'editor'" for="fileInput" class="input-label" :class="{ 'hidden': hover }">Choose Image File or Drag and Drop</label>
      <input type="file" name="fileInput" :id="inputId || 'fileInput'" class="file-input" @change="uploadFile" ref="fileInput" :multiple="multiple" @dragenter.prevent.self.stop="hover=true" @dragover.prevent.self.stop="hover=true" :disabled="hover" :class="{ 'hidden': hover }" :hidden="purpose === 'editor' ? 'hidden' : null">
      <div class="progress-container" :class="{ 'hidden': hover }">
        <div class="progress" :class="{ 'progress-editor': purpose === 'editor'}">
          <span class="meter" :style="{ width: imagesProgress + '%' }"></span>
        </div>
      </div>
      <div v-if="purpose !== 'editor'" class="input-info">Images should not exceed 100kB</div>
    </div>
    <div :class="{'visible': hover, 'hidden': !hover, 'editorMode': showDropzone }" id="dropzone" @drop.stop.prevent="uploadFile" @dragenter.prevent.self="hover=true" @dragover.prevent.self="hover=true" @dragend.prevent.self="hover=false" @dragexit.prevent.self="hover=false" @dragleave.prevent.self="hover=false">
      Drop Image{{ purpose === 'editor' ? 's' : ''}} Here
    </div>
  </div>

  <div v-if="purpose === 'editor'" class="upload-editor">
    <a href="#" data-balloon="Upload Images" @click.prevent="fileInput.click()"><i class="far fa-images" aria-hidden="true"></i></a>
    <span v-if="images.length > 0 && purpose === 'editor'">
      (<a href="#" @click.prevent="showImageModal = true">
        <span v-if="images.length === 1">
          view <span v-html="images.length"></span> image
        </span>
        <span v-if="images.length > 1">
          view <span v-html="images.length"></span> images
        </span>
      </a>)
    </span>
  </div>

  <modal :name="$options.name" :show="showImageModal" @close="showImageModal = false" :focusInput="focusInput">
    <template v-slot:header>Image Picker</template>

    <template v-slot:body>
      <ul :class="images.length > 1 ? 'two-col' : 'one-col'" class="img-picker-list">
        <li v-for="image in images" :key="image.url">
          <div class="image-picker-cell">
            <!-- image picker header -->
            <div class="header" :class="{ 'added': image.added }" >
              (<span v-html="image.progress"></span>%):
              <a :href="imageUrl(image)" target="_blank" v-if="image.url">
                <span v-html="image.name"></span>
              </a>
              <span v-html="image.status" v-if="!image.url"></span>
            </div>
            <!-- image picker body -->
            <div class="picker-body">
              <img :src="imageUrl(image)" @click="fireDone(image)"/>
              <a class="after" v-if="image.url" @click="fireDone(image)">
                <div>
                  <span class="stroke" v-if="!image.added">Add to Editor</span>
                  <span v-if="image.added"><strong>Added!</strong></span>
                </div>
              </a>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </modal>

</template>

<script>
import { reactive, toRefs, watch, inject } from 'vue'
import { presignedPost, s3Upload } from '@/composables/services/image-upload'
import Modal from '@/components/layout/Modal.vue'

Promise.each = async (arr, fn) => { for(const item of arr) await fn(item) }

export default {
  name: 'image-uploader',
  props: ['onUpload-success', 'onUpload-error', 'onHover-stop', 'purpose', 'showDropzone', 'onDone', 'inputId'],
  components: { Modal },
  setup(props, { emit }) { //, { emit }) {
    /* View Methods */
    const imageUrl = image => window.images_local_root + image.url

    const uploadFile = (e) => {
      v.hover = false
      emit('upload-error', null) // clear previous errors
      let files = e.target.files || e.dataTransfer.files
      v.fileInput.files = files
      if (!files.length) return
      let images = []
      for (let i = 0; i < files.length; i++) {
        let file = files[i]
        if (!file.type.match(/image.*/)) continue
        images.push(file)
      }
      if (props.purpose === 'avatar' || props.purpose === 'logo' || props.purpose === 'favicon') {
        images = [images[0]]
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(images[0])
        v.fileInput.files = dataTransfer.files
       }

      if (images.length > 10) return handleError('Error: Exceeded 10 images.')
      else if (images.length > 0) {
        // (re)prime loading and progress variables
        v.imagesUploading = true
        v.imagesProgressSum = 0
        let errImages = []
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
        images.forEach(fsImage => {
          let image = {
            name: fsImage.name,
            file: fsImage,
            status: 'Initializing',
            progress: 0
          }
          if (fsImage.size > v.maxImageSize) errImages.push(fsImage.name)
          else v.currentImages.push(image)
        })

        if (errImages.length) {
          v.warningMsg = 'Some images exceeded the max image upload size(' + v.maxImageSize + ' bytes): [' + errImages.join(', ') + ']'
        }

        if (!v.currentImages.length) {
          v.imagesUploading = false
          return handleError(v.warningMsg)
        }
        // the number of images that are still being uploaded
        v.uploadingImages = v.currentImages.length

        // get presigned posts
        //   on error, goes to catch
        presignedPost(v.currentImages)
        .then(result => result.presigned_posts)
        // use presigned_posts to upload to s3
        .then(presignedPosts => {
          return Object.keys(presignedPosts).map(index => {
            let data = {
              presigned_post: presignedPosts[index],
              file: v.currentImages[index].file
            }
            let progressHandler = data => {
              // data.progress is a fraction of 1
              updateImagesUploading(index, data.progress * 100)
            }
            return s3Upload(data, progressHandler)
            .catch(err => {
              // return individual errors with corresponding filename
              return {
                S3Error: err,
                filename: v.currentImages[index].name
              }
            })
          })
        })
        .then(promises => {
          return Promise.all(promises)
        })
        .then(results => {
          // process upload results
          results.forEach((result, index) => {
            // handle aws error
            if (result.S3Error) {
              let err = result.S3Error
              let filename = result.filename
              // parse aws xml error
              let parser = new DOMParser();
              let xmlDoc = parser.parseFromString(err.response.data,"text/xml");

              let message = xmlDoc.getElementsByTagName("Message")[0].childNodes[0].nodeValue;
              $alertStore.error(`Error uploading ${filename}: ${message}`)
            }
            // otherwise, upload succeeded
            else {
              $alertStore.success(`Successfully uploaded ${v.currentImages[index].name}`)
            }
          })
        })
        .catch(err => {
          // backend error, log message
          if (err.response && err.response.data && err.response.data.message) {
            $alertStore.error(`Error: ${err.response.data.message}`)
          }
          // other error
          else {
            $alertStore.error(`Error: ${err}`)
          }
        })
        .finally(() => {
          // reset images
          v.currentImages = []
          if (props.purpose === 'editor') setTimeout(() => v.imagesProgress = 0, 500)
        })
        /* return policy(v.currentImages) */
        /* // upload each image */
        /* .then(imagesToUpload => { */
        /*   let index = 0 */
        /*   return Promise.each(imagesToUpload, image => { */
        /*     v.currentImages[index].status = 'Starting' */
        /*     return Promise.resolve(upload(image) */
        /*     .progress(p => updateImagesUploading(index, p)) */
        /*     .error(err => { */
        /*       updateImagesUploading(index) */
        /*       let message = 'Image upload failed for: ' + image.name + '. ' */
        /*       if (err.status === 429) { message += 'Exceeded 10 images in batch upload.' } */
        /*       else if (err.message) { console.log(err) } */
        /*       else { message += 'Error: ' + err.message } */
        /*       emit('upload-error', message) */
        /*     }) */
        /*     .success(url => { */
        /*       updateImagesUploading(index, 100, url) */
        /*       if (props.purpose === 'avatar' || props.purpose === 'logo' || props.purpose === 'favicon') { */
        /*         v.model = url */
        /*  */
        /*         let imageRoot = image.policy.storageType === 'local' ? window.images_local_root : '' */
        /*         emit('upload-success', imageRoot + url) */
        /*       } */
        /*       else { */
        /*         v.images.push(image) */
        /*         fireDone(image) */
        /*       } */
        /*     }) */
        /*     .catch(function(err) { */
        /*       updateImagesUploading(index) */
        /*       let message = 'Image upload failed for: ' + image.name + '. ' */
        /*       if (err.status === 429) { message += 'Exceeded 10 images in batch upload.' } */
        /*       else { message += 'Error: ' + err.message } */
        /*       handleError(message) */
        /*     })) */
        /*     .finally(() => index++) */
        /*   }) */
        /*   // log error images after all uploads finish */
        /*   .then(() => { if (errImages.length) handleError(v.warningMsg) }) */
        /* }) */
        /* .catch(() => handleError(v.warningMsg)) */
        /* .finally(() => { */
        /*   v.currentImages = [] */
        /*   if (props.purpose === 'editor') setTimeout(() => v.imagesProgress = 0, 500) */
        /* }) */
      }
    }

    const $alertStore = inject('$alertStore')
    const handleError = msg => {
      v.currentImages = []
      v.image = []
      v.imagesProgress = 0
      emit('upload-error', msg)
    }

    // update loading status
    const updateImagesUploading = (index, percent, url) => {
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

    const fireDone = image => {
      image.added = true
      props.onDone(image.url.indexOf('/') === 0 ? imageUrl(image) : image.url)
      setTimeout(() => image.added = false, 1000)
    }

    const v = reactive({
      hover: false,
      fileInput: null,
      multiple: props.purpose === 'editor',
      progressBar: null,
      amountUploaded: null,
      showDropzone: props.showDropzone,
      showImageModal: false,
      focusInput: null,
      currentImages: [],
      images: [],
      imagesUploading: false,
      imagesProgress: 0,
      imagesProgressSum: 0,
      uploadingImages: 0,
      maxImageSize: props.purpose === 'avatar' ? window.max_avatar_size : window.max_image_size,
      warningMsg: '',
      model: null,
      status: null
    })

    watch(() => v.hover, a => a ? null : emit('hover-stop'))

    return { ...toRefs(v), imageUrl, uploadFile, fireDone }
  }
}
</script>

<style lang="scss">
  .input-container { position: relative; height: 4.625rem; }
  .input-section label.hidden { opacity: .1; }
  .file-input {
    height: 4.625rem;
    &.hidden {
      opacity: .1;
      border: 1px solid transparent;
    }
  }
  #fileInput { height: auto; }
  #dropzone {
    position: absolute;
    float: left;
    border: 3px dashed $color-primary;
    border-radius: 3px;
    box-shadow: none;
    margin-bottom: 0;
    padding-top: 2rem;
    padding-bottom: 1rem;
    height: 4.625rem;
    text-align: center;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: .5rem;
    color: $base-background-color;
    width: 100%;
    &.visible {
      display: block;
      z-index: 99999;
      background-color: $color-primary-transparent;
      margin-top: -6.5625rem;
    }
    &.hidden { display: none; }
    &.editorMode {
      display: block;
      height: 150vh;
      bottom: 0;
      z-index: 99999;
      border: 0;
      background-color: transparent;
    }
  }

  .progress-container {
    text-align: center;
    margin-bottom: 0.625rem;
    margin-top: -.3125rem;
    &.hidden { opacity: .1; }
    .progress {
      height: .25rem;
      border-radius: 3px;
      .meter { background: $color-primary; height: 100%; display: block; border-radius: 3px; }
    }
  }
  .img-picker-list {
    margin-left: 0;
    list-style-type: none;
    display: grid;
    &.one-col {
      grid-template-columns: 100%;
      li {
        overflow-wrap: break-word;
      }

      .image-picker-cell {
        .picker-body {
          img {
            height: initial;
          }
        }
      }

    }
    &.two-col {
      grid-template-columns: 50% 50%;
      li {
        overflow-wrap: break-word;
      }
    }
    .image-picker-cell {
      margin-bottom: 1rem;
      // border: 2px solid $border-color;

      .header {
        color: $base-font-color;
        padding-left: 0.3125rem;
        padding-bottom: 0.25rem;
        font-size: 0.8125rem;
        transition: background-color 1s;

        &.added {
          background-color: $color-primary;
        }
      }

      .picker-body {
        // height: 8rem;
        position: relative;

        img {
          height: 10rem;
          object-fit: cover;
        }
      }
    }
  }

</style>
