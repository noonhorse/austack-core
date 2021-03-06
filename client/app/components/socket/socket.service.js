(function () {
  'use strict';

  // register factory as socket
  angular
    .module('austackApp.socket', [
      'austackApp.io',
      'austackApp.lodash'
    ])
    .factory('socket', SocketService);

  // inject dependencies for SocketService
  SocketService.$inject = ['socketFactory', '_', 'io', 'Config'];

  /**
   * SocketService constructor
   *
   * @param socketFactory
   * @param _
   * @param io
   * @returns {{socket: *, syncUpdates: syncUpdates, unsyncUpdates: unsyncUpdates}}
   * @constructor
   */
  function SocketService(socketFactory, _, io, Config) {
    // ommit a connection url for auto-configure
    // Send auth token on connection, you will need to DI the Auth service above
    var ioSocket = io(Config.SERVER_URL, {
      path: '/socket.io-client' /*, 'query': 'token=' + Auth.getToken() */
    });
    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,
      syncUpdates: syncUpdates,
      unsyncUpdates: unsyncUpdates
    };

    /**
     * Register listeners to sync an array with updates on a model
     *
     * Takes the array we want to sync, the model name that socket updates are sent from,
     * and an optional callback function after new items are updated.
     *
     * @param {String} modelName
     * @param {Array} array
     * @param {Function} cb
     */
    function syncUpdates(modelName, array, cb) {
      cb = cb || angular.noop;
      array = array.data || array;

      /**
       * Syncs item creation/updates on 'model:save'
       */
      socket.on(modelName + ':save', function (item) {
        var index = _.findIndex(array, {
          _id: item._id
        });
        var event = 'created';

        // replace oldItem if it exists
        // otherwise just add item to the collection
        if (index !== -1) {
          array.splice(index, 1, item);
          event = 'updated';
        } else {
          array.push(item);
        }

        cb(event, item, array);
      });

      /**
       * Syncs removed items on 'model:remove'
       */
      socket.on(modelName + ':remove', function (item) {
        var event = 'deleted';
        _.remove(array, {
          _id: item._id
        });
        cb(event, item, array);
      });
    }

    /**
     * Removes listeners for a models updates on the socket
     *
     * @param modelName
     */
    function unsyncUpdates(modelName) {
      socket.removeAllListeners(modelName + ':save');
      socket.removeAllListeners(modelName + ':remove');
    }
  }

})();
