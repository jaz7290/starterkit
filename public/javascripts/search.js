var searchApp = angular.module('archiveSearch', []);

function mainController($scope, $http) {
	$scope.formData ={};
	$scope.article = null;
	// when submitting the add form, send the text to the node API
	$scope.createTodo = function() {
		$http.post('/api/todos', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.todos = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a todo after checking it
	$scope.hello = function(id) {
		$http.get('/document/'+id)
			.success(function(data) {
				$scope.article = data;
				console.log(data);
			})
			.error(function(data) {
				$scope.article = {};
				console.log('Error: ' + data);
			});
	};

}
