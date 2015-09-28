"use strict";

/* global Path2D */

var nnng = require("nnng");
var defs = require("./defs");
var iid = require("./image-id");


module.exports = {
  paintTileBorders: function (c) {
    if (!this.tileBordersPath) {
      var path = new Path2D();
      path.moveTo(0, 0);
      path.lineTo(0, defs.height);
      for (var lx = 1; lx <= defs.tileXCount; lx++) {
        var ldx = lx * defs.imageSize;
        path.moveTo(ldx, 0);
        path.lineTo(ldx, defs.height);
      }
      path.moveTo(0, 0);
      path.lineTo(defs.width, 0);
      for (var ly = 1; ly <= defs.tileYCount; ly++) {
        var ldy = ly * defs.imageSize;
        path.moveTo(0, ldy);
        path.lineTo(defs.width, ldy);
      }
      this.tileBordersPath = path;
    }
    c.lineWidth = this.easedZoomLevel / window.devicePixelRatio;
    c.strokeStyle = defs.borderColor;
    c.stroke(this.tileBordersPath);
  },

  paintTileLabels: function (c) {
    var easedTextMargin = 4 * Math.sqrt(this.easedZoomLevel);
    c.fillStyle = defs.labelColor;
    c.font = 32 + "px " + defs.labelFont;
    c.textAlign = "left";
    c.textBaseline = "top";
    for (var lx = this.firstVisibleLocalX; lx <= this.lastVisibleLocalX; lx++) {
      var ldx = lx * defs.imageSize;
      var ngx = defs.localToNationalGridX(lx);
      for (var ly = this.firstVisibleLocalY; ly <= this.lastVisibleLocalY; ly++) {
        var ldy = ly * defs.imageSize;
        var ngy = defs.localToNationalGridY(ly);
        var latLon = nnng.from(ngx, ngy);
        var lat = latLon[0].toFixed(6);
        var lon = latLon[1].toFixed(6);
        c.fillText(ngx + "N," + ngy + "E (" + lat + "°N," + lon + "°E)", ldx + easedTextMargin, ldy);
      }
    }
  },

  paintTileContents: function (c) {
    for (var gx = this.firstVisibleGroupX; gx <= this.lastVisibleGroupX; gx += this.groupCount) {
      var gdx = gx * defs.imageSize;
      for (var gy = this.firstVisibleGroupY; gy <= this.lastVisibleGroupY; gy += this.groupCount) {
        var gdy = gy * defs.imageSize;
        var groupId = iid.fromLocal(gx, gy, this.roundZoomPower);
        var canvas = this.getRenderedGroup(groupId);
        if (canvas) {
          c.drawImage(canvas, gdx, gdy, this.groupSize, this.groupSize);
        }
      }
    }
  },

  paint: function () {
    var width  = window.devicePixelRatio * this.state.clientWidth;
    var height = window.devicePixelRatio * this.state.clientHeight;
    var canvas = this.canvas;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
    }
    var c = canvas.getContext("2d", {
        alpha: false
      });
    c.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    c.save();
    c.fillStyle = defs.backgroundColor;
    c.fillRect(0, 0, this.state.clientWidth, this.state.clientHeight);
    c.translate(-this.scrollLeft, -this.scrollTop);
    c.translate(0.5 / window.devicePixelRatio, 0.5 / window.devicePixelRatio);
    c.scale(1 / this.easedZoomLevel, 1 / this.easedZoomLevel);
    if (this.easedZoomPower < 3) {
      c.globalAlpha = 1 - (this.easedZoomPower - 2);
      this.paintTileLabels(c, this.easedZoomLevel);
      c.globalAlpha = 1;
    }
    this.paintTileBorders(c);
    c.restore();
    c.translate(-this.scrollLeft, -this.scrollTop);
    c.scale(1 / this.easedZoomLevel, 1 / this.easedZoomLevel);
    this.paintTileContents(c);
    if (this.state.invertColor) {
      c.restore();
      c.globalCompositeOperation = "difference";
      c.fillStyle = "#fff";
      c.fillRect(0, 0, this.state.clientWidth, this.state.clientHeight);
      c.globalCompositeOperation = "source-over";
    }
    this.pendingPaint = false;
  },

  requestPainting: function () {
    if (!this.pendingPaint) {
      this.pendingPaint = true;
      window.requestAnimationFrame(this.paint);
    }
  }
};
