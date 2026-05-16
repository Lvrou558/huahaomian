const fs = require("fs");
const p = __dirname + "/index.wxml";
let s = fs.readFileSync(p, "utf8");

const toolbarFix =
  '      <text class="seg-sep">|</text>\n' +
  '      <text class="op" bindtap="panLeft">«</text>\n' +
  '      <text class="op" bindtap="panLeft">&lt;</text>\n' +
  '      <text class="op-hint">左右滑动查看</text>\n' +
  '      <text class="op" bindtap="panRight">&gt;</text>\n' +
  '      <text class="op" bindtap="panRight">»</text>\n' +
  '      <text class="op" bindtap="zoomIn">��</text>\n' +
  '      <text class="op" bindtap="zoomOut">－</text>';

// Replace first segment-row toolbar (after chart-title block)
s = s.replace(
  /<text class="seg-sep">\|<\/text>[\s\S]*?<\/view>\n\n    <view class="kline-wrap">/,
  toolbarFix + "\n    </view>\n\n    <view class=\"kline-wrap\">"
);

const toolbarFix2 =
  '            <text class="seg-sep">|</text>\n' +
  '            <text class="op" bindtap="panLeft">«</text>\n' +
  '            <text class="op" bindtap="panLeft">&lt;</text>\n' +
  '            <text class="op-hint">左右滑动查看</text>\n' +
  '            <text class="op" bindtap="panRight">&gt;</text>\n' +
  '            <text class="op" bindtap="panRight">»</text>\n' +
  '            <text class="op" bindtap="zoomIn">��</text>\n' +
  '            <text class="op" bindtap="zoomOut">－</text>';

s = s.replace(
  /<text class="seg-sep">\|<\/text>\n <text class="op" bindtap="panLeft">«<\/text>[\s\S]*?<\/view>\n          <view class="chart-container chart-container--tall">/,
  toolbarFix2 + "\n          </view>\n          <view class=\"chart-container chart-container--tall\">"
);

fs.writeFileSync(p, s, "utf8");
console.log("ok");
