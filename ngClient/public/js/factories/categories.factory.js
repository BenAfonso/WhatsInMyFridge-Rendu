myApp.factory("Categories", function($resource,APILINK) {
  return $resource(APILINK+"/api/v2/categories/:id", {id: '@id'}, {
      query: {method: 'GET', isArray: true}
  });
});
