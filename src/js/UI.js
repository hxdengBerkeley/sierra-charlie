"use strict";

const Elm = require("../elm/UI.elm");


function UI(callbacks) {
  const localRuntime = Elm.embed(Elm.UI, document.getElementById("ui"), {
    incomingMessage: null
  });

  function send(message) {
    localRuntime.ports.incomingMessage.send(Object.assign({
      mode: null,
      loadingProgress: 0,
      feature: null,
      routes: [],
      adjustment: null
    }, message));
  }
  this.updateMode = (mode) => {
    send({
      tag: "UpdateMode",
      mode: mode
    });
  };
  this.updateLoadingProgress = (loadingProgress) => {
    send({
      tag: "UpdateLoadingProgress",
      loadingProgress: loadingProgress
    });
  };
  this.updateHighlightedFeature = (feature) => {
    send({
      tag: "UpdateHighlightedFeature",
      feature: feature
    });
  };
  this.updateSelectedFeature = (feature) => {
    send({
      tag: "UpdateSelectedFeature",
      feature: feature
    });
  };
  this.updateRoutes = (routes) => {
    send({
      tag: "UpdateRoutes",
      routes: routes
    });
  };
  this.updateAdjustment = (adjustment) => {
    send({
      tag: "UpdateAdjustment",
      adjustment: adjustment
    });
  };

  this.receive = (message) => {
    switch (message.tag) {
      case "SetMode":
        callbacks.setMode(message.mode);
        break;
      case "HighlightFeatureByTOID":
        callbacks.highlightFeatureByTOID(message.toid);
        break;
      case "SelectFeatureByTOID":
        callbacks.selectFeatureByTOID(message.toid);
        break;
      case "DeleteSelectedFeature":
        callbacks.deleteSelectedFeature();
        break;
      case "UndeleteSelectedFeature":
        callbacks.undeleteSelectedFeature();
        break;
      case "ClearRoutes":
        callbacks.clearRoutes();
        break;
      case "ClearAdjustment":
        callbacks.clearAdjustment();
        break;
      default:
        throw new Error("Invalid outgoing message: " + message.tag);
    }
  };
  localRuntime.ports.outgoingMessage.subscribe(this.receive);

  this.receiveSpecial = (message) => {
    switch (message) {
      case "SaveRoutesAsJSON":
        callbacks.saveRoutesAsJSON();
        break;
      case "SaveAdjustmentAsJSON":
        callbacks.saveAdjustmentAsJSON();
        break;
      default:
        throw new Error("Invalid special outgoing message: " + message);
    }
  };
}

module.exports = UI;