<template>
  <!-- Recent Threads -->
  <div class="dashboard-hero">
    <div class="recent-threads">
      <h1 class="title">Recent Threads</h1>

      <div class="centered-text" v-if="!threads">
        <h5>No recently updated threads available</h5>
      </div>

      <div class="threads-container" v-if="threads">
        <!-- Thread listing -->
        <div class="threads-data threads-recent" v-for="thread in threads" :key="thread.id">
          <div class="states">
            <div class="thread-state" v-if="thread.sticky || thread.latest" >
              <svg v-if="thread.latest" class="is-unread" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" data-balloon="Unread">
                <title></title>
                <g id="icons">
                  <circle cx="16" cy="16" r="16" />
                </g>
              </svg>
              <svg class="is-sticky" viewBox="0 0 40.68 40.68" xmlns="http://www.w3.org/2000/svg" data-balloon="Sticky">
                <path d="m40 9.92-9.24-9.19a2.5 2.5 0 0 0 -3.54 3.54l9.2 9.19a2.5 2.5 0 0 0 3.58-3.54z" />
                <path
                  d="m12 14.52a3 3 0 0 0 -4.24 4.24l5.66 5.66-11.3 11.31-2.12 4.95 5-2.12 11.26-11.31 5.66 5.66a3 3 0 0 0 4.24-4.25z" />
                <path d="m17.46 9.23h16v12h-16z" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -3.31 22.46)" />
              </svg>
            </div>
            <div class="thread-status" v-if="thread.locked || thread.poll">
              <svg v-if="thread.locked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" data-balloon="Locked">
                <title></title>
                <path d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z"/>
              </svg>
              <svg v-if="thread.poll" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" data-balloon="Includes a Poll">
                <path class="cls-1" d="M42,2H6A4,4,0,0,0,2,6V42a4,4,0,0,0,4,4H42a4,4,0,0,0,4-4V6A4,4,0,0,0,42,2ZM13.75,40h-6V32h6Zm9,0h-6V22h6Zm9,0h-6V27h6Zm9,0h-6V12h6Z"/>
              </svg>
            </div>
          </div>
          <div class="title">
            <a :class="{bold: thread.latest}" class="thread-title" href="#" onclick="event.stopPropagation()">{{thread.title}}</a>
          </div>
          <div class="user">
            in <a href="#" class="thread-board" onclick="event.stopPropagation()">{{thread.board.name}}</a>
            by
            <span v-if="thread.deleted">deleted</span>
            <a v-if="!thread.deleted" href="#" onclick="event.stopPropagation()">{{thread.user.username}}</a>
          </div>
          <div class="last-reply">
            <div>{{thread.post.created_at}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['threads']
}
</script>

<style lang="scss">
.dashboard-hero {
  background-color: $sub-header-color;
  grid-area: main;
  margin: calc(-1rem - 1px) 0 2rem;
  padding: 2rem 0;
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  .recent-threads {
    max-width: $view-maxWidth;
    margin: 0 auto;
  }

  .title {
    color: $secondary-font-color;
    font-size: $font-size-sm;
  }

  .threads-container {
    display: grid;
    // grid-template-columns: repeat(3, 1fr);
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    grid-gap: 2rem;
    padding-bottom: 2rem;
  }

  .threads-data {
    background-color: $base-background-color;
    // border: 1px solid rgba($border-color, .5);
    border-radius: 6px;
    box-shadow: 0 4px 16px 8px $card-shadow-color;
    cursor: pointer;
    padding: 0.75rem 1rem 1rem;
    // padding-bottom: 1.5rem;
    transition: box-shadow ease-in-out 150ms, transform ease-in-out 150ms;

    &:hover {
      box-shadow: 0 8px 16px 8px rgba($card-shadow-color, 0.15);
      transform: translateY(-2px);
    }

    .title {
      font-size: $font-size-med;
      font-weight: 600;
      margin-bottom: 0.5rem;

      .thread-title {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .user {
      margin-bottom: 0.25rem;
    }

    .states {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      min-height: 1.25rem;

      .thread-state {
        position: initial;
        height: initial;
        width: auto;

        .is-sticky {
          width: 0.875rem;
        }
      }

      .thread-status {
        display: flex;
        align-items: center;
      }

      .is-unread {
        width: 8px;
      }

      svg {
        margin-right: 0.5rem;
      }
    }
  }

  @include break-mobile-sm {
    padding: 0 1rem;
  }
}
</style>
