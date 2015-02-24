app.directive('profileAchievments', function() {
  return {
    restrict: 'EA',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    controller: "AchievmentController",
    templateUrl: "partials/profile/achievments"
  };
});