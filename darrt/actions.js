/**
 * @namespace actions
 * @author Mike Amundsen (@mamund)
 * @created 2020-02-01
 * @description
 * DARRT Framework
 * action elements
 * actions for the company service
 */

var component = require('./lib/component');
var data = require('./data');
var object = "api";

module.exports.home = home;
module.exports.create = create;
module.exports.list = list;
module.exports.filter = filter;
module.exports.read = read;
module.exports.update = update;
module.exports.status = status;
module.exports.remove = remove;

/**
 * @function home
 * @memberof actions
 * @param {object} req - Express Request object.
 */
function home (req) {
  return new Promise(function (resolve, reject) {
    var body = [];

    // hack to handle empty root for non-link types
    var ctype = req.get("Accept") || "";
    if ("application/json text/csv */*".indexOf(ctype) !== -1) {
      body = {
        id: "list",
        name: "api-starter",
        rel: "collection api",
        href:  "{fullhost}/list/"
      };
    }

    if (body) {
      resolve(body);
    } else {
      reject({ error: "invalid body" });
    }
  });
}

/**
 * @function create
 * @memberof actions
 * @param {object} req - Express Request object.
 */
function create (req) {
  return new Promise(function (resolve, reject) {
    if (req.body) {
      var body = req.body;
      var action = {
        name: object,
        action: 'add',
        item: body,
        props: data.props,
        reqd: data.reqd,
        enums: data.enums,
        defs: data.defs
      };
      resolve(component(action));
    } else {
      reject({ error: "invalid body" });
    }
  });
}

/**
 * @function list
 * @memberof actions
 */
function list () {
  return new Promise(function (resolve) {
    var action = {
      name: object,
      action: 'list'
    };
    resolve(component(action));
  });
}

/**
 * @function filter
 * @memberof actions
 * @param {object} req - Express Request object.
 */
function filter (req) {
  return new Promise(function (resolve, reject) {
    if (req.query && req.query.length !== 0) {
      var action = {
        name: object,
        action: 'filter',
        filter: req.query
      };
      resolve(component(action));
    } else {
      reject({ error:"invalid query string" });
    }
  });
}

/**
 * @function read
 * @memberof actions
 * @param {object} req - Express Request object.
 */
function read (req) {
  return new Promise(function (resolve, reject) {
    if (req.params.id && req.params.id !== null) {
      var id = req.params.id;
      var action = {
        name: object,
        action: 'item',
        id: id
      };
      resolve(component(action));
    } else {
      reject({ error:"missing id" });
    }
  });
}

/**
 * @function update
 * @memberof actions
 * @param {object} req - Express Request object.
 */
function update (req) {
  var id, body;
  return new Promise(function (resolve, reject) {
    id = req.params.id || null;
    body = req.body || null;
    if (id !== null && body !== null) {
      var action = {
        name: object,
        action: 'update',
        id: id,
        item: body,
        props: data.props,
        reqd: data.reqd,
        enums: data.enums
      };
      resolve(component(action));
    } else {
      reject({ error:"missing id and/or body" });
    }
  });
}

/**
 * @function status
 * @memberof actions
 * @param {object} req - Express Request object.
 */
function status (req) {
  var id, body;
  return new Promise(function (resolve, reject) {
    id = req.params.id || null;
    body = req.body || null;
    if (id !== null && body !== null) {
      var action = {
        name: object,
        action: 'update',
        id: id,
        item: body,
        props: data.props,
        reqd: data.data,
        enums: data.enums
      };
      resolve(component(action));
    } else {
      reject({ error: "missing id and/or body" });
    }
  });
}

/**
 * @function remove
 * @memberof actions
 * @param {object} req - Express Request object.
 */
function remove (req) {
  return new Promise(function (resolve, reject) {
    if (req.params.id && req.params.id !== null) {
      var id = req.params.id;
      var action = {
        name: object,
        action: 'delete',
        id: id
      };
      resolve(component(action));
    } else {
      reject({ error:"invalid id" });
    }
  });
}

// EOF
