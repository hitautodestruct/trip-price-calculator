jQuery(function ( $ ) {

//    var origin1 = new google.maps.LatLng(55.930385, -3.118425);
var directionsDisplay, map;
var directionsService = new google.maps.DirectionsService();

function calc_route(start,end) {
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  
  var mapOptions = {
    center: new google.maps.LatLng(55.930385, -3.118425),
    zoom: 13
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  directionsDisplay.setMap(map);

  var input_from = document.getElementById('from');
  var input_to = document.getElementById('to');

  var autocomplete_from = new google.maps.places.Autocomplete(input_from);
  var autocomplete_to = new google.maps.places.Autocomplete(input_to);
  
  autocomplete_from.bindTo('bounds', map);
  autocomplete_to.bindTo('bounds', map);

  var marker_from = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  var marker_to = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(55.930385, -3.118425)
  });

}

google.maps.event.addDomListener(window, 'load', initialize);

  var calculateTripPrice = function ( event ) {

    event.preventDefault();
    
    var service = new google.maps.DistanceMatrixService(),
        origin = $('#from').val(),
        destination = $('#to').val();
    
    if ( origin !== '' && destination !== '' ){
    
      service.getDistanceMatrix({
          origins: [ origin ],
          destinations: [ destination ],
          travelMode: google.maps.TravelMode.DRIVING,
          //durationInTraffic: true,
          avoidHighways: false,
          avoidTolls: false
        }, callback);

      calc_route( origin, destination );
  
      function callback(response, status) {
          
        var query = {
            url: 'http://energy.gov.il/Subjects/Fuel/Pages/GxmsMniPricesAndTaxes.aspx',
            type: 'html',
            selector: '.ms-rteTableOddCol-default',
            extract: 'text'
          },
          distanceData = response.rows[0].elements[0],
          distance = distanceData.distance.value / 1000,
          average = 14,
          request;
        
        request = 'https://trip-price-calculator.now.sh/?q=' +
                encodeURIComponent(JSON.stringify(query)) +
                '&callback=?';
        
        jQuery.getJSON(request, function (data) {
          
          var fuelPrice = parseFloat(data[0].results[0]) || 5.96;
          
          var trip_price = Math.round( (distance / average) * fuelPrice );

          var list = [
              'Distance: ' + distanceData.distance.text,
              'Average Km/L: ' + average,
              'Fuel Price (Per Liter): '+ fuelPrice,
              'Estimated drive time: ' + distanceData.duration.text,
              'Estimated Price (one way): <mark class="currency">'+ trip_price +'</mark>',
              'Est. Price (there and back): <mark class="currency">'+ trip_price * 2 +'</mark>'
          ];
          
          list = list.map(function(item){ return '<tr><td>' + item + '</td></tr>'; });
          list.unshift('<table class="table table-striped">');
          list.push('</table>');
          
          $('#result').html( list.join('') );
        });
        
      }
    }
    
  };
  
  $('#calculate').click( calculateTripPrice );
  
});
