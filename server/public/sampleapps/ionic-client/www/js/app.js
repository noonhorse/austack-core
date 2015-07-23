// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'austack', 'angular-jwt'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }

      // # TODO read config service ?
      // get the login url for this app
      // open the url with inappbrowser
      // http://plugins.cordova.io/#/package/org.apache.cordova.inappbrowser
      //
      // window.open = cordova.InAppBrowser.open;
      console.dir(window.open);
      var url = AUSTACK_DOMAIN;
      var target = '_blank';
      var options = 'location=yes';
      var ref = window.open(url, target, options);

      var myCallback = function (event) {
        console.dir(event);
      }

      ref.addEventListener('loadstart', myCallback);
      ref.addEventListener('loadstop', myCallback);
      ref.addEventListener('loaderror', myCallback);
      ref.addEventListener('exit', myCallback);
    });

  })
  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
    // setup an abstract state for the tabs directive
      .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })
      .state('tab.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chat-detail.html',
            controller: 'ChatDetailCtrl'
          }
        }
      })
      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

  })
  // austack config
  .config(function austackConfig($stateProvider, austackProvider, jwtInterceptorProvider, $httpProvider) {
    $stateProvider
      .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl'
      });
    // Configure Austack
    austackProvider.init({
      domain: AUSTACK_DOMAIN,
      clientId: AUSTACK_CLIENT_ID,
      loginState: 'login'
    });
    jwtInterceptorProvider.tokenGetter = function ($window, jwtHelper, austack) {
      var idToken = $window.localStorage.getItem('token');
      var refreshToken = $window.localStorage.getItem('refreshToken');
      if (!idToken || !refreshToken) {
        return null;
      }
      if (jwtHelper.isTokenExpired(idToken)) {
        return austack.refreshIdToken(refreshToken, function (idToken) {
          $window.localStorage.setItem('token', idToken);
          return idToken;
        });
      } else {
        return idToken;
      }
    }

    $httpProvider.interceptors.push('jwtInterceptor');
  })
  // austack run
  .run(function austackRun($rootScope, austack, $window) {
    $rootScope.$on('$locationChangeStart', function () {
      if (!austack.isAuthenticated) {
        var token = $window.localStorage.getItem('token');
        if (token) {
          austack.authenticate($window.localStorage.getItem('profile'), token);
        }
      }

    });
  });