/**
 * @module lib/utils
 * @author Mike Amundsen (@mamund)
 * @description
 * internal utilities
 */

var fs = require('fs');
var qs = require('querystring');
var folder = process.cwd() + '/files/';
var ejs = require('ejs');
var jsUtil = require('util');
var ejsHelper = require('./ejs-helpers');

// for handling hal-forms extension
var halFormType = "application/prs.hal-forms+json";
var sirenSopType = "application/prs.siren-sop+json";

// for handling basic mime-types
var htmlType = '.html';
var jsType = '.js';
var cssType = '.css';

// load up action map (for Siren)
var httpActions = {};
httpActions.append = "POST";
httpActions.partial = "PATCH";
httpActions.read = "GET";
httpActions.remove = "DELETE";
httpActions.replace = "PUT";
httpActions.options = "OPTIONS";
httpActions.trace = "TRACE";

exports.actionMethod = actionMethod;
exports.setProps = setProps;
exports.cleanList = cleanList;
exports.makeId = makeId;
exports.file = file;
exports.errorResponse = errorResponse;
exports.parseBody = parseBody;
exports.cjBody = cjBody;
exports.getQArgs = getQArgs;
exports.exception = exception;
exports.handler = handler;

/**
 * @function actionMethod
 * @param {} action
 * @param {} protocol
 * @description
 * map WeSTL actions to HTTP
 */
function actionMethod (action, protocol) {
  var p = protocol || "http";
  var rtn = "GET";

  switch(p) {
    case "http":
      rtn = httpActions[action];
      break;
    default:
      rtn = "GET";
  }
  return rtn;
}

/**
 * @function setProps
 * @param {object} item
 * @param {array} props
 * @description
 * only write 'known' properties for an item
 */
function setProps (item, props) {
  var rtn, i, x, p;
    
  rtn = {};  
  for(i = 0,x = props.length; i < x; i++) {
    p = props[i];
    rtn[p] = (item[p] || "");
  }
  return rtn;
}

/**
 * @function cleanList
 * @param {array} elm
 * @description
 * produce clean array of items
 */
function cleanList (elm) {
  var coll;

  coll = [];
  if (Array.isArray(elm) === true) {
    coll = elm;
  } else {
    if (elm !== null) {
      coll.push(elm);
    }
  }

  return coll;
}

/**
 * @function makeId
 * generate a unique id 
 */
function makeId () {
  var rtn;

  rtn = String(Math.random());
  rtn = rtn.substring(2);
  rtn = parseInt(rtn).toString(36);

  return rtn;
}

/**
 * @function errorResponse
 * @param {object} req
 * @param {object} res
 * @param {string} msg
 * @param {number} code
 * @param {string} description
 * @description
 * craft an external error response (anything, really)
 */
function errorResponse (req, res, msg, code, description) {
  var doc;

  doc = {};
  doc.error = {};
  doc.error.code = code;
  doc.error.message = msg||description;
  doc.error.url = 'http://' + req.headers.host + req.url;
  if (description) {
    doc.error.description = description;
  }

  return {
    code: code,
    doc: doc
  };
}

/**
 * @function file
 * @param {} req
 * @param {} res
 * @param {} parts
 * @param {} respond
 * @description
 * simple file responder
 *
 * ASSUMES: 
 * - only files to deal with are JS, CSS & HTML
 * - all of them are in a single sub-folder (FILES)
 * - NOTE: this is a *synch* routine w/o streaming
 */
function file (req, res, parts, respond) {
  var body, type;

  try {
    body = fs.readFileSync(folder + parts[1]);
    
    type = 'text/plain';
    if (parts[1].indexOf(jsType) !== -1) {
      type = 'application/javascript';
    }
    if (parts[1].indexOf(cssType) !== -1) {
      type = 'text/css';
    }
    if (parts[1].indexOf(htmlType) !== -1) {
      type = 'text/html';
    }
    if(req.headers["accept"].indexOf(halFormType) !== -1) {
      type = halFormType;
    }
    if(req.headers["accept"].indexOf(sirenSopType) !== -1) {
      type = sirenSopType;
    }
    
    respond(req, res, {
      code: 200,
      doc: body,
      headers: {
        'content-type': type
      },
      file: true
    });
  } catch (ex) {
    respond(req, res, this.errorResponse(req, res, "File Not Found", 404));
  }
}

// dispatch for parsing incoming HTTP bodies
// ALWAYS returns JSON NVP collection
//
/**
 * parseBody.
 *
 * @param {} body
 * @param {} ctype
 */
function parseBody (body, ctype) {
  var msg;
  
  switch (ctype) {
    case "application/x-www-form-urlencoded":
      msg = qs.parse(body);
      break;
    case "application/vnd.collection+json":
      msg = cjBody(body);
      break;
    default:
      msg = JSON.parse(body);
      break;
  }
  return msg;
}

/**
 * @function cjBody
 * @param {} body
 * @description
 * process an incoming cj template body
 */
function cjBody (body) {
  var rtn, data, i, x;
  
  rtn = {};
  data = null;
  body = JSON.parse(body);
  
  // if they include template...
  if(body.template && body.template.data) {
    data = body.template.data;
  }

  // if they only pass data array...
  if(data === null && body.data) {
    data = body.data;
  }

  // create nvp dictionary
  if (data !== null) {
    for (i = 0, x = data.length; i < x; i++) {
      rtn[data[i].name] = data[i].value;
    }
  }
  
  return rtn;
}

/**
 * @function getQArgs
 * @param {object} req - Request object.
 * @description
 * parse the querystring args
 */
function getQArgs (req) {
  var q, qlist;
  
  qlist = null;
  q = req.url.split('?');
  if (q[1] !== undefined) {
    qlist = qs.parse(q[1]);
  }
  return qlist;
}

/**
 * @function exception.
 * @param {string} name
 * @param {string} message
 * @param {number} code
 * @param {} type
 * @param {} url
 * @description
 * craft an internal exception object
 * based on RFC7807 (problem details
 * local exeption routine
 */
function exception (name, message, code, type, url) {
  var rtn = {};

  rtn.type = (type || "error");
  rtn.title = (name || "Error");
  rtn.detail = (message || name);
  rtn.status = (code || 400).toString();
  if (url) { rtn.instance = url; }

  return rtn;
}

/**
 * @function handler
 * @param {} req
 * @param {} res
 * @param {} fn
 * @param {} type
 * @param {} representation
 * ejs-dependent response emitter
 * handle formatting response
 * depends on ejs templating
 */
function handler (req, res, fn, type, representation) {
  var rtn = {};
  var xr = [];
  var oType = type || "collection";

  var filter = representation.filter || "";
  var templates = representation.templates || [];
  var template = resolveAccepts(req, templates);

  var forms = representation.forms || {};
  var pForms = forms.pageForms || [];
  var iForms = forms.itemForms || [];

  var metadata = representation.metadata || [];

  pForms = tagFilter(pForms, filter);
  iForms = tagFilter(iForms, filter);
  metadata = tagFilter(metadata, filter);   

  fn(req,res).then(function (body) {
    if (jsUtil.isArray(body) === true) {
      oType = type || "collection";
      if (body.length !== 0 && body[0].type && body[0].type === "error") {
        xr.push(exception(
          body[0].name || body[0].title,
          body[0].message || body[0].detail,
          body[0].code || body[0].status,
          body[0].oType,
          'http://' + req.headers.host + req.url
        ));
        rtn = xr;
        oType="error";
      } else {
        rtn = body;
      }
    } else {
      oType = type || "item";
      if (body.type && body.type === 'error') {
        xr.push(exception(
          body.name || body.title,
          body.detail,
          body.code || body.status,
          body.oType,
          'http://' + req.headers.host + req.url
        ));
        rtn = xr;
        oType = "error";
      } else {
        rtn = [body];
      } 
    }

    if (oType === "error") {
      res.setHeader("content-type", "application/problem+json");
      res.status(rtn.code || 400).send(JSON.stringify({ error: rtn }, null, 2));
    } else {
      var reply = "";
      rtn = {
				rtn: rtn,
        type: oType, 
        pForms: pForms,
        iForms: iForms, 
        metadata: metadata, 
        helpers: ejsHelper, 
        request: req
      };
      if (template.view !== "") {
        reply= ejs.render(template.view, rtn);
      } else {
        reply = JSON.stringify(rtn, null, 2);
      }
      // clean up blank lines
      reply = reply.replace(/^\s*$[\n\r]{1,}/gm, '');

      res.type(template.format);
      res.send(reply);
    }
  }).catch(function (err) {
    xr.push(exception(
      "Server error",
      err.message||"Internal error",
      '500',
      "error",
      'http://' + req.headers.host + req.url
    ));
    res.setHeader("content-type", "application/problem+json");      
    res.status(500).send(JSON.stringify({ error: xr }, null, 2));
  });
}

/**
 * @function resolveAccepts
 * @inner
 * @param {object} req Express Request object.
 * @param {array} templates List of templates.
 * @description
 * sort out accept header
 */
function resolveAccepts (req, templates) {
  var rtn = "";
  var fallback = {
    format: "application/json",
    view: ""
  };
  
  templates.forEach(function (template) {
    if (rtn === "" && req.accepts(template.format)) {
      rtn = template;
    }
  });
  if (rtn === "") {
    rtn = fallback;
  }
  return rtn;
}

/**
 * @function tagFilter
 * @inner
 * @param {} collection
 * @param {} filter
 * @description
 * tag filter
 */
function tagFilter(collection, filter) {
  var coll = collection || [];
  var tag = filter || "";
  var rtn = [];
  var f;
  
  if (tag === "") {
    rtn = coll;
  } else {
    coll.forEach(function (item) {
      f = item.tags || "";
      if (f === "") {
        rtn.push(item);
      } else {
        if (f.indexOf(tag) !== -1) {
          rtn.push(item);
        }
      }
    });
  }
  return rtn;
}

// EOF

