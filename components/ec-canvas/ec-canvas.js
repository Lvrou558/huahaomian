import * as echarts from './echarts.min.js';

let ctx;

function initChart(canvas, width, height, dpr, option) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);
  chart.setOption(option);
  return chart;
}

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    option: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {
        if (this.chart && newVal) {
          this.chart.setOption(newVal, true);
        }
      }
    }
  },

  data: {
    ec: {
      onInit: null
    }
  },

  lifetimes: {
    ready() {
      this.data.ec.onInit = (canvas, width, height, dpr) => {
        this.chart = initChart(canvas, width, height, dpr, this.data.option);
        return this.chart;
      };
    }
  },

  methods: {
    refresh(option) {
      if (this.chart) {
        this.chart.setOption(option, true);
      }
    }
  }
});