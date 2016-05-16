var request = require('request');
var url = require('url');
// This functions calls a distant API to compress a given img url and returns
// a compressed image using http://api.resmush.it
exports.compress = function(img, fn){
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if (img !== undefined && regexp.test(img)){
    return fn(null, img);
    /*request({
      url:'http://api.resmush.it/ws.php/',
      method: 'POST',
      json: true,
      body: {img: img}
    },*/
    // Image already compressed

    // THIS Functionnality has been removed because of the sudden limitations caused by
    // reSmushIt, they suddently decided to limit the host time to ~5 minute on their server.

    /*
    if (url.parse(img).hostname.indexOf('resmush.it') >= 0){
      console.log("Image already compressed, next =>");
      return fn(null,img);
    }

    // Compressing image using API

    request({
      url:'http://api.resmush.it/ws.php?img='+img,
      method: 'GET'
    },
     function(err,httpResponse,body){
       if (err){
         return fn(err,img);
       }
       result = JSON.parse(body).dest;
       if (result !== undefined){
         console.log("An image has been compressed successfully");
         return fn(null,result);
       }else{
         var err = new Error("Image compressing failed using original image");
         return fn(err, img);
       }
     });
     */
   }else{
     console.log("No valid image submitted, next =>");
     return fn(null, img);
   }

}
