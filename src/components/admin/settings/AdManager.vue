<template>
  <div v-if="showComponent">
    <h5 class="thin-underline title">
      <!-- Title -->
      Advertisements
      <span class="info-tooltip" data-balloon="Allows admins to sell ad space to members. Members can provide admins with an html/css snippet for their advertisment which will be displayed between posts. Factoids can be enabled an will be shown randomly between ads. Ads are cycled randomly" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>

      <!-- Tabs -->
      <dl class="tabs ad-tabs right">
        <dd class="no-select" @click="tab = 'text'" :class="{'active': tab === 'text'}">
          <a href="" @click.prevent="">Text</a>
        </dd>
        <dd class="no-select" @click="tab = 'rounds'" :class="{'active': tab === 'rounds'}">
          <a href="" @click.prevent="">Rounds</a>
        </dd>
        <dd class="no-select" @click="tab = 'factoids'" :class="{'active': tab === 'factoids'}">
          <a href="" @click.prevent="">Factoids</a>
        </dd>
      </dl>
    </h5>

    <!-- Rounds View -->
    <div class="text-view" v-show="tab === 'text'">
      <!-- Ad Disclaimer -->
      <div class="fill-row">
        <label class="desc-label">Ad Disclaimer
          <span class="info-tooltip" data-balloon="Optional disclaimer which will be displayed above the ads" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </label>
        <textarea v-model="text.disclaimer"></textarea>
      </div>

      <!-- Ad Disclaimer -->
      <div class="fill-row">
        <label class="desc-label">Ad Information sub-header
          <span class="info-tooltip" data-balloon="An informational area to display text or an admin message regarding the ads." data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </label>
        <textarea v-model="text.info"></textarea>
      </div>

      <button class="negative" @click.prevent="text.disclaimer = ''; text.info = ''">
        Clear
      </button>
      <button @click="saveText()">
        Save
      </button>
    </div>

    <!-- Rounds View -->
    <div class="rounds-view" v-show="tab === 'rounds'">
      <!-- Round Controls Upper -->
      <div class="leftcol">
        <!-- label to show that this round is the current one -->
        <span class="put large" v-if="currentRound === round && currentRound">Current</span>
        <!-- Round Number -->
        <span>Viewing Round: </span>
        <span>{{round || 'None'}}</span>
        --
        <span>Current Round: </span>
        <span>{{currentRound || 'None'}}</span>
        <span class="info-tooltip" data-balloon="Ads run in rounds so that you can bill customers buying ad space by the round" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </div>

      <div class="rightcol">
        <!-- move to round/paginate rounds -->
        <div class="pagination-slide">
          <div class="prev">
            <button :disabled="!nextRound" @click="pullRound(nextRound)">
              &#10094; Newer
            </button>
          </div>
          <div class="page">{{round || 'N/A'}}</div>
          <div class="next">
            <button :disabled="!previousRound" @click="pullRound(previousRound);">
              Older &#10095;
            </button>
          </div>
        </div>
      </div>

      <!-- Ads -->
      <div class="ad-wrap">
        <h5 class="ads-controls" v-if="round">
          <div class="col">
            <div>
              <span v-if="ads.length">Ads in this Round</span>
              <span v-if="!ads.length">Currently no Ads in this Round</span>
            </div>
            <div>
              <a class="button" href="#" @click.prevent="showCreateAd = true; selectedAd = { round: round, html: '', css: '' }"><i class="fa fa-plus"></i>&nbsp;&nbsp;Create New Ad</a>
            </div>
          </div>
        </h5>

        <!-- Ads container -->
        <section class="ads-container">
          <table class="striped ads-table full-width">
            <thead>
              <th>Number</th>
              <th>Display</th>
              <th>Actions</th>
            </thead>
            <tbody>
              <tr v-for="(ad, index) in ads" :key="ad.id">
                <td width="10%">Ad #{{index+1}}</td>
                <td width="80%" :id="'ad-' + index"></td>
                <td width="10%">
                  <a href="#" data-balloon="Duplicate" @click.prevent="showDuplicateAd = true; selectedAd = ad"><i class="fas fa-clone"></i></a>
                  &nbsp;&nbsp;&nbsp;
                  <a href="#" data-balloon="Edit" @click.prevent="showUpdateAd = true; selectedAd = ad"><i class="fas fa-edit"></i></a>
                  &nbsp;&nbsp;&nbsp;
                  <a href="#" data-balloon="Delete" @click.prevent="showDeleteAd = true; selectedAd = ad"><i class="fa fa-trash"></i></a>
                </td>
              </tr>
              <tr v-if="!ads || ads.length < 1">
                <td>No ads to display</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <!-- Round Controls Lower -->
      <div class="leftcol">
        <!-- create new round -->
        <button @click="showCreateRound = true">
          <i class="fa fa-plus"></i>&nbsp;&nbsp;Create New Round
        </button>
        <!-- rotate this round -->
        <button @click="showRotateRound = true" v-if="(!currentRound && round) || round > currentRound">
          <i class="fa fa-toggle-right"></i>&nbsp;&nbsp;Use These Ads
        </button>
      </div>

      <div class="rightcol">
        <!-- move to round/paginate rounds -->
        <div class="pagination-slide">
          <div class="prev">
            <button :disabled="!nextRound" @click="pullRound(nextRound)">
              &#10094; Newer
            </button>
          </div>
          <div class="page">{{round || 'N/A'}}</div>
          <div class="next">
            <button :disabled="!previousRound" @click="pullRound(previousRound)">
              Older &#10095;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Factoids View -->
    <div class="factoids-view" v-show="tab === 'factoids'">
      <div class="leftcol">
        <span>Factoids
          <span class="info-tooltip" data-balloon="Factoids can be quotes, facts, or anything else. They will randomly be displayed between ads to give users a break from advertisments" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </span>
      </div>

      <div class="rightcol">
        <a class="right pointer" @click="showDisableAllFactoids = true">
          <i class="fa fa-eye-slash"></i>
          &nbsp;&nbsp;&nbsp;
          Disable All
          &nbsp;&nbsp;&nbsp;
        </a>
        <a class="right pointer" @click="showEnableAllFactoids = true">
          <i class="fa fa-eye"></i>
          &nbsp;&nbsp;&nbsp;
          Enable All
          &nbsp;&nbsp;&nbsp;
        </a>
        <a class="right pointer" @click="showCreateFactoid = true; selectedFactoid = { text: '' }">
          <i class="fa fa-plus"></i>
          &nbsp;&nbsp;&nbsp;
          Create
          &nbsp;&nbsp;&nbsp;
        </a>
      </div>

      <section class="factoids-container full-width">
        <table class="striped ads-table full-width">
          <thead>
            <th>Number</th>
            <th>Display</th>
            <th>Enabled</th>
            <th>Actions</th>
          </thead>
          <tbody>
            <tr v-for="(factoid, index) in factoids" :key="factoid.id">
              <td width="10%">Factoid #{{index+1}}</td>
              <td width="80%" :id="'factoid-' + index"></td>
              <td width="5%">
                <span class="post large pointer" v-if="factoid.enabled" @click="enableFactoid(factoid.id, false)">Enabled</span>
                <span class="delete large pointer" v-if="!factoid.enabled" @click="enableFactoid(factoid.id, true)">Disabled</span>
              </td>
              <td width="5%">
                <a href="#" data-balloon="Edit" @click.prevent="showUpdateFactoid = true; selectedFactoid = factoid"><i class="fas fa-edit"></i></a>
                &nbsp;&nbsp;&nbsp;
                <a href="#" data-balloon="Delete" @click.prevent="showDeleteFactoid = true; selectedFactoid = factoid"><i class="fa fa-trash"></i></a>
              </td>
            </tr>
            <tr v-if="!factoids || factoids.length < 1">
              <td>No factoids to display</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
  <ad-manager-modal :show="showCreateRound || showCreateAd || showUpdateAd || showDuplicateAd || showRotateRound || showDeleteAd || showCreateFactoid || showUpdateFactoid || showDeleteFactoid || showEnableAllFactoids || showDisableAllFactoids" :createRound="showCreateRound" :createAd="showCreateAd" :deleteAd="showDeleteAd" :duplicateAd="showDuplicateAd" :rotateRound="showRotateRound" :round="round" :updateAd="showUpdateAd" :createFactoid="showCreateFactoid" :updateFactoid="showUpdateFactoid" :deleteFactoid="showDeleteFactoid" :enableFactoids="showEnableAllFactoids" :disableFactoids="showDisableAllFactoids" @close="showCreateRound = false; showRotateRound = false; showCreateAd = false; showUpdateAd = false; showDeleteAd = false; showDuplicateAd = false; showCreateFactoid = false; showUpdateFactoid = false; showDeleteFactoid = false; showEnableAllFactoids = false; showDisableAllFactoids = false" :factoid="selectedFactoid" :ad="selectedAd" @success="pullRound" />
</template>

<script>
import { reactive, toRefs, onBeforeMount, inject } from 'vue'
import { adsApi } from '@/api'
import AdManagerModal from '@/components/modals/admin/settings/AdManager.vue'

export default {
  name: 'ad-manager',
  components: { AdManagerModal },
  setup() {
    onBeforeMount(() => pullRound())

    const pullRound = round => adsApi.rounds.getRound({ roundNumber: round || v.currentRound, type: 'both' })
      .then(d => {
        v.ads = d.ads
        v.factoids = d.factoids
        v.round = d.rounds.viewing
        v.currentRound = d.rounds.current
        v.nextRound = d.rounds.next
        v.previousRound = d.rounds.previous
        v.text = d.text
      })
      .then(trashAds)
      .then(renderAds)
      .then(renderFactoids)
      .catch(err => {
        if (err.status === 403) v.showComponent = false
        else $alertStore.error(err)
      })

    const renderAds = () => {
      v.ads.forEach((ad, index) => {
        // render css
        var node = document.getElementById(ad.id)
        if (!node && ad.display_css) {
          v.adsCss.push(ad.id) // keep track of what we loaded
          node = document.createElement('style')
          node.setAttribute('id', ad.id)
          node.innerHTML = ad.display_css
          document.body.appendChild(node)
        }
        // render html
        document.getElementById('ad-' + index).innerHTML = ad.display_html
      })
    }

    // Render Factoids
    const renderFactoids = () => {
      v.factoids.forEach((factoid, index) => {
        document.getElementById('factoid-' + index).innerHTML = factoid.text
      })
    }

    const trashAds = () => {
      v.adsCss.map(adId => {
        let node = document.getElementById(adId)
        node.parentElement.removeChild(node)
      })
      v.adsCss = []
    }

    const saveText = () => adsApi.saveText(v.text)
      .then(() => $alertStore.success('Successfully saved text data!'))
      .catch(() => $alertStore.error('There was an error saving text data.'))

    const enableFactoid =  (id, enable) => {
      const requestPromise = enable ? adsApi.factoids.enable : adsApi.factoids.disable
      requestPromise({ id: id }).then(() => {
        $alertStore.success(`Successfully ${enable ? 'enabled': 'disabled'} factoid!`)
        pullRound()
      })
      .catch(() => $alertStore.error(`There was an issue ${enable ? 'enabling': 'disabling'} factoid.`))
      .finally(() => close())
    }


    const $alertStore = inject('$alertStore')

    const v = reactive({
      showCreateAd: false,
      showUpdateAd: false,
      showDeleteAd: false,
      showDuplicateAd: false,
      showCreateRound: false,
      showRotateRound: false,
      showCreateFactoid: false,
      showUpdateFactoid: false,
      showDeleteFactoid: false,
      showEnableAllFactoids: false,
      showDisableAllFactoids: false,
      tab: 'rounds',
      showComponent: true,
      ads: null,
      factoids: null,
      round: null,
      currentRound: 'current',
      selectedAd: null,
      selectedFactoid: null,
      nextRound: null,
      previousRound: null,
      text: { disclaimer: '', info: '' },
      adsCss: []
    })
    return { ...toRefs(v), saveText, pullRound, enableFactoid }
  }
}
</script>

<style lang="scss" scoped>
  // ads viewer
  #eptAd { padding-bottom: 1rem; }
  .title { line-height: 2.5rem; }
  .ad-text { text-align: center; }
  .ad-disclaimer { text-align: center; font-size: 0.8rem; }

  // ad settings
  .ad-settings {
    float: left;
    display: block;
    width: 100%;
    padding-top: 2rem;
  }
  .ad-tabs { margin-top: -0.5rem; padding-bottom: 0.8rem; }

  .rounds-view {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(auto, auto);
    .ad-wrap {
      grid-column: 1 / 3;
    }
    .leftcol {
      display: flex;
      column-gap: .5rem;
      h2 { display: inline-block; }
      margin-bottom: 1.5rem;
      span { font-size: 1.25rem; };
    }
    .rightcol {
      .pagination-slide {
        display: flex;
        width: 100%;
        flex-direction: row;
        column-gap: 1rem;
        align-items: stretch;
        justify-content: flex-end;
        .prev, .next, .page {
          flex: 0;
          text-align: right;
          line-height: 2.25rem;
          button { width: 7rem; float: right; }
        }
      }
    }
  }
  .ads-controls .col {
    .button { float: right; width: 16.5rem; text-transform: capitalize; }
  }
  .ads-controls { clear: both; padding-top: 1rem; padding-bottom: 0; text-align: left; }
  .ads-container {
    .ad-item {
      margin: auto;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  }

  .text-view { display: grid; grid-template-columns: 50% 50%; grid-column-gap: .5rem; }

  .factoids-view {
    display: grid;
    grid-template-columns: 50% 50%;
    .leftcol {
      h2 { display: inline-block; }
      margin-bottom: 1.5rem;
      span { font-size: 1.25rem; };
    }
  }

  .factoids-container {
    .factoid-item {
      margin: auto;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  }

  // Ad Information
  .page-header { margin-bottom: 0.5rem; }
  .info-text { margin-bottom: 1.5rem; }
  .container-header { font-weight: bold; }
  .container-subheader { margin-bottom: 1rem; }
  .ads-container.info { padding-bottom: 1rem; }
  .ad-item.info {
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid $border-color;
  }
  .ad-item.info:first-child { padding-top: 0px; }
  .ad-item.info:last-child { border-bottom: 0px; padding-bottom: 0px; }
  .factoid-header { margin-top: 1.5rem; }
  .factoids-listing li { margin-left: 1.5rem; }


  // Ad Analytics
  .text-right th, .text-right td { text-align: right; }
  .analytics-view {
    display: grid;
    grid-template-columns: 50% 50%;
  }

  .ads-table {
    tbody tr td { padding-left: 0; }
    thead {
      border-bottom: 1px solid $border-color;
      text-align: left;
    }
  }
</style>
