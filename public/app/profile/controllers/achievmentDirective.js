app.directive('profileAchievments', function() {
  return {
    restrict: 'E',
    scope: {
      user: '=',
      identity: '='
    },
    replace: true, // Replace with the template below
    controller: "AchievmentController",
    templateUrl: "partials/profile/achievments"
  };
});