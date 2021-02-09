/**
 * @namespace representation
 * @author Mike Amundsen (@mamund)
 * @created 2020-02-01
 * @description
 * bigco, inc
 * company response representations
 */

// load representors
var appJson = require('./representors/app-json');
var formsJson = require('./representors/forms-json');
var linksJson = require('./representors/links-json');
var pragJson = require('./representors/prag-json');
var textCsv = require('./representors/text-csv');

// support form encoding
exports.urlencoded = true;

exports.getTemplates = getTemplates;
exports.getResponseTypes = getResponseTypes;

/**
 * @function getTemplates
 * @memberof representation
 * @description
 * return supported response bodies
 */
function getTemplates () {
  var list = [];
  
  list.push(appJson.template);
  list.push(formsJson.template);
  list.push(textCsv.template);
  list.push(linksJson.template);
  list.push(pragJson.template);

  return list;  
}

/**
 * @function getResponseTypes
 * @memberof representation
 * @description
 * return supported response identifiers
 */
function getResponseTypes () {
  var rtn  = [];
  var viewList = this.getTemplates();

  viewList.forEach(function (item) {
    rtn.push(item.format);
  });
  
  return rtn;
}

// init to hold forms/links
/**
 * @memberof representation
 * @property {object} forms          - Forms.
 * @property {array} forms.pageForms - Page forms.
 * @property {array} forms.itemForms - Item forms.
 */
exports.forms = {
  pageForms: [],
  itemForms: []
}



