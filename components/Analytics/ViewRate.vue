<template>
  <div id="view-rate">
    <div class="graph">
      <div class="chart-val grey--text text-weight-thin overline text-center my-2">
        Viewers per 10 second interval
      </div>
      <v-sparkline
        :value="stats.value"
        :gradient="gradient"
        :smooth="radius || false"
        :padding="padding"
        :line-width="width"
        :type="type"
        stroke-linecap="round"
        gradient-direction="top"
      />
      <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center ma-2">
        <template v-for="( stat, index ) in dataLabels">
          <div>
            <span class="grey--text mr-1">{{ stat.label }}</span>
            <span class="body-2">{{ stat.value }}</span>
          </div>
          <v-divider
            v-if="index !== dataLabels.length - 1"
            color="orange"
            vertical
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  const gradients = [
    ['#222'],
    ['#42b3f4'],
    ['red', 'orange', 'yellow'],
    ['purple', 'violet'],
    ['#00c6ff', '#F0F', '#FF0'],
    ['#f72047', 'orange', '#ffd200', '#03a9f4', 'blue'],
  ];

  export default {
    name: 'ChatRate',

    props: {
      stats: { type: Object },
    },

    data() {
      return {
        width: 2,
        radius: 5,
        padding: 5,
        lineCap: 'round',
        gradient: gradients[5],
        gradientDirection: 'top',
        gradients,
        fill: false,
        type: 'trend',
        autoLineWidth: false,
        autoDraw: false,
      };
    },

    methods: {},

    computed: {
      dataLabels () {
        const total = this.stats.total > 1000
          ? `${this.stats.total/1000}k`
          : this.stats.total;

        return [
          {
            label: 'current:',
            value: this.stats.current,
          },
          {
            label: 'min:',
            value: this.stats.min,
          },
          {
            label: 'max:',
            value: this.stats.max,
          },
          {
            label: 'avg:',
            value: this.stats.average.toFixed(1),
          },
          {
            label: 'total:',
            value: total,
          },
        ];
      }
    },

  };
</script>

<style lang='scss'>
  #view-rate {
    position: relative;
    pointer-events: none;
    z-index: 2;

    .graph {
      background: rgba(0,0,0,.85);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .chart-val {
      z-index: 2;
    }
  }
</style>
