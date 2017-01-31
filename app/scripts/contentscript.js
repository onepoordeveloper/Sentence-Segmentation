'use strict';
$(document).ready(function() {
  setInterval(function () {
    filter();
  }, 1000);

  var filter = function () {
    if ($("#readerDiv:not(.done)").length > 0) {
      $("#readerDiv").addClass("done");
    }
    else{
      return;
    }
    $("#readerDiv *").each(function () {
      var v = $(this).html();
      var regexForPeriod = /\.\s/g;
      var regexForComma = /\,\s/g;
      v = v.replace(regexForPeriod, ".<br/>");
      //v = v.replace(regexForComma, ",<br/>");
      $(this).html(v);
    });
  }
});