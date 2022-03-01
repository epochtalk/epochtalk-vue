<template>
  <h5 class="thin-underline">
    <!-- Title -->
    Advertisements
    <span class="info-tooltip" data-balloon="Allows admins to sell ad space to members. Members can provide admins with an html/css snippet for their advertisment which will be displayed between posts. Factoids can be enabled an will be shown randomly between ads. Ads are cycled randomly" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>

    <!-- Tabs -->
    <dl class="tabs ad-tabs right">
      <dd class="no-select" ng-class="{'active': vm.tab === 'text'}">
        <a ng-click="vm.tab = 'text'">Text</a>
      </dd>
      <dd class="no-select" ng-class="{'active': vm.tab === 'rounds'}">
        <a ng-click="vm.tab = 'rounds'">Rounds</a>
      </dd>
      <dd class="no-select" ng-class="{'active': vm.tab === 'factoids'}">
        <a ng-click="vm.tab = 'factoids'">Factoids</a>
      </dd>
    </dl>
  </h5>

  <!-- Rounds View -->
  <div class="text-view" ng-show="vm.tab === 'text'">
    <!-- Ad Disclaimer -->
    <div class="fill-row">
      <label class="desc-label">Ad Disclaimer
        <span class="info-tooltip" data-balloon="Optional disclaimer which will be displayed above the ads" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </label>
      <textarea ng-model="vm.text.disclaimer"></textarea>
    </div>

    <!-- Ad Disclaimer -->
    <div class="fill-row">
      <label class="desc-label">Ad Information sub-header
        <span class="info-tooltip" data-balloon="An informational area to display text or an admin message regarding the ads." data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </label>
      <textarea ng-model="vm.text.info"></textarea>
    </div>

    <button ng-click="vm.saveText()">
      Save
    </button>
  </div>

  <!-- Rounds View -->
  <div class="rounds-view" ng-show="vm.tab === 'rounds'">
    <!-- Round Controls Upper -->
    <div class="leftcol">
      <!-- label to show that this round is the current one -->
      <span class="put large" ng-if="vm.currentRound === vm.round && vm.currentRound">Current</span>
      <!-- Round Number -->
      <span>Viewing Round: </span>
      <span ng-bind="vm.round || 'None'"></span>
      --
      <span>Current Round: </span>
      <span ng-bind="vm.currentRound || 'None'"></span>
      <span class="info-tooltip" data-balloon="Ads run in rounds so that you can bill customers buying ad space by the round" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </div>

    <div class="rightcol">
      <!-- move to round/paginate rounds -->
      <div class="pagination-slide">
        <div class="prev">
          <button ng-disabled="!vm.nextRound" ng-click="vm.pullRound(vm.nextRound);">
            &#10094; Newer
          </button>
        </div>
        <div class="page" ng-if="vm.round" ng-bind="vm.round"></div>
        <div class="page" ng-if="!vm.round">N/A</div>
        <div class="next">
          <button ng-disabled="!vm.previousRound" ng-click="vm.pullRound(vm.previousRound);">
            Older &#10095;
          </button>
        </div>
      </div>
    </div>

    <!-- Ads -->
    <h5 class="ads-controls" ng-if="vm.round">
      <span ng-if="vm.ads.length">Ads in this Round</span>
      <span ng-if="!vm.ads.length">No Ads for this Round</span>
      <a ng-click="vm.openCreateAd()"><i class="fa fa-plus"></i></a>
    </h5>

    <!-- Ads container -->
    <section class="ads-container">
      <section class="ad-item" ng-repeat="ad in vm.ads track by ad.id">
        <h5 class="thin-underline">
          Ad #{{$index+1}}
          <div class="right">
            <a data-balloon="Duplicate" ng-click="vm.duplicateAd(ad.id)"><i class="fa fa-files-o"></i></a>
            &nbsp;&nbsp;&nbsp;
            <a data-balloon="Edit" ng-click="vm.openEditAd(ad)"><i class="fa fa-pencil"></i></a>
            &nbsp;&nbsp;&nbsp;
            <a data-balloon="Delete" ng-click="vm.openDeleteAd(ad)"><i class="fa fa-trash"></i></a>
          </div>
        </h5>
        <div id="ad-{{$index}}"></div>
      </section>
    </section>

    <!-- Round Controls Lower -->
    <div class="round-controls">
      <div class="leftcol">
        <!-- create new round -->
        <button ng-click="vm.showCreateRound = true">
          <i class="fa fa-plus"></i>&nbsp;&nbsp;Create New Round
        </button>
        <!-- rotate this round -->
        <button ng-click="vm.showRotateRound = true" ng-if="(!vm.currentRound && vm.round) || vm.round > vm.currentRound">
          <i class="fa fa-toggle-right"></i>&nbsp;&nbsp;Use These Ads
        </button>
      </div>

      <div class="rightcol">
        <!-- move to round/paginate rounds -->
        <div class="pagination-slide">
          <div class="prev">
            <button ng-disabled="!vm.nextRound" ng-click="vm.pullRound(vm.nextRound);">
              &#10094; Newer
            </button>
          </div>
          <div class="page" ng-if="vm.round" ng-bind="vm.round"></div>
          <div class="page" ng-if="!vm.round">N/A</div>
          <div class="next">
            <button ng-disabled="!vm.previousRound" ng-click="vm.pullRound(vm.previousRound);">
              Older &#10095;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Factoids View -->
  <div class="factoids-view" ng-show="vm.tab === 'factoids'">
    <div class="leftcol">
      <span>Factoids
        <span class="info-tooltip" data-balloon="Factoids can be quotes, facts, or anything else. They will randomly be displayed between ads to give users a break from advertisments" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
      </span>
    </div>

    <div class="rightcol">
      <a class="right" ng-click="vm.showDisableAllFactoids = 'true'">
        <i class="fa fa-eye-slash"></i>
        &nbsp;&nbsp;&nbsp;
        Disable All
        &nbsp;&nbsp;&nbsp;
      </a>
      <a class="right" ng-click="vm.showEnableAllFactoids = true">
        <i class="fa fa-eye"></i>
        &nbsp;&nbsp;&nbsp;
        Enable All
        &nbsp;&nbsp;&nbsp;
      </a>
      <a class="right" ng-click="vm.openCreateFactoid()">
        <i class="fa fa-plus"></i>
        &nbsp;&nbsp;&nbsp;
        Create
        &nbsp;&nbsp;&nbsp;
      </a>
    </div>

    <section class="factoids-container">
      <section class="factoid-item" ng-repeat="factoid in vm.factoids track by factoid.id" >
        <h5 class="thin-underline">
          <span class="post large" ng-if="factoid.enabled" ng-click="vm.disableFactoid(factoid.id)">Enabled</span>
          <span class="delete large" ng-if="!factoid.enabled" ng-click="vm.enableFactoid(factoid.id)">Disabled</span>
          Factoid #{{$index+1}}
          <div class="right">
            <a ng-click="vm.openEditFactoid(factoid)"><i class="fa fa-pencil"></i></a>
            &nbsp;&nbsp;&nbsp;
            <a ng-click="vm.openDeleteFactoid(factoid)"><i class="fa fa-trash"></i></a>
          </div>
        </h5>
        <div id="factoid-{{$index}}"></div>
      </section>
    </section>
  </div>
</template>

<script>
import { reactive, toRefs, onBeforeMount } from 'vue'
//import { boardsApi, usersApi } from '@/api'

export default {
  name: 'trust-list',
  setup() {
    onBeforeMount(() => {
      // boardsApi.getBoards(true).then(d => v.boards = d.boards).catch(() => {})
      // usersApi.trust.getTrustBoards().then(d => v.trustBoards = d.reduce((acc, b) => {
      //   acc[b.id] = true
      //   return acc
      // }, {})).catch(() => {})
    })

    const v = reactive({ })
    return { ...toRefs(v) }
  }
}
</script>
