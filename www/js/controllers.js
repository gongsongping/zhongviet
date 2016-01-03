angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $window, $http, $state, $rootScope, Session, User, $ionicSlideBoxDelegate) {
  if ($window.localStorage.token) {
    $state.go('tab.home', {}, {reload: true})
  } else {
    $state.go('forms', {}, {reload: true})
  }
  $scope.currentUser = Boolean($window.localStorage.token)
  // Form data for the login modal
  $scope.logout = function() {
    $window.localStorage.token = ''
    $scope.currentUser = Boolean($window.localStorage.token)
    $http.defaults.headers.common['Authorization'] = ''
    console.log($window.localStorage.token)
    $rootScope.loginErr = ''
    $rootScope.signupErr = ''
    $state.go('forms', {}, {reload: true})
  }
  $scope.reload =function() {
    $window.location.reload()
  }

})

.controller('FormsCtrl', function($scope, $http, $state, $rootScope, $window, $stateParams, Session, User, Qiniu) {
  $scope.reload =function() {
    $window.location.reload()
  }
  $scope.loginData = {email: "cf1@gmail.com", password: "191954"}
  $scope.signupData = {name:'cf1'}
  $rootScope.loginErr = ''
  $rootScope.signupErr = ''
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    var sess = new Session($scope.loginData)
    sess.$save(function(data) {
      console.log(data.token)
      if (data.token) {
        $window.localStorage.token = data.token
        $scope.currentUser = Boolean($window.localStorage.token)
        $http.defaults.headers.common['Authorization'] = "Token token=" + data.token
        console.log($window.localStorage.token)
        $state.go('tab.home', {}, {reload: true})
      } else {
        console.log(data.err)
        $rootScope.loginErr = data.err
      }
    })
  }
  $scope.getFile = function(f) {
    $scope.temfile = f
  }
  $scope.doSignup = function() {
    Qiniu.ngFileUp($scope.temfile).then(function (resp) {
      // console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data.key + JSON.stringify(resp.data))
      $scope.signupData.avatar = "http://7xj5ck.com1.z0.glb.clouddn.com/" + resp.data.key
      var user = new User($scope.signupData)
      user.$save(function(data) {
        if (data.token) {
          $window.localStorage.token = data.token
          $scope.currentUser = Boolean($window.localStorage.token)
          $http.defaults.headers.common['Authorization'] = "Token token=" + data.token
          console.log($window.localStorage.token)
          $state.go('tab.home', {}, {reload: true})
        } else {
          console.log(data.err)
          $rootScope.signupErr = data.err
        }
      })
    })
  }

})

.controller('HomeCtrl', function($scope, $http, $state, $rootScope, $window, $resource, Cafe ) {
  $scope.photos = []; $scope.page = 0; $scope.lastId = 0; $scope.limit = 5; $scope.dataLength = $scope.limit
  $scope.loadMore = function() {
    if ($scope.dataLength == $scope.limit){
      Cafe.get({id:0, page: $scope.page, lastId: $scope.lastId})
      .$promise.then(function(data) {
        console.log(JSON.stringify(data))
        $scope.dataLength = data.photos.length
        $scope.photos = $scope.photos.concat(data.photos)
        if ($scope.page == 0){$scope.user = data.user}
        if (data.photos.length == $scope.limit) {$scope.lastId = data.photos[$scope.limit-1].id}
        $scope.page += 1
        $scope.$broadcast('scroll.infiniteScrollComplete')
      })
      // $scope.$broadcast('scroll.infiniteScrollComplete')
    }
  }
  $scope.loadMore()
})

.controller('UphotoCtrl', function($scope, $http, $state, $rootScope, $window, Qiniu, Cafe) {
  $scope.cafe = {content:''}; $scope.temfiles = []
  $scope.listFiles = function(f) {
    $scope.temfiles.push(f) // console.log($scope.cafe.content)
  }
  $scope.refresh = function() {
    $state.go($state.current, {}, {reload: true})
  }
  $scope.upPhoto = function() {
    // $scope.temfiles.forEach(function(file) {
      Qiniu.ngFileUp($scope.temfiles[0]).then(function (resp) {
        // console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data.key + JSON.stringify(resp.data))
        // http://7xj5ck.com1.z0.glb.clouddn.com/2015-11-28T06%3A11%3A25.113Z
        $scope.cafe.key = resp.data.key
        var cafe = new Cafe($scope.cafe) //{key: resp.data.key, content: $scope.content})
        cafe.$save(function(data) {
          $state.go('tab.home', {}, {reload: true})
        })
      }, function (resp) {
        console.log('Error status: ' + resp.status)
      }, function (evt) {
        $scope.uppercent = parseInt(100.0 * evt.loaded / evt.total)
        // console.log('progress: ' + $scope.uppercent + '% ' + evt.config.data.file.name)
      })
  }
})

.controller('ChangeCtrl', function($scope, $http, $rootScope, $state, $window, $resource, Cafe) {
  $scope.photos = []; $scope.page = 0; $scope.lastId = 0; $scope.limit = 5; $scope.dataLength = $scope.limit
  $scope.loadMore = function() {
      Cafe.query({page: $scope.page, lastId: $scope.lastId})
      .$promise.then(function(data) {
        console.log(JSON.stringify(data))
        $scope.photos = $scope.photos.concat(data)
        $scope.page += 1
        $scope.$broadcast('scroll.infiniteScrollComplete')
      })
  }

})

.controller('UsersIdCtrl', function($scope, $http, $state, $rootScope, $stateParams, $window, $resource, Cafe) {
  $scope.photos = []; $scope.page = 0; $scope.lastId = 0; $scope.limit = 5; $scope.dataLength = $scope.limit
  $scope.loadMore = function() {
    if ($scope.dataLength == $scope.limit){
      Cafe.get({id:$stateParams.id, page: $scope.page, lastId: $scope.lastId})
      .$promise.then(function(data) {
        console.log(JSON.stringify(data))
        $scope.dataLength = data.photos.length
        $scope.photos = $scope.photos.concat(data.photos)
        if ($scope.page == 0){$scope.user = data.user}
        if (data.photos.length == $scope.limit) {$scope.lastId = data.photos[$scope.limit-1].id}
        $scope.page += 1
        $scope.$broadcast('scroll.infiniteScrollComplete')
      })
      // $scope.$broadcast('scroll.infiniteScrollComplete')
    }
  }
  $scope.loadMore()

})

.controller('MessageCtrl', function($scope, $http, $rootScope,$cordovaCamera,$cordovaCapture, $cordovaImagePicker,$resource,$cordovaInAppBrowser) {

})

.controller('AccountCtrl', function($scope,$http,$cordovaCamera,$cordovaCapture) {

})
