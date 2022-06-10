<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="banAddress">Ban Address</span>
      <span v-if="editAddress">Edit Address</span>
      <span v-if="deleteAddress">Delete Address</span>
    </template>

    <template v-slot:body>
      <form class="css-form">
        <div v-if="banAddress">
          <h3 class="thin-underline">Manually Ban Addresses
            <span class="info-tooltip" data-balloon="Allows admins to manually ban users from registering from particular hostnames/ip addresses. Weight is used when calculating how malicious a user trying to register is. Decay will allow users to register from that particular hostname/ip after an lengthy amount of time, assuming there were no re-offences causing the same address to be banned again" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </h3>
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
                <!--TODO(akinsey): Implement ip regex -->
                <input v-model="addr.ip" type="text" ng-pattern="AdminManagementCtrl.ipRegex" class="address" placeholder="IP Address to ban" />
              </td>
              <td v-if="!addr.typeIp">
                <!--TODO(akinsey): Implement ip regex -->
                <input v-model="addr.hostname" type="text" ng-pattern="AdminManagementCtrl.hostnameRegex" class="address" placeholder="Hostname to ban" />
              </td>
              <td>
                <input v-model="addr.decay" class="decay" type="checkbox" :checked="true" />
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
            <button class="fill-row" @click.prevent="modify()" :disabled="requestSubmitted || (banAddress && checkAddresses())" v-html="saveRuleBtnLabel"></button>
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
import { reactive, toRefs, watch } from 'vue'
import { cloneDeep } from 'lodash'

export default {
  name: 'banned-address-manager-modal',
  props: ['show', 'banAddress', 'editAddress', 'deleteAddress', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.deleteAddress ? 'Confirm Delete' : 'Save'
    }

    const modify = () => {
      v.requestSubmitted = true
      if (props.banAddress) console.log('ban address', v.addressesToBan)
      if (props.editAddress) console.log('edit ban address', v.selectedAddress)
      if (props.deleteAddress) console.log('delete ban address', v.selectedAddress)
      emit('success')
      close()
    }

    const checkAddresses = () => {
      return !v.addressesToBan.filter(addr => {
        if ((addr.ip || addr.hostname) && addr.weight) return addr
      }).length
    }


    const close = () => {
      resetForm()
      emit('close')
    }

    /* Template Data */
    const v = reactive({
      focusInput: null,
      selectedAddress: {},
      addressesToBan: [{ typeIp:true, weight: 50, decay: true }],
      saveRuleBtnLabel: props.deleteAddress ? 'Confirm Delete' : 'Save',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.deleteAddress ? 'Confirm Delete' : 'Save'
      v.selectedAddress = cloneDeep(props.selected)
    })

    return { ...toRefs(v), modify, close, checkAddresses }
  }
}
</script>
