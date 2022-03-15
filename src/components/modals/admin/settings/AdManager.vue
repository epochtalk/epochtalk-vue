<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="createRound">Create Round</span>
      <span v-if="rotateRound">Rotate Round</span>
      <span v-if="createAd">Create Ad for Round {{round}}</span>
      <span v-if="deleteAd">Delete Ad</span>
      <span v-if="createFactoid">Create Factoid</span>
      <span v-if="updateFactoid">Update Factoid</span>
      <span v-if="enableFactoids">Enable Factoid</span>
      <span v-if="disableFactoids">Disable Factoid</span>
    </template>

    <template v-slot:body>
      <form class="css-form">

        <!-- create round -->
        <div v-if="createRound">
          <p class="input-spacing">This will create a new round (Rounds cannot be deleted)</p>
          <div class="col">
            <button @click.prevent="createNewRound()">Create Round</button>
            <button class="negative" @click.prevent="close()">Cancel</button>
          </div>
        </div>

        <!-- create ad -->
        <div v-if="createAd">
          <label class="desc-label">HTML (use ${hash} to obfuscate css classes)</label>
          <textarea class="input-text" v-model="currentAd.html" ref="focusInput"></textarea>
          <label class="desc-label">CSS (use ${hash} to obfuscate css classes)</label>
          <textarea class="input-text" v-model="currentAd.css"></textarea>
          <br />
          <div class="col">
            <button @click.prevent="modifyAd()" :disabled="!currentAd.html">Save</button>
            <button class="negative" @click.prevent="close()">Cancel</button>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, watch } from 'vue'
import { adsApi } from '@/api'

export default {
  name: 'rank-modal',
  props: ['show', 'createRound', 'rotateRound', 'createAd', 'deleteAd', 'createFactoid', 'updateFactoid', 'enableFactoids', 'disableFactoids', 'round', 'ad'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      // v.saveRuleBtnLabel = props.remove ? 'Confirm Delete' : 'Save'
    }

    const createNewRound = () => {
      v.requestSubmitted = true
      adsApi.rounds.create()
      .then(data => {
        v.round = data.round
        $alertStore.success(`Sucessfully created round ${v.round}!`)
        emit('success', v.round)
      })
      .catch(() => $alertStore.error('There was an issue creating round.'))
      .finally(() => close())
    }

    const modifyAd = () => {
      adsApi.create(v.currentAd)
      .then(() => {
        $alertStore.success(`Successfully created an ad for round ${v.round}!`)
        emit('success', v.round)
      })
      .catch(() => $alertStore.error('There was an issue creating ad.'))
      .finally(() => close())
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      round: props.round,
      requestSubmitted: false,
      currentAd: props.ad
    })

    // watch(() => props.show, () => {
    //   v.newRank = props.edit || props.remove ? cloneDeep(props.selected) : {}
    // })

    watch(() => props.round, r => v.round = r)
    watch(() => props.ad, a => v.currentAd = a)

    return { ...toRefs(v), createNewRound, modifyAd, close }
  }
}
</script>

<style lang="scss">
  .input-spacing { margin-bottom: 1rem; }
  .col {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    column-gap: 0.5rem;
    div {
      flex: 1;
      button { width: 100%; }
    }
  }
</style>
