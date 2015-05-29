'use strict';

// Authors controller
angular.module('authors').controller('AuthorsController', ['$scope', '$http', '$modal', '$stateParams', '$location', 'Authentication', 'Authors', 
    function($scope, $http, $modal, $stateParams, $location, Authentication, Authors) {
        
        $scope.authentication = Authentication;
        $scope.state = 'notmatched';
        $scope.order = 'idSource';
        $scope.page = 1;
        $scope.animationsEnabled = true;
        $scope.selectedState = '';

        $scope.inputState = [
            {
                value: 'matched',
                label: 'Matched'
            },
            {
                value: 'notmatched',
                label: 'Not matched'
            },
            {
                value: 'dismissed',
                label: 'Dismissed'
            }
        ];

        // Create new Author
        $scope.create = function() {
            // Create new Author object
            var author = new Authors({
                prefered: this.prefered,
                date: this.date,
                dateName: this.dateName,
                names: this.names,
                viaf: this.viaf
            });

            // Redirect after save
            author.$save(function(response) {
                $location.path('authors/' + response._id);

                // Clear form fields
                //$scope.name = '';
                //$scope.viaf = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Author
        $scope.remove = function(author) {
            if (author) {
                author.$remove();

                for (var i in $scope.authors) {
                    if ($scope.authors[i] === author) {
                        $scope.authors.splice(i, 1);
                    }
                }
            } else {
                $scope.author.$remove(function() {
                    $location.path('authors');
                });
            }
        };

        // Update existing Author
        $scope.update = function() {
            var author = $scope.author;

            if($scope.selectedState !== ''){
                author.state = $scope.selectedState;
            }
           
            author.$update(function() {
                $location.path('authors/' + author._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Authors
        $scope.find = function() {
            $scope.authors = Authors.query();
        };

        // Find a list of Authors paginated
        $scope.selectPage = function(page) {
            $scope.page = page;
            $scope.authors = Authors.query({p:page, text:$scope.ftext, state:$scope.state, order:$scope.order});
        };

        // Find a list of Authors
        $scope.search = function() {
            $scope.authors = Authors.query({p:$scope.page, text:$scope.ftext, state:$scope.state, order:$scope.order});
        };

        // Find existing Author
        $scope.findOne = function() {
            $scope.author = Authors.get({
                authorId: $stateParams.authorId
            });
        };

        $scope.openViafTab = function(id) {
            $scope.url = 'http://www.viaf.org/' + id;
        };

        $scope.openSearchViafTab = function(name) {
            $scope.url = 'http://www.viaf.org/viaf/search?query=cql.any+all+%22'+ name +'%22&sortKeys=holdingscount&recordSchema=BriefVIAF';
        };

        $scope.setState = function(state) {
            $scope.state = state;
            $scope.authors = Authors.query({p:$scope.page, text:$scope.ftext, state:$scope.state, order:$scope.order});
        };

        $scope.setOrder = function(order) {
            $scope.order = order;
            $scope.authors = Authors.query({p:$scope.page, text:$scope.ftext, state:$scope.state, order:$scope.order});
        };

        $scope.open = function (title, size, id) {

            $scope.items = [];
            $scope.results = [];
            $http.get('http://crossorigin.me/http://viaf.org/viaf/search?query=cql.any+all+%22' + title + '%22&httpAccept=application/xml').success(function (data) {
                var x2js = new X2JS();
                var json = x2js.xml_str2json(data);

                var i = 0;
                var j = 0;
                var k = 0;
                var l = 0;

                $scope.results = {};
                var authors = [];
                $scope.results.authors = authors;
                
                if(json.searchRetrieveResponse && json.searchRetrieveResponse.records){

                    for (i = 0; i < x2js.asArray(json.searchRetrieveResponse.records.record).length; i++) {

                        var cluster = x2js.asArray(json.searchRetrieveResponse.records.record)[i].recordData.VIAFCluster;
                            
                        if(cluster.nameType.__text === 'Personal' || cluster.nameType.__text === 'Corporate'){
                            var names = [];
                            var ns = {};

                            if(cluster.mainHeadings.data.length){
                                for(j = 0; j < cluster.mainHeadings.data.length; j++){

                                    ns = {
                                        'name': cluster.mainHeadings.data[j].text
                                    };
                                    names.push(ns);
                                }
                            }else{
                                ns = {
                                    'name': cluster.mainHeadings.data.text
                                };
                                names.push(ns);
			    }

                            var author = {
                                'viafid': cluster.viafID.__text,
                                'source': cluster.sources.source
                            };
                            author.names = names;
                        
                            $scope.results.authors.push(author);
                        }
                    }
                } // if response results

                var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'viafModalContent.html',
                        controller: 'ModalInstanceCtrl',
                        size: size,
                        resolve: {
                            title: function () {
                                return title;
                            },
                            id: function () {
                                return id;
                            },
                            results: function () {
                                return $scope.results;
                            }
                        }
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                        
                        var author = null;
                        if(selectedItem === 'dismiss'){
                            // Update Author object
                            author = new Authors({
                                _id: id,
                                state: 'dismissed'
                            });

                            author.$update(function() {
                                $location.path('authors/' + author._id);
                                $scope.selected = '';
                            }, function(errorResponse) {
                                $scope.error = errorResponse.data.message;
                            });
                        }else if(selectedItem){
                            // Update Author object
                            author = new Authors({
                                _id: id,
                                viaf: $scope.selected.viafid,
                                state: 'matched'
                            });

                            author.$update(function() {
                                $location.path('authors/' + author._id);
                                $scope.selected = '';
                            }, function(errorResponse) {
                                $scope.error = errorResponse.data.message;
                            });
                        }
                    }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                });

            }); // end get
        }; // scope open

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };
    }
]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('authors').controller('ModalInstanceCtrl', function ($scope, $modalInstance, title, id, results) {

    $scope.results = results;
    if($scope.results){
        $scope.selected = {
            item: ''//$scope.items[0]
        };
    }
    $scope.title = title;
    $scope.id = id;
    //$scope.results = results;

    $scope.ok = function () {

        if($scope.selected !== null)
            $modalInstance.close($scope.selected.item);
        else
            $modalInstance.close(null);
    };

    $scope.dismiss = function () {
        $modalInstance.close('dismiss');
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.setValue = function(item){
        $scope.selected = item;
    };
});


