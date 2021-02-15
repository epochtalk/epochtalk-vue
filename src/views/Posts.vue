<template>
  <div class="thread-controls-wrap">
    <!-- Moderated Thread Banner -->
    <div class="banner-container">
      <div class="banner warning" v-if="postData.data?.thread.moderated">
        Moderated Thread &mdash; <em>Thread starter can moderate posts.</em>
      </div>
    </div>

    <!-- Page Title -->
    <div class="page-header-split">
      <!-- Show Title -->
      <div v-if="!editThread" class="thread-title">
        <h1>{{postData.data.thread.title}}</h1>
        <!-- TODO(boka): add data-balloon plugin -->
        <!-- <a data-balloon="Edit Thread Title" href="#" class="do-edit" v-if="PostsParentCtrl.canEditTitle()" @click.prevent="PostsParentCtrl.openEditThread()"> -->
        <a href="#" class="do-edit" v-if="canEditTitle()" @click.prevent="openEditThread()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <title></title>
            <path d="M7.38,33.74h0L4,44l10.26-3.39h0L41.74,13.14,34.86,6.26Zm31-21.15.54.55L14.26,37.79l-.54-.54" />
            <path d="M45.48,6.89,41.11,2.52a1.78,1.78,0,0,0-2.5,0L36.11,5,43,11.89l2.5-2.5A1.76,1.76,0,0,0,45.48,6.89Z" />
          </svg>
        </a>
        <div class="threadStates">
          <div class="badge locked" v-if="postData.data.thread.locked">
            <div class="">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- <a href="#" id="lockThread" v-if="canLock()" :class="{'clicked' : postData.data.thread.locked }" @click.prevent="updateThreadLock()" class="badgeContents" data-balloon="{{PostsParentCtrl.thread.locked ? 'Unlock Thread' : 'Lock Thread'}}"> -->
              <a href="#" id="lockThread" v-if="canLock()" :class="{'clicked' : postData.data.thread.locked }" @click.prevent="updateThreadLock()" class="badgeContents">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
                </svg>
                Locked
              </a>
              <span id="cannotThread" v-if="!canLock()" :class="{'clicked' : postData.data.thread.locked }" class="badgeContents">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
                </svg>
                Locked
              </span>
            </div>
          </div>
          <div class="badge sticky" v-if="postData.data.thread.sticky">
            <a href="#" id="badge__stickyThread"
              :class="{'clicked' : postData.data.thread.sticky }"
              v-if="canSticky()"
              @click.prevent="updateThreadSticky()" class="badgeContents">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="{{PostsParentCtrl.thread.canSticky ? 'Sticky Thread' : 'Unsticky Thread'}}"> -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                  <g id="icons"><path d="M44.27,11.92,35.08,2.73a2.5,2.5,0,1,0-3.53,3.53l9.19,9.19a2.5,2.5,0,0,0,3.53-3.53Z"/><path d="M16.34,16.51a3,3,0,1,0-4.24,4.25l5.66,5.65L6.44,37.73l-2.12,5,4.95-2.12L20.59,29.24l5.65,5.66a3,3,0,1,0,4.25-4.24Z"/><rect x="21.78" y="11.22" width="16" height="12" transform="translate(-3.46 26.1) rotate(-45)"/>
                </g>
              </svg>
              Sticky
            </a>
            <span id="badge__cannotStickyThread"
              :class="{'clicked' : postData.data.thread.sticky }"
              v-if="!canSticky()"
              class="badgeContents">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                  <g id="icons"><path d="M44.27,11.92,35.08,2.73a2.5,2.5,0,1,0-3.53,3.53l9.19,9.19a2.5,2.5,0,0,0,3.53-3.53Z"/><path d="M16.34,16.51a3,3,0,1,0-4.24,4.25l5.66,5.65L6.44,37.73l-2.12,5,4.95-2.12L20.59,29.24l5.65,5.66a3,3,0,1,0,4.25-4.24Z"/><rect x="21.78" y="11.22" width="16" height="12" transform="translate(-3.46 26.1) rotate(-45)"/>
                </g>
              </svg>
              Sticky
            </span>
          </div>
        </div>
      </div>
      <!-- Edit Title -->
      <div v-if="editThread" class="edit-thread-title">
        <form @submit.prevent="updateThreadTitle()">
          <input type="text" v-model="postData.data.thread.title" maxlength="255">
          <div class="actions">
            <button @click.prevent="closeEditThread()" class="secondary small">Cancel</button>
            <button type="submit" :disabled="postData.data.thread.title.length === 0" class="small">Save</button>
          </div>
        </form>
      </div>
    </div>


    <!-- Polls -->
    <div class="fill-row" v-if="addPoll">
      <!-- <poll-creator poll="PostsParentCtrl.poll" valid="PostsParentCtrl.pollValid"></poll-creator> -->
      <button class="fill-row" :disabled="!pollValid" @click.prevent="createPoll()">Create Poll</button>
    </div>
    <!-- <poll-viewer thread="PostsParentCtrl.thread" user-priority="PostsParentCtrl.posts[0].user.priority" reset="PostsParentCtrl.resetPoll"></poll-viewer> -->

    <!-- <pagination page-count="PostsParentCtrl.pageCount" page="PostsParentCtrl.page"></pagination> -->

  </div>

  <!-- Ads -->
  <!-- <ad-viewer page="PostsParentCtrl.page"></ad-viewer> -->

  <!-- Posts Listing -->
  <div :id="post.id" v-for="(post, i) in postData.data.posts" :key="post.id" class="post-block" :class="{ 'highlighted': post.highlighted, 'hidden': post.hidden, 'deleted': post._deleted || post.user.ignored,  'editing': post.id === posting.post.id }">
    <!-- Delete Post View -->
    <div class="deleted" v-if="post._deleted || post.user.ignored">
      Post
      <span v-if="post._deleted">Hidden</span>
      <div class="right bold secondary-font-color-light" v-if="post._deleted">#{{post.position}}</div>
      <span v-if="post.user.ignored">Ignored</span>
      <small class="pointer" v-if="post.user.ignored" @click.prevent="post.user.ignored = false">
        <strong>- Show Post</strong>
      </small>
    </div>

    <!-- Visible Post View -->
    <div v-if="!post._deleted && !post.user.ignored" class="post-block-grid">
      <!-- Post Profile Section -->
      <div class="post-user">
        <a href="#">
        <!-- <a ui-sref="profile.posts({ username: post.user.username})"> -->
          <div class="user-avatar" :class="defaultAvatarShape">
            <!-- TODO(boka): add data-balloon plugin -->
            <!-- data-balloon="{{post.user.username}} is online" -->
            <span v-if="post.user.online" class="online green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                <circle cx="24" cy="24" r="16" />
              </svg>
            </span>
            <img :src="post.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
          </div>
          <div class="original-poster" v-if="post.user.original_poster">OP</div>
          <div v-if="post.user.activity > -1" :title="('Activity: ' + post.user.activity)" class="user-activity">Act: <span class="user-activity-value">{{post.user.activity}}</span></div>
        </a>


        <div class="user-trust" v-if="loggedIn">
          <!-- <trust-score user="post.user" visible="postData.data.thread.trust_visible"></trust-score> -->
        </div>

        <div class="user-rank">
          <!-- <rank-display ranks="postData.data.metadata.ranks" maps="postData.data.metadata.rank_metric_maps" user="post.user"></rank-display> -->
        </div>
        <!-- TODO(akinsey): <ignore-posts post="post"></ignore-posts> -->
      </div>

      <!-- Post Body Section -->
      <div :id="(i + 1) === postData.data.posts.length ? 'last' : ''" class="post-content">
        <!-- Post Title -->
        <div class="post-title">
          <div class="post-title-user">
            <!-- TODO(boka): add data-balloon plugin -->
            <!-- <a class="username" data-balloon="{{post.user.role_name || 'User'}}" ui-sref="profile.posts({ username: post.user.username})"  ng-bind="post.user.username"></a> -->
            <a class="username" href="#">{{post.user.username}}</a>
            <div :title="post.user.name" v-if="post.user.name" class="display-name">
              <span>{{truncate(post.user.name, 33)}}</span>
              <span class="hide-mobile">&nbsp;&mdash;&nbsp;</span>
            </div>
            <div :title="post.user.role_name || 'user'" class="user-role" v-style="userRoleHighlight(post.user.highlight_color)">{{post.user.role_name || 'user'}}</div>
            <div class="timestamp">
              <span>{{humanDate(post.created_at)}}</span>
              <span v-if="showEditDate(post) && post.metadata.edited_by_username">{{'&nbsp;&mdash;&nbsp;Edited ' + humanDate(post.updated_at) + ' by '}}</span><a v-if="showEditDate(post) && post.metadata.edited_by_username" href="#">{{post.metadata.edited_by_username}}</a>
              <span v-if="showEditDate(post) && !post.metadata.edited_by_username">{{'&nbsp;&mdash;&nbsp;Edited ' + humanDate(post.updated_at)}}</span>
              <span v-if="post.metadata.locked_by_username">{{'&nbsp;&mdash;&nbsp;Locked ' + humanDate(post.metadata.locked_at) + ' by '}}</span>
              <a v-if="post.metadata.locked_by_username" href="#">{{post.metadata.locked_by_username}}</a>
            </div>
          </div>

          <ul class="post-action">
            <li v-if="canPurge() && post.position !== 1">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Purge" -->
              <a href="" class="post-action-icon" @click.prevent="openPurgeModal(i)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M7.73,14.82,12.08,45H35.92l4.35-30.18H7.73Zm9.69,25.26A1.23,1.23,0,0,1,16.08,39L14.52,21.08a1.23,1.23,0,0,1,1.12-1.34A1.22,1.22,0,0,1,17,20.86l1.57,17.89A1.22,1.22,0,0,1,17.42,40.08ZM31,20.86a1.22,1.22,0,0,1,1.33-1.12,1.23,1.23,0,0,1,1.12,1.34L31.92,39a1.23,1.23,0,0,1-2.46-.21Zm-5.8.08v18a1.23,1.23,0,1,1-2.46,0V20.94a1.23,1.23,0,1,1,2.46,0Z" />
                  <path
                    d="M39.32,7.64H32.14C32.14,3,28.39,3,28.39,3H19.61s-3.75,0-3.75,4.64H8.68a1.93,1.93,0,0,0-2.09,2v3.23H41.41V9.61A1.93,1.93,0,0,0,39.32,7.64Zm-10-.1H18.72V7A1.59,1.59,0,0,1,20.3,5.43h7.4A1.59,1.59,0,0,1,29.28,7Z" />
                </svg>
              </a>
            </li>
            <li v-if="canDelete(post) && post.position !== 1 && !post.deleted">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Hide"  -->
              <a href="" class="post-action-icon" @click.prevent="openDeleteModal(i, post.locked)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M39.22,15.68l-3.64,5.2A12.36,12.36,0,0,1,36,24,12,12,0,0,1,25,36l-1.6,2.28.57,0C36.7,38.25,48,24,48,24A51.61,51.61,0,0,0,39.22,15.68Z" />
                  <path
                    d="M34.18,4.65l-4.25,6.08a19.49,19.49,0,0,0-5.93-1C11.3,9.75,0,24,0,24A49.75,49.75,0,0,0,12.93,35l-4.7,6.71,4.91,3.45,26-37.08ZM12,24A12,12,0,0,1,24,12a11.86,11.86,0,0,1,4.43.87l-1.78,2.54a8.62,8.62,0,0,0-5.71.16,3.93,3.93,0,1,1-5.37,5.37,8.8,8.8,0,0,0,1.26,8.49L15.05,32A12,12,0,0,1,12,24Z" />
                  <path d="M33,24.6l-5.34,7.63A9,9,0,0,0,33,24.6Z" />
                </svg>
              </a>
            </li>
            <li v-if="canDelete(post) && post.deleted">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Unhide" -->
              <a href="" class="post-action-icon selected" @click.prevent="openUndeleteModal(i)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M39.22,15.68l-3.64,5.2A12.36,12.36,0,0,1,36,24,12,12,0,0,1,25,36l-1.6,2.28.57,0C36.7,38.25,48,24,48,24A51.61,51.61,0,0,0,39.22,15.68Z" />
                  <path
                    d="M34.18,4.65l-4.25,6.08a19.49,19.49,0,0,0-5.93-1C11.3,9.75,0,24,0,24A49.75,49.75,0,0,0,12.93,35l-4.7,6.71,4.91,3.45,26-37.08ZM12,24A12,12,0,0,1,24,12a11.86,11.86,0,0,1,4.43.87l-1.78,2.54a8.62,8.62,0,0,0-5.71.16,3.93,3.93,0,1,1-5.37,5.37,8.8,8.8,0,0,0,1.26,8.49L15.05,32A12,12,0,0,1,12,24Z" />
                  <path d="M33,24.6l-5.34,7.63A9,9,0,0,0,33,24.6Z" />
                </svg>
              </a>
            </li>
            <li v-if="canPostLock(post) && !post.locked">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Lock Post" -->
              <a href="" class="post-action-icon" @click.prevent="lockPost(post)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
                </svg>
              </a>
            </li>
            <li v-if="canPostLock(post) && post.locked">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Unlock Post" -->
              <a href="" class="post-action-icon selected" @click.prevent="unlockPost(post)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
                </svg>
              </a>
            </li>

            <li v-if="loggedIn && (permissionUtils.hasPermission('reports.createPostReport') || permissionUtils.hasPermission('reports.createUserReport')) && !bannedFromBoard">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Report" -->
              <a href="" class="post-action-icon" @click.prevent="openReportModal(post)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M46.7,41.82l-21.4-37a1.5,1.5,0,0,0-2.6,0l-21.4,37A1.45,1.45,0,0,0,2.6,44H45.4A1.45,1.45,0,0,0,46.7,41.82ZM26.08,18,25.5,32h-3l-.57-14ZM24,39.21a2.5,2.5,0,1,1,2.43-2.5A2.35,2.35,0,0,1,24,39.21Z" />
                </svg>
              </a>
            </li>
            <li v-if="canUpdate(post)">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Edit" -->
              <a href="" class="post-action-icon" @click.prevent="loadEditor(post)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path d="M7.38,33.74h0L4,44l10.26-3.39h0L41.74,13.14,34.86,6.26Zm31-21.15.54.55L14.26,37.79l-.54-.54" />
                  <path d="M45.48,6.89,41.11,2.52a1.78,1.78,0,0,0-2.5,0L36.11,5,43,11.89l2.5-2.5A1.76,1.76,0,0,0,45.48,6.89Z" />
                </svg>
              </a>
            </li>
            <li v-if="canPost()">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Quote" -->
              <a href="" class="post-action-icon" @click.prevent="addQuote(post)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M42,2H6A4,4,0,0,0,2,6V32a4,4,0,0,0,4,4H27.74l10.88,9.71c.63.63,1.38.18,1.38-.71V36h2a4,4,0,0,0,4-4V6A4,4,0,0,0,42,2ZM22,18a13.67,13.67,0,0,1-.42,3.27,8.32,8.32,0,0,1-1.17,2.69,5.39,5.39,0,0,1-1.76,1.85,9.62,9.62,0,0,1-2.65.69V23.59a4.07,4.07,0,0,0,1.4-.49,3.53,3.53,0,0,0,.93-1.3A5.68,5.68,0,0,0,18.82,20a17.87,17.87,0,0,0,.09-2H16V12h6Zm9.88,3.27a8.39,8.39,0,0,1-1,2.69,6,6,0,0,1-2,1.85c-.79.46-.87.69-2.87.69V23.59a5,5,0,0,0,1.69-.49,3.86,3.86,0,0,0,1.08-1.3A6.29,6.29,0,0,0,29.33,20c.1-.68.16-2,.16-2H26V12h6v6A14,14,0,0,1,31.88,21.25Z" />
                </svg>
              </a>
            </li>
            <li v-if="loggedIn && pageData.data.thread.locked">
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Quote" -->
              <a href="" @click.prevent="copyQuote(post)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path
                    d="M42,2H6A4,4,0,0,0,2,6V32a4,4,0,0,0,4,4H27.74l10.88,9.71c.63.63,1.38.18,1.38-.71V36h2a4,4,0,0,0,4-4V6A4,4,0,0,0,42,2ZM22,18a13.67,13.67,0,0,1-.42,3.27,8.32,8.32,0,0,1-1.17,2.69,5.39,5.39,0,0,1-1.76,1.85,9.62,9.62,0,0,1-2.65.69V23.59a4.07,4.07,0,0,0,1.4-.49,3.53,3.53,0,0,0,.93-1.3A5.68,5.68,0,0,0,18.82,20a17.87,17.87,0,0,0,.09-2H16V12h6Zm9.88,3.27a8.39,8.39,0,0,1-1,2.69,6,6,0,0,1-2,1.85c-.79.46-.87.69-2.87.69V23.59a5,5,0,0,0,1.69-.49,3.86,3.86,0,0,0,1.08-1.3A6.29,6.29,0,0,0,29.33,20c.1-.68.16-2,.16-2H26V12h6v6A14,14,0,0,1,31.88,21.25Z" />
                </svg>
              </a>
            </li>
            <li>
              <!-- TODO(boka): add data-balloon plugin -->
              <!-- data-balloon="Permalink" -->
              <a href="#" @click.prevent="highlightPost()" class="post-action-icon">
                <!-- <i class="icon-epoch-link"></i> -->
                <strong>#{{post.position}}</strong>
              </a>
            </li>
          </ul>
          <!-- <div class="clear"></div> -->
        </div>
        <!-- Post Body -->
        <!-- TODO(akinsey): post-processing="post.body_html" style-fix="true" -->
        <div class="post-body" :class="{ 'rtl': post.right_to_left }">{{post.body_html}}</div>
        <div v-if="post.user.signature && !disableSignature">
          <!-- TODO(akinsey): post-processing="post.user.signature" style-fix="true" -->
          <div class="post-signature">{{post.user.signature}}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-block">
      <div v-if="canPost()" class="sidebar-actions">
        <!-- <a class="button" @click.prevent="loadEditor()" v-if="PostsParentCtrl.canPost()">Post Reply</a> -->

        <!-- Post Tools -->
        <div class="post-tools">
          <!-- Watch Thread -->
          <!-- TODO(boka): add data-balloon plugin -->
          <!-- data-balloon="Watch Thread" -->
          <div v-if="showUserControls()">
            <a class="" v-if="!PostsParentCtrl.thread.watched" @click.prevent="PostsParentCtrl.watchThread()" >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                <path
                  d="M24,9.75C11.3,9.75,0,24,0,24S11.3,38.25,24,38.25,48,24,48,24,36.7,9.75,24,9.75ZM24,36A12,12,0,1,1,36,24,12,12,0,0,1,24,36Z" />
                <path d="M24,15a8.89,8.89,0,0,0-3.06.57,3.93,3.93,0,1,1-5.37,5.37A8.89,8.89,0,0,0,15,24a9,9,0,1,0,9-9Z" />
              </svg>
            </a>
          </div>

          <!-- Add a Poll -->
          <!-- TODO(boka): add data-balloon plugin -->
          <!-- data-balloon="Add a Poll" -->
          <div v-if="showUserControls()">
            <a class="" v-if="PostsParentCtrl.canCreatePoll()"
              @click.prevent="PostsParentCtrl.addPoll = !PostsParentCtrl.addPoll">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                <polygon points="43.25 41.75 4.75 41.75 4.75 6.25 7.75 6.25 7.75 38.75 43.25 38.75 43.25 41.75" />
                <rect x="9.75" y="28.75" width="6" height="8" />
                <rect x="18.75" y="18.75" width="6" height="18" />
                <rect x="27.75" y="23.75" width="6" height="13" />
                <rect x="36.75" y="8.75" width="6" height="28" />
              </svg>
            </a>
          </div>

          <!-- Thread Lock -->
          <!-- TODO(boka): add data-balloon plugin -->
          <div class="control" data-balloon="{{PostsParentCtrl.thread.locked ? 'Unlock Thread' : 'Lock Thread'}}"
            v-if="PostsParentCtrl.canLock()">
            <a href="#" id="lockThread" :class="{'clicked' : PostsParentCtrl.thread.locked }"
              @click.prevent="PostsParentCtrl.updateThreadLock()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                <path
                  d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
              </svg>
            </a>
          </div>

          <!-- Thread Sticky -->
          <!-- TODO(boka): add data-balloon plugin -->
          <div class="control" data-balloon="{{PostsParentCtrl.thread.sticky ? 'Unsticky Thread' : 'Sticky Thread'}}"
            v-if="PostsParentCtrl.canSticky()">
            <a href="#" id="stickyThread" :class="{'clicked' : PostsParentCtrl.thread.sticky }"
              @click.prevent="PostsParentCtrl.updateThreadSticky()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                  <g id="icons"><path d="M44.27,11.92,35.08,2.73a2.5,2.5,0,1,0-3.53,3.53l9.19,9.19a2.5,2.5,0,0,0,3.53-3.53Z"/><path d="M16.34,16.51a3,3,0,1,0-4.24,4.25l5.66,5.65L6.44,37.73l-2.12,5,4.95-2.12L20.59,29.24l5.65,5.66a3,3,0,1,0,4.25-4.24Z"/><rect x="21.78" y="11.22" width="16" height="12" transform="translate(-3.46 26.1) rotate(-45)"/>
                </g>
              </svg>
            </a>
          </div>

          <!-- Purge Delete -->
          <!-- TODO(boka): add data-balloon plugin -->
          <div class="control" data-balloon="Purge Thread" v-if="PostsParentCtrl.canPurge()">
            <a href="#" id="purgeThread" :class="{'clicked' : PostsParentCtrl.showPurgeThreadModal }"
              @click.prevent="PostsParentCtrl.showPurgeThreadModal = true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                <path
                  d="M24,2A22,22,0,1,0,46,24,22,22,0,0,0,24,2ZM35.67,32.13l-3.54,3.54L24,27.54l-8.13,8.13-3.54-3.54L20.46,24l-8.13-8.13,3.54-3.54L24,20.46l8.13-8.13,3.54,3.54L27.54,24Z" />
              </svg>
            </a>
          </div>

          <!-- Move Thread -->
          <!-- TODO(boka): add data-balloon plugin -->
          <div class="control" data-balloon="Move Thread" v-if="PostsParentCtrl.canMove()">
            <a href="#" id="moveBoard" :class="{'clicked' : PostsParentCtrl.showMoveThreadModal }"
              @click.prevent="PostsParentCtrl.openMoveThreadModal()">
              <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <title></title>
                <path d="m29.36 7.74a3 3 0 0 0 -4.25 4.26l9 9h-28.73a3 3 0 0 0 0 6h28.76l-9 9a3 3 0 0 0 4.25 4.24l16.23-16.24z" />
              </svg>
            </a>
          </div>

        </div>
      </div>

      <!-- Poll Viewer -->
      <!-- <poll-viewer thread="PostsParentCtrl.thread" user-priority="PostsParentCtrl.posts[0].user.priority" reset="PostsParentCtrl.resetPoll"></poll-viewer> -->

      <!-- <div class="controls">
        <pagination page-count="PostsParentCtrl.pageCount" page="PostsParentCtrl.page"></pagination>
      </div> -->
    </div>
  </div>

  <!-- Bottom Actions and Pagination -->
  <div class="actions-bottom">
    <div class="actions-bottom-grid">
      <div id="pagination-bottom" class="pagination-bottom">
        <!-- <pagination page-count="PostsParentCtrl.pageCount" page="PostsParentCtrl.page"></pagination> -->
      </div>
      <div v-if="canPost()" class="sidebar-actions">
        <a class="button small" @click.prevent="loadEditor()" v-if="canPost()">Post Reply</a>
      </div>
    </div>
  </div>

  <!-- Editor -->
  <!-- <div v-if="PostsParentCtrl.canPost() && PostsParentCtrl.showEditor"> -->
  <!--   <epochtalk-editor class="posts-editor" -->
  <!--     body-html="PostsParentCtrl.posting.post.body_html" -->
  <!--     body="PostsParentCtrl.posting.post.body" -->
  <!--     posting="PostsParentCtrl.posting" -->
  <!--     reset-switch="PostsParentCtrl.resetEditor" -->
  <!--     focus-switch="PostsParentCtrl.focusEditor" -->
  <!--     dirty="PostsParentCtrl.dirtyEditor" -->
  <!--     quote="PostsParentCtrl.quote" -->
  <!--     thread="PostsParentCtrl.thread" -->
  <!--     post-editor-mode="true" -->
  <!--     create-action="PostsParentCtrl.savePost" -->
  <!--     can-create="PostsParentCtrl.canSave" -->
  <!--     show-switch="PostsParentCtrl.showEditor"> -->
  <!--   </epochtalk-editor> -->
  <!-- </div> -->
</template>

<script>
//import useSWRV from 'swrv'
//import { useRoute, useRouter } from 'vue-router'
//import Pagination from '@/components/layout/Pagination.vue'
import humanDate from '@/composables/filters/humanDate'
//import decode from '@/composables/filters/decode'
import truncate from '@/composables/filters/truncate'
//import { inject, reactive, watch, toRefs } from 'vue'
import { inject, reactive, toRefs } from 'vue'
//import { threadsApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'
//import { PreferencesStore } from '@/composables/stores/prefs'
//import { countTotals, getLastPost, filterIgnoredBoards } from '@/composables/utils/boardUtils'

export default {
  name: 'Posts',
  props: ['threadSlug', 'threadId'],
  // components: { Pagination },
  setup(props) {
    console.log(props)
    /* Internal Methods */
    /* View Methods */
    const canEditTitle = () => true
    const canPost = () => {
      // TODO(akinsey): Implement ban status check
      if (v.bannedFromBoard || !v.postData.data?.write_access || !v.permissionUtils.hasPermission('posts.create.allow')) { return false }
      if (v.postData.data.thread.locked) {
        return v.permissionUtils.hasPermission('posts.create.bypass.locked.admin') || (v.permissionUtils.hasPermission('posts.create.bypass.locked.mod') && v.permissionUtils.moderatesBoard(v.postData.data.board.id))
      }
      return true
    }
    const canSave = () => true
    const canMove = () => true
    const canPurge = () => true
    const canSticky = () => true
    const canLock = () => true
    const canCreatePoll = () => true
    const canUpdate = (post) => {
      console.log(post, 'canUpdate')
      return true
    }
    const canPostLock = (post) => {
      console.log(post, 'canPostLock')
      return true
    }
    const canDelete = (post) => {
      console.log(post, 'canDelete')
      return true
    }
    const openEditThread = () => console.log('openEditThread')
    const updateThreadLock = () => console.log('updateThreadLock')
    const updateThreadSticky = () => console.log('updateThreadSticky')
    const updateThreadTitle = () => console.log('updateThreadTitle')
    const closeEditThread = () => console.log('closeEditThread')
    const createPoll = () => console.log('createPoll')
    const userRoleHighlight = () => { return {} }
    const showEditDate = (post) => {
      console.log(post)
      return true
    }
    const openPurgeModal = (i) => console.log(i, 'openPurgeModal')
    const openDeleteModal = (i, postLocked) => console.log(i, postLocked, 'openDeleteModal')
    const openUndeleteModal = (i) => console.log(i, 'openUndeleteModal')
    const openReportModal = (post) => console.log(post, 'openReportModal')
    const lockPost = (post) => console.log(post, 'lockPost')
    const unlockPost = (post) => console.log(post, 'unlockPost')
    const loadEditor = (post) => console.log(post, 'loadEditor')
    const addQuote = (post) => console.log(post, 'addQuote')
    const copyQuote = (post) => console.log(post, 'copyQuote')
    const highlightPost = () => console.log('highlightPost')
    const showUserControls = () => console.log('showUserControls')
    /* Internal Data */
    const $auth = inject(AuthStore)
    /* View Data */
    const v = reactive({
      loggedIn: $auth.loggedIn,
      threadData: {},
      editThread: false,
      addPoll: false,
      pollValid: false,
      posting: {
        post: {}
      },
      permissionUtils: $auth.permissionUtils,
      bannedFromBoard: false,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      disableSignature: false
    })
    return {
      ...toRefs(v),
      canEditTitle,
      canPost,
      canSave,
      canMove,
      canPurge,
      canSticky,
      canLock,
      canCreatePoll,
      canUpdate,
      canPostLock,
      canDelete,
      openEditThread,
      updateThreadLock,
      updateThreadSticky,
      updateThreadTitle,
      closeEditThread,
      createPoll,
      truncate,
      humanDate,
      userRoleHighlight,
      showEditDate,
      openPurgeModal,
      openDeleteModal,
      openUndeleteModal,
      openReportModal,
      lockPost,
      unlockPost,
      loadEditor,
      addQuote,
      copyQuote,
      highlightPost,
      showUserControls
    }
  }
}
</script>

<style lang="scss">
</style>
