var clc = require('cli-color');


/**
* This function takes and Error object with message / http_code properties and send a json through res
*
*   Example:
*   var err = new Error("Not found");
*   err.http_code = 404;
*   handler(err,res);
*  ==> Then handler will res.status(404).send({
                                                "status": "404",
                                                "message": "Not found"
                                            }); 
*/

exports.handler = function(err,res){
    console.log(clc.red("[-] A "+err.http_code+" error occured: "+err.message));
    res.status(err.http_code);
    res.json({
      "status": err.http_code,
      "message": err.message
    });
}
