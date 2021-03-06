<template>
  <v-flex
    id="inner-chat"
    fill-height
  >
    <div
      id="chat-scroll"
      ref="scroller"
    >
      <transition-group
        name="fade-transition"
        :duration="150"
        tag="div"
      >
        <div
          v-if="messages"
          v-for="( msg, index ) in messages"
          :key="msg._id"
          class="pb-1 pl-3 pr-1"
        >
          <chat-message
            v-if="msg.username !== ( index && messages[ index - 1 ].username )"
            :username="msg.username"
            :display-name="msg.username"
            :user-styling="{ color: msg.userColor ? msg.userColor : '#9e9e9e' }"
            :channel="msg.channel"
            :timestamp="getTime( msg.timestamp )"
            :avatar="msg.avatar"
            :color="msg.color"
            :global="getGlobalTag( msg.global )"
            @reply="addUserTag"
            @whisper="addWhisper"
          >
            <div
              class="body-2 msg"
              v-html="msg.message"
            ></div>
          </chat-message>

          <!-- Append messages -->
          <div
            v-else
            class="msg append"
          >
            <div
              class="body-2 msg"
              v-html="msg.message"
            ></div>
          </div>
        </div>

        <v-sheet
          v-if="!messages"
          v-for="i in 5"
          :key="i"
          color="grey darken-4"
          class="mx-3 mt-3 mb-3 pa-2"
        >
          <v-skeleton-loader
            ref="skeleton"
            :boilerplate="false"
            :type="`avatar, ${ i % 2 ? 'paragraph' : 'sentences' }`"
            class="d-flex"
            dark
          ></v-skeleton-loader>
        </v-sheet>

      </transition-group>
    </div>

    <!-- FAB for Scroll Down -->
    <div class="stb-fab d-flex justify-center">
      <v-slide-y-transition>
        <v-btn
          v-show="showFAB"
          fab
          x-small
          color="primary"
          @click="scrollToBottom( true )"
          class="black--text mt-3"
        >
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-slide-y-transition>
    </div>

  </v-flex>
</template>

<script>
  import moment from 'moment'

  import ChatMessage from '@/components/Chat/ChatMessage'

  export default {
    name: 'ChatMessages',

    components: {
      ChatMessage,
    },

    props: {
      messages: { type: Array },
      showTimestamps: { type: Boolean },
      global: { type: Boolean },
    },

    data () {
      return {
        chatContainer: null,
        scrollTimeout: null,
        onScrollTimer: null,
        showFAB: false,
        scrolling: false,
        atBottom: true,

        scrollInterval: null,
      }
    },

    methods: {
      addUserTag ( user ) {
        this.$emit( 'reply', user );
      },

      addWhisper ( user ) {
        this.$emit( 'whisper', user );
      },

      checkIfBottom () {
        if ( !this.messages || this.messages.length === 0 || this.atBottom ) {
          return true;
        } else {
          const scrollTop    = this.chatContainer.scrollTop;
          const clientHeight = this.chatContainer.clientHeight; // or offsetHeight
          const scrollHeight = this.chatContainer.scrollHeight;
          const lastMessageHeight = this.chatContainer.lastElementChild.clientHeight;
          // const lastMessageHeight = document.querySelector("#chat-scroll > div:last-child").clientHeight;
          return scrollTop + clientHeight >= scrollHeight - lastMessageHeight;
        }
      },

      async scrollToBottom ( force ) {
        // If we are NOT at the bottom && NOT forcing scroll, bail early
        if ( !this.checkIfBottom() && !force ) return;

        // if ( this.scrolling ) return;

        this.showFAB = false;
        this.scrolling = true;

        const scrollHeight = this.chatContainer.scrollHeight + 750;

        // Scroll to last message
        // After it's added to DOM
        // requestAnimationFrame( () => {
        // this.$nextTick( () => {

        this.chatContainer.scroll({
          top: scrollHeight,
          behavior: 'smooth',
        });

        // this.scrolling = false;
        // this.atBottom = true;

        clearTimeout( this.scrollTimeout );

        this.scrollTimeout = setTimeout( () => {
            this.jumpToBottom( scrollHeight );
            this.scrolling = false;
            this.atBottom = true;
        }, 500 );
      },

      jumpToBottom ( scrollGoal ) {
        this.chatContainer.scrollTop = scrollGoal ? scrollGoal : this.chatContainer.scrollHeight + 750;
        this.atBottom = true;
      },

      getTime ( timestamp ) {
        return this.showTimestamps ? `[${moment( timestamp ).format( 'HH:mm' )}]` : '';
      },

      getGlobalTag ( global ) {
        return this.global ? `[${global ? 'G' : global === false ? 'L' : 'U'}]` : '';
      },

      onScrollUp ( scrollPosition ) {
        if ( !this.scrolling ) {
          this.showFAB  = true;
          this.atBottom = false;
        }
      },

      onScrollDown ( scrollPosition ) {
        if ( scrollPosition + this.chatContainer.clientHeight > this.chatContainer.scrollHeight - 250 ) {
          this.showFAB = false;
        }
      },

      onScroll ( event ) {
        if ( this.scrolling ) return;

        if ( !this.onScrollTimer ) {
          const scrollStart  = this.chatContainer.scrollTop;
          const scrollHStart = this.chatContainer.scrollHeight;
          this.onScrollTimer = setTimeout( () => {
            let scrollPosition  = this.chatContainer.scrollTop;
            const scrollHPosition = this.chatContainer.scrollHeight;

            const scrollHDiff = scrollHPosition - scrollHStart;

            // console.log( `${scrollHStart}|${scrollHPosition} Diff: ${scrollHDiff}` );

            // Account for changes in scroll height
            scrollPosition -= scrollHDiff;

            // Scrolled up
            if ( scrollStart > scrollPosition ) {
              // console.log( `UP: ${scrollStart} - ${scrollPosition} Diff: ${scrollPosition - scrollStart}` );
              this.onScrollUp();
            }

            // Scrolled down
            else if ( scrollStart <= scrollPosition ) {
              // console.log( `DOWN: ${scrollStart} - ${scrollPosition} Diff: ${scrollPosition - scrollStart}` );
              this.onScrollDown( scrollPosition );
            }

            this.onScrollTimer = null;
          }, 100 );
        }
      },

      onScrollInterval () {
        if ( !this.showFAB /*&& this.atBottom*/ ) {
          const scrollHeight = this.chatContainer.scrollHeight + 750;
          this.chatContainer.scroll({
            top: scrollHeight,
            behavior: 'smooth',
          });
        }
      },
    },

    async mounted () {
      this.chatContainer = this.$refs.scroller;
      // this.$nextTick( () => this.jumpToBottom() );
      this.chatContainer.addEventListener( 'scroll', this.onScroll, { passive: true } );
    },

    beforeDestroy () {
      this.chatContainer.removeEventListener( 'scroll', this.onScroll );
      // clearInterval( this.scrollInterval );
    }
  }
</script>

<style lang="scss">
  #inner-chat {
    position: relative;
    overflow: hidden;

    .msg {
      line-height: 1.25;

      /* Hover Chat Message */
      /*&:hover {
        background: #212121;
        !*color: #9e9e9e;*!
      }*/

      &.append .msg {
        padding-left: 40px;
      }
    }

    .stb-fab {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
    }
  }

  #chat-scroll {
    overflow-y: scroll;
    will-change: transform;
  }
</style>
