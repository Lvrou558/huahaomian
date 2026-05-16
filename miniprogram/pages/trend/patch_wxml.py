# -*- coding: utf-8 -*-
import re
from pathlib import Path

p = Path(__file__).with_name("index.wxml")
s = p.read_text(encoding="utf-8")

toolbar_main = (
    '      <text class="seg-sep">|</text>\n'
    '      <text class="op" bindtap="panLeft">«</text>\n'
    '      <text class="op" bindtap="panLeft">&lt;</text>\n'
    '      <text class="op-hint">左右滑动查看</text>\n'
    '      <text class="op" bindtap="panRight">&gt;</text>\n'
    '      <text class="op" bindtap="panRight">»</text>\n'
    '      <text class="op" bindtap="zoomIn">+</text>\n'
    '      <text class="op" bindtap="zoomOut">-</text>'
)

toolbar_detail = (
    '            <text class="seg-sep">|</text>\n'
    '            <text class="op" bindtap="panLeft">«</text>\n'
    '            <text class="op" bindtap="panLeft">&lt;</text>\n'
    '            <text class="op-hint">左右滑动查看</text>\n'
    '            <text class="op" bindtap="panRight">&gt;</text>\n'
    '            <text class="op" bindtap="panRight">»</text>\n'
    '            <text class="op" bindtap="zoomIn">+</text>\n'
    '            <text class="op" bindtap="zoomOut">-</text>'
)

s, n1 = re.subn(
    r'<text class="seg-sep">\|</text>\s*<text class="op" bindtap="panLeft">«</text>[\s\S]*?</view>\s*\n\n    <view class="kline-wrap">',
    toolbar_main + "\n    </view>\n\n    <view class=\"kline-wrap\">",
    s,
    count=1,
)

s, n2 = re.subn(
    r'<text class="seg-sep">\|</text>\s*<text class="op" bindtap="panLeft">«</text>[\s\S]*?</view>\s*\n          <view class="chart-container chart-container--tall">',
    toolbar_detail + "\n          </view>\n          <view class=\"chart-container chart-container--tall\">",
    s,
    count=1,
)

p.write_text(s, encoding="utf-8")
print("patched", n1, n2)
