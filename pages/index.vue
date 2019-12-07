<template>
  <div>
    <v-container>

      <v-row class="justify-center align-center">
        <v-col>
          <v-card
            color="blue darken-4"
            tile
          >
            <v-card-text>
          <div class="display-2 font-weight-thin">hello,
            <span class="headline">welcome to <span class="white--text display-1">[bitwave.tv]</span></span>
          </div>
          <h2 class="title mt-2 font-weight-regular">An open platform live streaming service that allows creators to freely express themselves.</h2>
        </v-card-text>
          <v-card-actions>
            <v-btn
              small
              color="secondary blue-grey"
              nuxt
              to="/login"
              tile
            >Create Account</v-btn>
            <v-btn
              small
              color="blue-grey lighten-3"
              nuxt
              outlined
              to="/streamkey"
              tile
            >Get a StreamKey</v-btn>
          </v-card-actions>
          </v-card>
          <v-card
            class="mt-4"
            color="yellow"
            tile
            light
          >
            <v-card-text>
              <div class="headline">Need Help?</div>
              <div class="title">Get in touch via one of the methods below.</div>
              <div class="body-1">Otherwise try just asking in chat!</div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                small
                tile
                color="secondary blue-grey"
                href="https://discord.gg/4WwJsKx"
                target="_blank"
              >Discord</v-btn>
              <v-btn
                small
                color="blue lighten-1"
                href="https://twitter.com/bitwave-tv"
                target="_blank"
                dark
                tile
              >Twitter</v-btn>
              <v-btn
                small
                color="cyan lighten-1"
                dark
                tile
                href="mailto:admin@bitwave.tv"
                target="_blank"
              >Email</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="12"
          xl="8"
        >
          <!-- Banner Stream -->
          <banner-video
            :src="live[0].src"
            :type="live[0].type"
            :poster="poster"
            :name="live[0].name"
            :mobile="mobile"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-container>
      <v-row>
        <v-col>
          <!-- Live Grid -->
          <stream-grid :streamers="streamers" />
        </v-col>

        <v-col cols="12">
          <!-- Homepage Content -->
          <homepage/>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import StreamGrid from '@/components/StreamGrid'
  import BannerVideo from '@/components/BannerVideo';
  import Homepage from '@/components/content/homepage';

  export default {
    head () {
      return {
        title: `Homepage - [bitwave.tv]`,
        meta: [
          { name: 'og:title',       hid: 'og:title',       content: `Livestream Homepage - [bitwave.tv]` },
          { name: 'og:description', hid: 'og:description', content: `An open platform live streaming service for creators to freely express themselves.` },
          { name: 'og:image',       hid:'og:image',        content: this.poster},
          { name: 'description',    hid: 'description',    content: 'An open platform live streaming service for creators to freely express themselves.' },
          { name: 'twitter:card',        content: 'summary_large_image' },
          { name: 'twitter:site',        content: '@BitwaveTV' },
          { name: 'twitter:title',       content: 'Livestream Homepage - [bitwave.tv]' },
          { name: 'twitter:description', content: 'An open platform live streaming service for creators to freely express themselves.' },
          { name: 'twitter:image',       content: this.poster },
        ],
      }
    },

    components: {
      Homepage,
      BannerVideo,
      StreamGrid,
    },

    data () {
      return {
        mounted: false,
        player: null,
        poster: 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg',
      }
    },

    methods: {

    },

    async asyncData ({ $axios }) {
      const   live   = ( await $axios.get( `https://api.bitwave.tv/api/sources/list`) ).data.live;
      const { data } =   await $axios.get( 'https://api.bitwave.tv/api/channels/list' );
      return {
        streamers: data.users.filter( s => s.live ),
        live: live,
      }
    },

    computed: {
      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },
    },

    mounted () {
      this.mounted = true;
    },
  }
</script>

