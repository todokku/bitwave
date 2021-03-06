<template>
  <v-navigation-drawer
    :value="value"
    :mini-variant="miniVariant"
    :clipped="false"
    color="grey darken-4"
    app
    @input="$emit( 'input', $event )"
  >
    <v-layout
      fill-height
      column
    >
      <v-flex shrink>
        <v-list
          class="py-0"
          dense
        >
          <v-list-item
            class="py-1"
            v-for="( item, i ) in items"
            :key="i"
            :to="item.to"
            router
            exact
            @click="onClick"
          >
            <v-list-item-action class="my-1">
              <v-avatar
                color="#eee"
                size="40"
                class="blue--text"
              >
                <v-icon light :size="item.size" >{{ item.icon }}</v-icon>
              </v-avatar>
            </v-list-item-action>
            <v-list-item-content class="py-0">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>[bitwave.tv]</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>

      <div class="mt-1">
        <v-btn
          class="text-center py-2"
          style="height: auto;"
          to="/streamkey"
          text
          tile
          block
          @click="onClick"
        >
          STREAM<br>
          HERE
        </v-btn>
      </div>

      <!-- User Channels -->
      <v-flex
        class="hide-scrollbar"
        style="overflow-y: auto; will-change: transform; overscroll-behavior-y: contain;"
      >
        <v-list
          class="pt-0"
          dense
        >

          <div
            class="overline text-center grey--text mt-1 mb-1"
          >
            LIVE NOW
          </div>

          <!-- List of streams live now -->
          <transition-group
            name="fade-transition"
            tag="div"
          >
            <v-list-item
              v-for="( user ) in sidebarData"
              :key="user.owner"
              :to="user.to"
              class="py-1"
              router
              exact
              @click="onClick"
            >
              <v-list-item-avatar
                :color="user.live ? user.nsfw ? '#ff9800' : '#0f0' : '#000'"
                class="my-1"
              >
                <v-badge
                  v-model="user.live && user.nsfw"
                  :color="!!user.nsfw ? 'orange' : 'green'"
                  overlap
                >
                  <template v-slot:badge>
                    <v-icon small>flag</v-icon>
                  </template>
                  <v-avatar
                    :size="user.live ? 36 : 40"
                  >
                    <img
                      :class="{ offline : !user.live }"
                      :src="`${user.avatar}`"
                      :alt="user.name"
                    />
                  </v-avatar>
                </v-badge>
              </v-list-item-avatar>
              <v-list-item-content class="py-0">
                <v-list-item-title v-if="!miniVariant">{{ user.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="!miniVariant">{{ user.name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </transition-group>

          <v-slide-x-transition>
            <div
              v-if="uid && following.length > 0"
              class="overline text-center grey--text mt-3 mb-1"
            >
              FOLLOWING
            </div>
          </v-slide-x-transition>

          <!-- List of streams following  -->
          <template
            v-if="uid"
            v-for="( user ) in following"
          >
            <v-lazy
              min-height="56"
              :key="`${user.owner}-offline`"
              transition="slide-x-transition"
            >
              <v-list-item
                class="py-1"
                :to="user.to"
                router
                exact
                @click="onClick"
              >
                <v-list-item-avatar
                  color="#000000"
                  class="my-1"
                >
                  <v-avatar
                    :size="40"
                  >
                    <img
                      :class="{ offline : !user.live }"
                      :src="`${user.avatar}`"
                      :alt="user.name"
                    >
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-content class="py-0">
                  <v-list-item-title v-if="!miniVariant">{{ user.title }}</v-list-item-title>
                  <v-list-item-subtitle v-if="!miniVariant">{{ user.name }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-lazy>
          </template>

          <!-- Search All Streamers -->
          <v-list-item
            class="py-0"
            to="/streamers"
            router
            exact
            @click="onClick"
          >
            <v-list-item-avatar>
              <v-avatar
                color="#eee"
                size="40"
                class="blue--text"
              >
                <v-icon light>search</v-icon>
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>View All</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>
    </v-layout>

    <!-- Minify Panel -->
    <template #append>
      <div class="pa-2">
        <v-btn
          color="yellow"
          block
          outlined
          small
          @click.stop="miniVariant = !miniVariant"
        >
          <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import { VStore } from '@/store';
  import { auth, db } from '@/plugins/firebase';

  export default {
    name: 'UserList',

    props: {
      value: { type: Boolean },
    },

    data() {
      return {
        miniVariant: true,

        items: [
          {
            icon   : 'whatshot',
            size   : 32,
            title  : 'Home',
            to     : '/',
          },
        ],

        userUpdateRate: 20,
        userListTimer: null,

        following: [],
        followingLimit: 5,
      }
    },

    methods: {
      ...mapActions({
        fetchData : VStore.$actions.fetchSidebarData,
      }),

      onClick () {
        window.navigator.vibrate( 10 );
      },

      async authenticated ( user ) {
        // if ( user ) this.$nextTick( async () => await this.getFollowing( user.uid ) );
        if ( user ) setTimeout( async () => await this.getFollowing( user.uid ), 5000 );
      },

      async getFollowing ( userId ) {
        if ( userId ) {
          try {
            const { data } = await this.$axios.get( 'https://api.bitwave.tv/api/channels/list', { progress: false } );
            const query = await db
              .collection('followers')
              .where('viewerId', '==', userId)
              .limit( this.followingLimit )
              .get();
            const streamers = query.docs.map( doc => doc.data().streamerId );
            this.following = data.users.filter( streamer => streamers.includes( streamer.owner ) && !streamer.live );
          } catch ( error ) {
            console.error( error.message );
          }
        }
      },
    },

    computed: {
      ...mapGetters({
        sidebarData: VStore.$getters.getSidebarData,
        uid : VStore.$getters.getUID,
      }),
    },

    async mounted () {
      this.userListTimer = setInterval( async () => await this.fetchData(), this.userUpdateRate * 1000 );
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    beforeDestroy () {
      if ( this.userListTimer ) clearInterval( this.userListTimer );
    },
  }
</script>

<style lang='scss'>
  .hide-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  .offline {
    -webkit-filter: grayscale(60%);
    filter: grayscale(60%);
  }
</style>
