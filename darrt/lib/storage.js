/**
 * @module lib/storage
 * @author Mike Amundsen (@mamund)
 * @description
 * darrt simple storage (via files)
 * DARRT DATA Module
 * - simple storage component writes files to disk
 * - FOLDER is the collection (tasks, users, notes, etc.)
 * - FILE is the record (stored as JSON object, w/ ID as filename)
 * - CRUD style interface (list, item, add, update, remove)
 * - "contains"-type filtering is supported, no sort or join
 * - NOTE: all actions are *synchronous* 
 */

var fs = require('fs');
var folder = process.cwd() + '/data/';

module.exports = main;

/**
 * @function main
 * @static
 * @param {object} args - Configuration object for storage medium.
 * @description
 * args is a hash table of possible arguments
 * {object:"",action:"",filter:"",id:"",item:objItem}
 */
function main (args) {
  var rtn;

  // resolve arguments
  var action = args.action||"";
  var object = args.object||null;
  var filter = args.filter||null;
  var id = args.id||null;
  var item = args.item||{};
  var fields = args.fields||"";

  switch (action) {
    case 'create':
      rtn = createObject(object);
      break;
    case 'list':
      rtn = getList(object, null, fields);
      break;
    case 'filter':
      rtn = getList(object, filter, fields);
      break;
    case 'item':
      rtn = getItem(object, id, fields);
      break;
    case 'add':
      rtn = addItem(object, item, id);
      break;
    case 'update':
      rtn = updateItem(object, item, id);
      break;
    case 'remove':
      rtn = removeItem(object, id);
      break;
    default:
      rtn = null;
      break;
  }

  return rtn;
 
}

/**
 * @function getList
 * @inner
 * @param {object} object
 * @param {object} filter
 * @param {array} fields
 * @description
 * get a list of items (possibly via filter)
 */
function getList (object, filter, fields) {
  var coll, item, list, i, x, t;

  coll = [];
  try {
    list = fs.readdirSync(folder + object + '/');
    for (i = 0, x = list.length; i < x; i++) {
      item = JSON.parse(fs.readFileSync(folder + object + '/' + list[i]));
      if (filter && filter !== null) {
        t = null;
        for (var name in filter) {
          if (filter[name].toString().length !== 0) {
            try {
              if (item[name].toString().toLowerCase().indexOf(filter[name].toString().toLowerCase()) !== -1) { 
                t = list[i];
              } else {
                t = null;
              }
            } catch (err) {
              t = null;
            }
          }
        }
        if (t !== null) {
          coll.push(item);
        }
      } else {
        coll.push(item);
      }
    }
  } catch (ex) {
    coll = [];
  }

  // apply field filter
  for (i = 0, x = coll.length; i < x; i++) {
    coll[i] = applyFields(coll[i], fields);
  }

  return coll;
}

/**
 * @function getItem
 * @inner
 * @param {object} item
 * @param {string} id
 * @param {array} fields
 * @description
 * retrieve and existing item
 */
function getItem (item, id, fields) {
  var rtn, args;

  try {
    rtn = JSON.parse(fs.readFileSync(folder + item + '/' + id));
  } catch (ex) {
    args = {};
    args.title = "SimpleStorage: ["+item+"]";
    args.detail = "Not Found ["+id+"]";
    args.code = 400;
    args.debug = ex.message;
    rtn = exception(args);
  }
  
  rtn = applyFields(rtn, fields);

  return rtn;
}

/**
 * @function applyFields
 * @inner
 * @param {object} item - object to return
 * @param {array} fields - an array of field names to return
 * @description
 * apply field list
 */
function applyFields (item, fields) {
  var rtn = {};
  
  if (fields && fields.length !== 0) {
    for (var i in item) {
      if (fields.indexOf(i) !== -1) {
        rtn[i] = item[i];
      }
    }
  } else {
    rtn = item;
  }
  
  return rtn;
}

/**
 * @function createObject
 * @inner
 * @param {object} object - Object.
 * @description
 * create a storage object (folder)
 */
function createObject (object) {
  var rtn, args = {};
  try {
    if (folder && folder !== null) {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
    }
    if (object && object !== null) {
      fs.mkdirSync(folder + object);
    } else {
      args = {};
      args.title = "SimpleStorage: ["+object+"]";
      args.detail = "unable to create object";
      args.code = 400;
      rtn = exception(args);
    }
  } catch (ex) {
    args = {};
    args.title = "SimpleStorage: ["+object+"]";
    args.detail = "error creating folder/object";
    args.code = 400;
    args.debug = ex.message;
    rtn = exception(args);
  }

	return rtn;
}

/**
 * @function addItem
 * @inner
 * @param {} object
 * @param {} item
 * @param {} id
 * @description
 * add a new item
 */
function addItem (object, item, id) {
  var rtn, args;

  if (id) {
    item.id = id;
  } else {
    item.id = makeId();
  }
  item.dateCreated = new Date();
  item.dateUpdated = item.dateCreated;

  if (fs.existsSync(folder + object + '/' + item.id)) {
    args = {};
    args.title = "SimpleStorage: ["+object+"]";
    args.detail = "Record already exists";
    rtn = exception(args);
  } else {
    try {
      fs.writeFileSync(folder + object + '/' + item.id, JSON.stringify(item));
      rtn = getItem(object, item.id);
    } catch (ex) {
      args = {};
      args.title = "SimpleStorage: ["+object+"]";
      args.detail = "Unable to add item";
      args.code = 400;
      args.debug = ex.message;
      rtn = exception(args);
    }
  }
  return rtn;
}

/**
 * @function updateItem
 * @inner
 * @param {} object
 * @param {} item
 * @param {} id
 * @description
 * modify an existing item
 */
function updateItem (object, item, id) {
  var current, rtn, args;

  current = getItem(object, id);
  if (!current) {
    args.title = "SimpleStorage: ["+object+"]";
    args.detail = "Invalid [id]";
    args.code = 400;
    rtn = exception(args);
    return rtn;
  }
   
  current = item;
  current.dateUpdated = new Date();
  
  rtn = null;
  try {
    fs.writeFileSync(folder + object + '/' + id, JSON.stringify(current));
    rtn = getItem(object, id);
  } catch (ex) {
    args = {};
    args.title = "SimpleStorage: ["+object+"]";
    args.detail = "Unable to update item";
    args.code = 400;
    args.debug = ex.message;
    rtn = exception(args);
  }

  return rtn;
}

/**
 * @function removeItem
 * @inner
 * @param {string} object - Name/type of object to be removed.
 * @param {string} id - Id of item.
 * @description
 * remove the item
 */
function removeItem (object, id) {
  var rtn;

  try {
    fs.unlinkSync(folder + object + '/' + id);
    rtn = getList(object);
  } catch (ex) {
    rtn = getList(object);
  }
  return rtn;
}

/**
 * @function makeId
 * @inner
 * @description
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
 * @function exception
 * @inner
 * @param {object} args - Object for the error.
 * @description
 * craft an exception msg
 */
function exception (args) {
  var rtn = {};

  rtn.type = (args.type || "error");
  rtn.title = (args.title || "Error");
  rtn.detail = (args.detail || args.title);
  rtn.status = (args.code || "400");
  if (args.url) { rtn.instance = args.url; }
  if (args.debug) { rtn.debug = args.debug; }

  return rtn;
}

// EOF

