app.directive('profileAchievments', function() {
  return {
    restrict: 'E',
    scope: {
      user: '='
    },
    replace: true, // Replace with the template below
    controller: "AchievmentController",
    templateUrl: "partials/profile/achievments"
  };
});