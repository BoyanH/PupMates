app.factory("ShDirDialog", function(){
	var dirName = "";
	return{
		name: dirName,
		setName: function(n){
			dirName = n;
		}
	}
});