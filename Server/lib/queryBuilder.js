
/**
 * [queryBuilder]
 * @param  {[String]} type      [INSERT | SELECT]
 * @param  {[Array of Strings]} params    [Query parameters]
 * @param  {[Array | String]} tables    [description]
 * @param  {[Array]} expr      [description]
 * @param  {[Array | String]} vals      [description]
 * @param  {[type]} returning [description]
 * @return {[String]}           [The built query]
 *
 * queryBuilder(TYPE,PARAMS,TABLES,EXPR,VALS,RETURNING)
 */
exports.queryBuilder = function(type,params,tables,expr,vals,returning,fn){
  var query = ''
  if (type == 'INSERT'){
    var parameters = params.toString();
    var values = vals.toString();
    query = 'INSERT INTO '+tables+' ('+params+') VALUES ('+vals+')';

    if (returning){
      var returning = returning.toString();
      query=query+" RETURNING "+returning;
    }
  }else if (type == 'SELECT'){
    // Check for query parameters
    if (params == undefined)
      var parameters = '*';
    else
      var parameters = params.toString();
    tables = tables.toString();
    query = "SELECT "+parameters+" FROM "+tables
    if (expr[0] !== undefined){
      if (expr){
        query = query + " WHERE "
      }
      for (i=0;i<expr.length-1;i++){
        query=query+"'"+expr[i]+"' AND ";
      }
      query=query+"'"+expr[i]+"'";
    }
  }
  return fn(null,query);

}
