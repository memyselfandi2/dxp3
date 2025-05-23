/******************************************
* DXP3  Digital Experience Platform 3
*       Management
* DAO   Data Access Objects
*
* PACKAGE
* dxp3.management.dao
*
* NAME
* error
*
* DESCRIPTION
* Helper class to return error conditions.
*
*****************************************/
const error = {};

error.BAD_REQUEST = 400;
error.CONFLICT = 409;
error.FILE_NOT_FOUND = 404;
error.FORBIDDEN = 403;
error.INTERNAL_SERVER_ERROR = 500;
error.NOT_IMPLEMENTED = 501;
error.UNAUTHORIZED = 401;

module.exports = error;