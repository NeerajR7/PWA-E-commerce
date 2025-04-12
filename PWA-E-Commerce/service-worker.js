var filesToCache = [
    '/index.html',
    '/product_details.html',
    '/products.html',
    '/cart.html',
    '/account.html'
  ];
  
  var preLoad = function () {
    return caches.open("offline").then(function (cache) {
      // Caching index and important routes
      return cache.addAll(filesToCache);
    });
  };
  
  self.addEventListener("install", function (event) {
    event.waitUntil(preLoad());
  });
  
  self.addEventListener("fetch", function (event) {
    event.respondWith(
      checkResponse(event.request).catch(function () {
        console.log("Fetch from cache successful!");
        return returnFromCache(event.request);
      })
    );
  
    console.log("Fetch successful!");
    event.waitUntil(addToCache(event.request));
  });
  
  self.addEventListener("sync", function (event) {
    if (event.tag === 'Sync from cache') {
      console.log("Sync successful!");
    }
  });
  
  self.addEventListener("push", function (event) {
    if (event && event.data) {
      var data = event.data.json();
      if (data.method === "PushMessageData") {
        console.log("Push notification sent");
        event.waitUntil(
          self.registration.showNotification("RED STORE", {
            body: data.message
          })
        );
      }
    }
  });
  
  var checkResponse = function (request) {
    return new Promise(function (fulfill, reject) {
      fetch(request).then(function (response) {
        if (response.status !== 404) {
          fulfill(response);
        } else {
          reject();
        }
      }, reject);
    });
  };
  
  var addToCache = function (request) {
    return caches.open("offline").then(function (cache) {
      return fetch(request).then(function (response) {
        return cache.put(request, response);
      });
    });
  };
  
  var returnFromCache = function (request) {
    return caches.open("offline").then(function (cache) {
      return cache.match(request).then(function (matching) {
        if (!matching || matching.status === 404) {
          return cache.match("index.html");
        } else {
          return matching;
        }
      });
    });
  };
  