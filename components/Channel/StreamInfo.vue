<template>
  <div>
    <!-- Stream Title, Status -->
    <v-toolbar
      class="elevation-2"
      color="grey darken-4"
      dense
    >
      <!-- Live Indicator -->
      <v-chip
        class="flex-shrink-0"
        :class="{ blink: live }"
        :color="live ? 'red' : 'grey'"
        label
        outlined
        small
      >
        <v-icon
          v-show="live"
          left
          size="10"
          class="mr-2"
        >lens</v-icon>
        {{ live ? 'LIVE' : 'offline' }}
      </v-chip>

      <!-- Stream Title -->
      <h3 class="mx-2 flex-grow-1 subtitle-1 font-weight-medium text-truncate">
        {{ title }}
      </h3>

      <!-- Bottom Tabs -->
      <template #extension>
        <v-tabs
          v-model="tabData"
          background-color="transparent"
          class="no-focus"
          fixed-tabs

        >
          <v-tab>Description</v-tab>
          <v-tab>Archives</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>


    <!-- Stream Data -->
    <v-tabs-items
      v-model="tabData"
      style="background: transparent"
    >
      <!-- Description -->
      <v-tab-item>
        <div
          id="description"
          ref="description"
          class="pa-3"
          style="min-height: 500px"
        >
          <!-- Stream Actions -->
          <div class="d-flex flex-shrink-0 mb-3 justify-end">
            <EditStreamData
              v-if="showEditStream"
              :username="username"
              :title="title"
              :description="description"
              :nsfw="nsfw"
            />
            <v-btn
              v-if="false"
              color="yellow"
              class="mr-2"
              outlined
              small
              @click="showStreamStats = !showStreamStats"
            >
              <v-icon>timeline</v-icon>
            </v-btn>
            <ShareStream :user="name" />
          </div>

          <!-- Stream Description -->
          <vue-markdown
            v-if="description"
            :source="description"
          />
        </div>
      </v-tab-item>

      <!-- Archives -->
      <v-tab-item>
        <div
          class="pa-3"
          style="min-height: 500px"
        >
          <stream-archives :streamer="name" />
        </div>
      </v-tab-item>
    </v-tabs-items>


    <!-- Footer -->
    <v-sheet
      class="pa-2"
      color="grey darken-4"
      tile
    >
      <div class="overline">Powered by Bitwave Media</div>
    </v-sheet>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import VueMarkdown from '@/components/VueMarkdown';

  // Async Components - We don't expect these components to be required frequently
  const ShareStream    = () => import ( '@/components/ShareStream' );
  const EditStreamData = () => import ( '@/components/EditStreamData' );
  const StreamArchives = () => import ( '@/components/Channel/StreamArchives' );

  export default {
    name: 'StreamInfo',

    components: {
      StreamArchives,
      VueMarkdown,
      ShareStream,
      EditStreamData,
    },

    props: {
      name:  { type: String },
      live:  { type: Boolean },
      title: { type: String },
      nsfw:  { type: Boolean },
      description: { type: String },
    },

    data () {
      return {
        tabData: null,
      };
    },

    methods: {

    },

    computed: {
      ...mapGetters({
        username: VStore.$getters.getUsername,
      }),

      showEditStream () {
        if ( !this.username ) return false;
        return this.name.toLowerCase() === this.username.toLowerCase();
      },
    },
  };
</script>

<style lang="scss">
  .v-tabs.no-focus .v-tab--active:hover::before,
  .v-tabs.no-focus .v-tab--active::before {
    opacity: 0;
  }
</style>