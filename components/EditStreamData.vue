<template>
  <v-dialog
    v-model="editStreamData"
    transition="fade-transition"
    :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '60%'"
    @click:outside="cancel"
    persistent
  >
    <template #activator="{ on }">
      <v-btn
        v-on="on"
        class="mr-3"
        outlined
        small
        color="primary"
      >
        edit
        <v-icon small class="ml-1">edit</v-icon>
      </v-btn>
    </template>

    <v-card
      color="grey darken-4"
      :loading="saveLoading || showExitConfirm"
    >
      <v-sheet
        tile
        color="primary"
        class="pa-2 d-flex justify-space-between align-center"
      >
        <h4 class="black--text body-1">
          <v-icon color="black">create</v-icon>
          Edit Stream Data
        </h4>
        <v-btn
          color="black"
          text
          icon
          small
          @click="cancel"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-sheet>

      <div class="py-3">

        <div class="d-flex justify-space-between align-center mb-3  px-3">
          <v-switch
            v-if="!previewData"
            v-model="streamData.nsfw"
            class="my-0"
            label="Not Safe For Work (NSFW)"
            color="primary"
            hide-details
            inset
            :loading="saveLoading"
            :disabled="saveLoading"
            @change="enableSave = true"
          />
          <div v-else>
            {{ this.streamData.title }}
          </div>
          <v-btn
            color="primary"
            outlined
            small
            @click="previewData = !previewData"
          >
            {{ previewData ? 'Edit' : 'preview' }}
          </v-btn>
        </div>

        <div
          v-if="!previewData"
          class="px-3"
        >

          <v-switch
            v-if="!previewData"
            v-model="streamData.archive"
            class="mb-4"
            label="Archives"
            color="primary"
            hide-details
            inset
            :loading="saveLoading"
            :disabled="saveLoading"
            @change="enableSave = true"
          />

          <div class="body-1 mb-1">
            Stream Title
          </div>
          <v-text-field
            v-model="streamData.title"
            color="primary"
            outlined
            clearable
            dense
            counter="240"
            :loading="saveLoading"
            :disabled="saveLoading"
            @change="enableSave = true"
          />

          <div class="body-1 mb-1">
            Stream Description
          </div>
          <v-textarea
            v-model="streamData.description"
            hint="markdown supported"
            color="primary"
            outlined
            rows="15"
            counter
            dense
            :loading="saveLoading"
            :disabled="saveLoading"
            @change="enableSave = true"
          />

        </div>

        <v-sheet
          v-else
          color="grey darken-3"
          class="markdown-content"
        >
          <vue-markdown
            style="overflow-y: auto; max-height: 60vh;"
            class="pa-3"
            :source="streamData.description"
          />
        </v-sheet>

        <div class="d-flex justify-end mt-3 px-3">
          <v-btn
            class="mr-2"
            color="cyan"
            outlined
            small
            :disabled="!enableSave"
            @click="resetValues"
          >
            reset
          </v-btn>
          <v-spacer/>
          <v-btn
            class="mr-2"
            color="red"
            small
            :disabled="saveLoading"
            @click="cancel"
          >
            cancel
          </v-btn>
          <v-btn
            color="success"
            small
            :loading="saveLoading"
            @click="updateStreamData"
          >
            save
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Exit Confirmation Dialog -->
    <v-dialog
      v-model="showExitConfirm"
      width="320"
    >
      <v-card>

        <v-sheet
          color="primary"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="black--text body-1">
            You have unsaved changes!
          </h4>
          <v-icon light>warning</v-icon>
        </v-sheet>

        <v-card-title class="subtitle-1">
          Are you sure you want to exit?
        </v-card-title>


        <v-card-actions class="justify-end">

          <v-btn
            color="red"
            @click="forceQuit"
            outlined
            small
          >
            exit
          </v-btn>
            <v-btn
              class="mr-2"
              color="primary"
              outlined
              small
              @click="showExitConfirm = false"
            >
              no
            </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

  </v-dialog>
</template>

<script>
  import VueMarkdown from '~/components/VueMarkdown';
  import { db } from '@/plugins/firebase.js';

  export default {
    name: 'EditStreamData',

    components: {
      VueMarkdown,
    },

    props: {
      username: { type: String, },
      title: { type: String, },
      description: { type: String, },
      nsfw: { type: Boolean, },
    },

    data() {
      return {
        archive: false,
        editStreamData: false,
        previewData: false,
        streamData : {
          title: this.title,
          description: this.description,
          nsfw: this.nsfw,
          archive: false,
        },
        saveLoading: false,
        enableSave: false,
        showExitConfirm: false,
      };
    },

    methods: {
      async getStreamData () {
        const stream = this.username.toLowerCase();
        try {
          const doc = await db
            .collection( 'streams' )
            .doc( stream )
            .get();
          const data = doc.data();
          this.archive = data.archive;
          this.streamData.archive = data.archive;
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 5000 } );
          this.editStreamData = false;
        }
      },

      resetValues () {
        this.streamData = {
          archive: this.archive,
          title: this.title,
          description: this.description,
          nsfw: this.nsfw,
        };
        this.saveLoading = false;
        this.enableSave = false;
      },

      cancel () {
        if ( this.enableSave ) {
          this.showExitConfirm = true;
          return;
        }
        // Reset Form
        this.resetValues();
        // Close dialog
        this.previewData = false;
        this.editStreamData = false;
      },

      forceQuit() {
        // Reset exit confirmation
        this.showExitConfirm = false;
        // Reset Form
        this.resetValues();
        // Close dialog
        this.previewData = false;
        this.editStreamData = false;
      },

      async updateStreamData () {
        // Bail early if no data changed
        if ( !this.enableSave ) {
          this.previewData = false;
          this.editStreamData = false;
        }

        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'update stream',
          eventLabel    : this.username.toLowerCase(),
        });

        this.saveLoading  = true;
        const stream      = this.username.toLowerCase();
        const streamRef   = db.collection( 'streams' ).doc( stream );

        await streamRef.update({
          archive: !!this.streamData.archive,
          nsfw: this.streamData.nsfw,
          title: this.streamData.title,
          description: this.streamData.description,
        });

        this.saveLoading = false;
        this.enableSave    = false;

        setTimeout( () => {
          this.previewData = false;
          this.editStreamData = false;
        }, 100 );
      },
    },

    computed: {},

    async mounted () {
      await this.getStreamData();
    },
  };
</script>

<style lang="scss">
  .markdown-content {
    text-overflow: ellipsis;
    word-break: break-word;
    max-width: 100%;

    img {
      max-width: 100%;
    }
  }
</style>
