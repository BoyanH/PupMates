app.directive("draggableChatDir", function(){
	return{
		restrict: "EA",
		replace: true,
		transclude: true,
		templateUrl: "partials/directives/draggableChat",
		controller: 'ChatDirController',
		link: function (scope) {

			scope.discussions = [];

			scope.addNewDiscussion = function (recipient) {

				var newDiscussion = {
						messages: [],
						recipient: recipient
					},
					exists = false;

				for (var i = 0; i < scope.discussions.length; i++) {
					
					if (scope.discussions[i].recipient._id == recipient._id) {

						exists = true;
						break;
					}
				};

				if(!exists) {
					
					scope.discussions.push(newDiscussion);
				}

			}

			//DRAGABLE TO ANYWHERE ON SCREEN
			scope.drag_start = function(element, event) {
				console.log('drag start');
			    var style = window.getComputedStyle(element, null);

			    event.dataTransfer.setData("text/plain",
			    (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + 
			    (parseInt(style.getPropertyValue("top"),10) - event.clientY) + ',' + element.id);
			} 
			function drag_over(event) { 
			    event.preventDefault(); 
			    return false; 
			} 
			function drop(event) {

				console.log(event.dataTransfer.getData("text/plain").split(','));

			    var offset = event.dataTransfer.getData("text/plain").split(','),
			    	id = offset.pop(),
			    	dm = document.getElementById(id);

			    console.log(id);

			    dm.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
			    dm.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
			    event.preventDefault();
			    return false;
			} 

			document.body.addEventListener('dragover',drag_over,false); 
			document.body.addEventListener('drop',drop,false);

			//END OF DRAGABLE SETTING
		}
			
	}
})