/**
 * @namespace data
 * @author Mike Amundsen (@mamund)
 * @created 2020-02-01
 * @description
 * DARRT Framework
 * data elements 
 * properties, requireds, and enums
 */

/**
 * @memberof data
 * @property props {array} - Properties of resources.
 * @description
 * this service's message properties
 * you MUST include id, dateCreated, and dateUpdated
 */
exports.props = [
  'id',
  'givenName',
  'familyName',
  'telephone',
  'email',
  'status',
  'dateCreated',
  'dateUpdated'
];

/**
 * @memberof data
 * @property reqd {array} - Required fields.
 * @description
 * required properties
 */
exports.reqd = ['id','email','status'];

/**
 * @memberof data
 * @property enums {array} - Enums.
 * @description
 * enumerated properties
 * @enum {string}
 */
exports.enums = [
  {status:['pending','active','suspended','closed']}
];

/**
 * @memberof data
 * @property defs {array} - Defaults.
 * @description
 * default values for properties
 */
exports.defs = [
  {name:"status",value:"pending"}
];

// EOF
