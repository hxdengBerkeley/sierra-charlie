"use strict";

var r = require("./react");
var app = r.wrap(require("./components").app);

r.render(app(), document.getElementById("root"));
