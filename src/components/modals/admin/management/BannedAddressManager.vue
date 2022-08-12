<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="banAddress">Manually Ban Addresses
        <span class="info-tooltip pointer" data-balloon="Allows admins to manually ban users from registering from particular hostnames/ip addresses. Weight is used when calculating how malicious a user trying to register is. Decay will allow users to register from that particular hostname/ip after an lengthy amount of time, assuming there were no re-offences causing the same address to be banned again" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </span>
      <span v-if="editAddress">Edit Address</span>
      <span v-if="deleteAddress">Delete Address</span>
    </template>

    <template v-slot:body>
      <form class="css-form">
        <div v-if="banAddress">
          <table class="striped ban-addresses" width="100%">
            <thead>
              <tr>
                <th>Type</th>
                <th>Address</th>
                <th width="5%">Decays</th>
                <th width="20%">Weight</th>
              </tr>
            </thead>
            <tr v-for="(addr, index) in addressesToBan" :key="addr">
              <td>
                <select ref="focusInput" class="type"  v-model="addr.typeIp" @change="addr.typeIp ? addr.hostname = undefined : addr.ip = undefined">
                  <option  :value="true" selected="true">IP Address</option>
                  <option :value="false">Hostname</option>
                </select>
              </td>
              <td v-if="addr.typeIp">
                <input v-model="addr.ip" type="text" class="address" placeholder="IP Address to ban" />
              </td>
              <td v-if="!addr.typeIp">
                <input v-model="addr.hostname" type="text" class="address" placeholder="Hostname to ban" />
              </td>
              <td class="decay">
                <input v-model="addr.decay" type="checkbox" :checked="true" />
              </td>
              <td>
                <input v-model="addr.weight" type="number" min="0" class="weight" placeholder="Weight" @keydown="!$event.shiftKey && ($event.which === 9 || $event.which === 13) && addressesToBan.length === (index + 1) && addressesToBan.push({ typeIp:true, weight: 50, decay: true })" />
              </td>
            </tr>
            <tfoot>
              <tr>
                <td colspan="4"><a class="right" @click="addressesToBan.push({ typeIp:true, weight: 50, decay: true })" href="#"><i class="fa fa-plus"></i>&nbsp;Add another address</a></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-if="editAddress">
          <p>Edit weight and decay properties of banned address: <strong v-html="selectedAddress.hostname || selectedAddress.ip"></strong></p>
          <label for="addrWeight"><strong>Weight</strong></label>
            <input type="number" id="addrWeight" name="addrWeight" v-model="selectedAddress.weight" ref="focusInput" required />
          <label for="addrDecay"><strong>Decays</strong></label>
          <input type="radio" name="addrDecay" id="decayYes" :value="true" v-model="selectedAddress.decay" required />
          <label for="decayYes">Yes</label>
          <input type="radio" name="addrDecay" id="decayNo" :value="false" v-model="selectedAddress.decay" required />
          <label for="decayNo">No</label>
          <br>
          <br>
        </div>
        <div v-if="deleteAddress">
          <p ref="focusInput">
            Are you sure you want to delete the address <strong v-html="selectedAddress.hostname || selectedAddress.ip"></strong>?
          </p>
          <br>
        </div>

        <div class="col">
          <div>
            <button class="fill-row" @click.prevent="modify()" :disabled="requestSubmitted || (banAddress && !formValid)" v-html="saveRuleBtnLabel"></button>
          </div>
          <div>
            <button class="fill-row negative" @click.prevent="close()" :disabled="requestSubmitted">Cancel</button>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, watch, inject } from 'vue'
import { cloneDeep, debounce } from 'lodash'
import { adminApi } from '@/api'
import { basicIpRegex, hostnameRegex } from '@/composables/utils/globalRegex'

export default {
  name: 'banned-address-manager-modal',
  props: ['show', 'banAddress', 'editAddress', 'deleteAddress', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.addressesToBan = [{ typeIp:true, weight: 50, decay: true }]
      v.saveRuleBtnLabel = props.deleteAddress ? 'Confirm Delete' : 'Save'
    }

    const modify = () => {
      v.requestSubmitted = true
      let promise, successMsg, errorMsg
      if (props.banAddress) {
        promise = adminApi.bans.addBannedAddresses(v.addressesToBan.filter(addr => {
          if ((addr.ip || addr.hostname) && addr.weight) return addr
        }))
        successMsg = 'Successfully banned addresses!'
        errorMsg = 'There was an error banning addresses'
      }
      else if (props.editAddress) {
        promise = adminApi.bans.editBannedAddress(v.selectedAddress)
        successMsg = `Successfully edited banned addresss ${v.selectedAddress.hostname || v.selectedAddress.ip}!`
        errorMsg = `There was an error editing banned address: ${v.selectedAddress.hostname || v.selectedAddress.ip}`
      }
      else if (props.deleteAddress) {
        promise = adminApi.bans.deleteBannedAddress(v.selectedAddress)
        successMsg = `Successfully deleted banned addresss ${v.selectedAddress.hostname || v.selectedAddress.ip}!`
        errorMsg = `There was an error deleting banned address: ${v.selectedAddress.hostname || v.selectedAddress.ip}`
      }

      promise.then(() => {
        $alertStore.success(successMsg)
        emit('success')
        close()
      })
      .catch(() => $alertStore.error(errorMsg))
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      formValid: false,
      selectedAddress: {},
      addressesToBan: [{ typeIp:true, weight: 50, decay: true }],
      saveRuleBtnLabel: props.deleteAddress ? 'Confirm Delete' : 'Save',
      requestSubmitted: false,
    })

    /* Watch Data */
    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.deleteAddress ? 'Confirm Delete' : 'Save'
      v.selectedAddress = cloneDeep(props.selected)
    })

    watch(() => v.addressesToBan, debounce(async () => {
      v.formValid = true
      v.addressesToBan.forEach(addr => v.formValid = v.formValid && (addr.typeIp && basicIpRegex.test(addr.ip) || !addr.typeIp && hostnameRegex.test(addr.hostname) && addr.weight))
    }), { deep: true })

    return { ...toRefs(v), modify, close }
  }
}
</script>

<style lang="scss" scoped>
.ban-addresses {
  input, select { margin-bottom: 0; }
  td.decay { padding-top: 1rem; }
}
</style>
