angular.module('app')
.directive('atDateInput', [ 'dateFilter', function(dateFilter) {
    return {
        require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl) {
            function parseDate(value) {
                var date = ngModelCtrl.$isEmpty(value) ? undefined : Date.parse(value);
                return date || undefined;
            }
            function formatDate(value) {
                return ngModelCtrl.$isEmpty(value) ? '' : dateFilter(value, 'dd.MM.yyyy');
            }
            ngModelCtrl.$parsers.push(parseDate);
            ngModelCtrl.$formatters.push(formatDate);
        }
    };
}]);