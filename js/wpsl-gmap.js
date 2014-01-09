jQuery( document ).ready( function( $ ) { 
var geocoder, map, infowindow, directionsDisplay, directionsService, 
	markersArray = [],
	$selects = $( "#wpsl-search-wrap select" );

/* Load Google Maps */
function initializeGmap() {
    var myOptions, zoomControlPosition, zoomControlStyle,
		latLng, zoomTo, zoomLevel, mapType,
		streetViewVisible = ( wpslSettings.streetView == 1 ) ? true : false;

    /* If no zoom location is defined, we show the entire world */	
    if ( wpslSettings.zoomLatlng !== '' ) {
		latLng = wpslSettings.zoomLatlng.split( ',' );
		zoomTo = new google.maps.LatLng( latLng[0], latLng[1] );
		zoomLevel = parseInt( wpslSettings.zoomLevel );
    } else {
		zoomTo = new google.maps.LatLng( 0,0 );
		zoomLevel = 1;
    }

    geocoder = new google.maps.Geocoder();
    infowindow = new google.maps.InfoWindow({
		pixelOffset: new google.maps.Size( -12,0 ) //make the offset equal to the marker anchor, line 387
	});
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();

    /* Set correct the position of the controls */		
    if ( wpslSettings.controlPosition == "right" ) {
		zoomControlPosition = google.maps.ControlPosition.RIGHT_TOP
    } else {
		zoomControlPosition = google.maps.ControlPosition.LEFT_TOP
    }

    /* Set correct control style */	
    if ( wpslSettings.controlStyle == "small" ) {
		zoomControlStyle = google.maps.ZoomControlStyle.SMALL
	} else {
		zoomControlStyle = google.maps.ZoomControlStyle.LARGE
    }

    /* Set the selected map type */
    switch ( wpslSettings.mapType ) {
		case "roadmap":
		  mapType = google.maps.MapTypeId.ROADMAP
		  break;
		case "satellite":
		  mapType = google.maps.MapTypeId.SATELLITE
		  break;
		case "hybrid":
		  mapType = google.maps.MapTypeId.HYBRID
		  break;
		case "terrain":
		  mapType = google.maps.MapTypeId.TERRAIN
		  break;		  
		default:
		  mapType = google.maps.MapTypeId.ROADMAP
    }

    myOptions = {
		zoom: zoomLevel,
		center: zoomTo,
		mapTypeId: mapType,
		panControl: false,
		streetViewControl: streetViewVisible,
			zoomControlOptions: {
				style: zoomControlStyle,
				position: zoomControlPosition
			}
	};

    map = new google.maps.Map( document.getElementById( "wpsl-gmap" ), myOptions );

    /* Check if we need to try and autolocate the user */
    if ( wpslSettings.autoLocate == 1 ) {
		checkGeolocation();
    }
	
	/* Style the dropdown menu */
	$selects.easyDropDown({
		cutOff: 10,
		wrapperClass: "wpsl-dropdown"
	});
}

/* Check if Geolocation is supported */
function checkGeolocation() {
    if ( navigator.geolocation ) {
		navigator.geolocation.getCurrentPosition( handleGeolocationQuery );
    }
};

function handleGeolocationQuery( position ) {  
    var storeId = 0, 
		storeName = "", 
		draggable = true,
		latLng = new google.maps.LatLng( position.coords.latitude, position.coords.longitude );
	
	reverseGeocode( latLng ); //set the zipcode that belongs to the latlng in the input field
	map.setCenter( latLng );
	addMarker( latLng, storeId, storeName, draggable );
	findStoreLocations( latLng );
};

/* Handle clicks on the search button */
$( "#wpsl-search-btn" ).on( "click", function() {
    $( "#wpsl-result-list ul" ).empty();
    $( "#wpsl-stores" ).show();
    $( ".wpsl-direction-before, .wpsl-direction-after" ).remove();
    $( "#wpsl-direction-details" ).hide();

    deleteOverlays();
    codeAddress();
});
						
/* Handle the click on the back button when the route directions are displayed */
$( "#wpsl-result-list" ).on( "click", ".wpsl-back", function() {	
	var i, len;

    /* Remove the directions from the map */
    directionsDisplay.setMap( null );

    /* Restore all markers on the map */
    for ( i = 0, len = markersArray.length; i < len; i++ ) {
		markersArray[i].setMap( map );
    }

    fitBounds();
	
    /* After the markers are restored, the direction link has lost it's click handler. So we reinstate it. */
	$( ".wpsl-info-window" ).on( "click", ".wpsl-directions", function() {	
		renderDirections( $(this) );
		return false;
	});
   
    $( ".wpsl-direction-before, .wpsl-direction-after" ).remove();
    $( "#wpsl-stores" ).show();
    $( "#wpsl-direction-details" ).hide();

    return false;
});

function renderDirections( e ) {
    var i, start, end, len, storeId;
    
    /* 
    The storeId is placed on the li in the results list, 
    but in the marker it will be on the wrapper div. So we check which one we need to target
    */
    if ( e.parent( "li" ).length > 0 ) {
		storeId = e.parent( "li" ).data( "store-id" );
    } else {
		storeId = e.parent( ".wpsl-info-window" ).data( "store-id" );
    }
    
    /* Find the latlng that belongs to the start and end point */
    for ( i = 0, len = markersArray.length; i < len; i++ ) {
		if ( markersArray[i].storeId == 0 ) {
			 start = markersArray[i].getPosition();
		} else if ( markersArray[i].storeId == storeId ) {
			 end = markersArray[i].getPosition();
		}
    }

    if ( start && end ) {
		$( "#wpsl-direction-details ul" ).empty();
		$( ".wpsl-direction-before, .wpsl-direction-after" ).remove();
		calcRoute( start, end );
    } else {
		alert( wpslLabels.generalError );
    } 
}

/* Check if we need to enable the bouncing of markers when the user hovers over the result list */
if ( wpslSettings.markerBounce == 1 ) {
    $( "#wpsl-stores" ).on( "mouseenter", "li", function() {
		letsBounce( $(this).data( "store-id" ), "start" );
    });
	
    $( "#wpsl-stores" ).on( "mouseleave", "li", function() {	
		letsBounce( $(this).data( "store-id" ), "stop" );
    });
}

/* Let a single marker bounce */
function letsBounce( storeId, status ) {
    var storeId, status, i, len, animation = '';

    if ( status == "start" ) {
		animation = google.maps.Animation.BOUNCE		
    } else {
		animation = null;	
    }

    /* Find the correct marker to bounce based on the storeId */
    for ( i = 0, len = markersArray.length; i < len; i++ ) {
		if ( markersArray[i].storeId == storeId ) {
			marker = markersArray[i];
			marker.setAnimation( animation );
		}
    }	
}

/* Show the directions on the map */
function calcRoute( start, end ) {
    var legs, len, step, index, direction, i, j,
		directionStops = "",    
		request = {
			origin: start,
			destination: end,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};

    directionsService.route( request, function( response, status ) {
		if ( status == google.maps.DirectionsStatus.OK ) {
			directionsDisplay.setMap( map );
			directionsDisplay.setDirections( response );

			if ( response.routes.length > 0 ) {
				direction = response.routes[0];

				/* Loop over the legs and steps of the directions */
				for ( i = 0; i < direction.legs.length; i++ ) {
					legs = direction.legs[i];

					for ( j = 0, len = legs.steps.length; j < len; j++ ) {
						step = legs.steps[j];
						index = j+1;
						directionStops = directionStops + "<li><div class='wpsl-direction-index'>" + index + "</div><div class='wpsl-direction-txt'>" + step.instructions + "</div><div class='wpsl-direction-distance'>" + step.distance.text + "</div></li>";
					}
				}

				$( "#wpsl-direction-details ul" ).append( directionStops ).before( "<p class='wpsl-direction-before'><a class='wpsl-back' href='#'>Back</a>" + direction.legs[0].distance.text + " - " + direction.legs[0].duration.text + "</p>" ).after( "<p class='wpsl-direction-after'>" + response.routes[0].copyrights + "</p>" );
				$( "#wpsl-direction-details" ).show();

				/* Remove all other markers from the map */
				for ( i = 0, len = markersArray.length; i < len; i++ ) {
					markersArray[i].setMap( null );
				}

				$( "#wpsl-stores" ).hide();		
			}
		}
    });
}

/* Geocode the user input */ 
function codeAddress() {
    var latLng, storeId, storeName, 
		address = $( "#wpsl-search-input" ).val();
		
    geocoder.geocode( { 'address': address}, function( response, status ) {
		if ( status == google.maps.GeocoderStatus.OK ) {			
			latLng = response[0].geometry.location;
			
			/* Remove any previous markers and add a new one */
			deleteOverlays();
			addMarker( latLng, storeId = 0, storeName = "", draggable = true );

			/* Try to find stores that match the radius, location criteria */
			findStoreLocations( latLng );
		} else {
			geocodeNotification( status );
		}
    }
)};

/* Geocode the user input and set the returned zipcode in the input field */ 
function reverseGeocode( latLng ) {
    var latLng, zipCode;
		
    geocoder.geocode( {'latLng': latLng}, function( response, status ) {
		if ( status == google.maps.GeocoderStatus.OK ) {
			zipCode = filterApiResponse( response );	

			if ( zipCode !== "" ) {
				$( "#wpsl-search-input" ).val( zipCode );
			}
		} else {
			geocodeNotification( status );
		}
    }
)};

/* Filter out the zipcode from the response */
function filterApiResponse( response ) {
    var zipcode, responseType,
		addressLength = response[0].address_components.length;

    /* Loop over the API response */
    for ( i = 0; i < addressLength; i++ ){
		responseType = response[0].address_components[i].types;

		/* filter out the postcode */
		if ( ( /^postal_code$/.test( responseType ) ) || ( /^postal_code_prefix,postal_code$/.test( responseType ) ) ) {
			zipcode = response[0].address_components[i].long_name;
		}
    }

    return zipcode;
}

function findStoreLocations( startLatLng ) {		
    var location,
		center = map.getCenter(),
		infoWindowData = {},
		storeData = "",
		draggable = false,
		$storeList = $( "#wpsl-stores ul" ),
		preloader = wpslSettings.path + "img/ajax-loader.gif",
		ajaxData = {
			action: "store_search",
			lat: startLatLng.lat(),
			lng: startLatLng.lng(),
			max_results: $( "#wpsl-results select" ).val(),
			radius: $( "#wpsl-radius select" ).val()
		};
	
	/* Add the preloader */
	$storeList.empty().append( "<li class='wpsl-preloader'><img src='" + preloader + "'/><span>" + wpslLabels.preloader + "</span></li>" );
		
	$.get( wpslSettings.ajaxurl, ajaxData, function( response ) {	

	    /* Remove the preloaders and no results msg */		
	    $( ".wpsl-preloader, .no-results" ).remove();

	    if ( response.success !== false ) {
			if ( response.length > 0 ) {
				$.each( response, function( index ) {
					infoWindowData = {
						store: response[index].store,
						street: response[index].street,
						city: response[index].city,
						state: response[index].state,
						zip: response[index].zip,
						description: response[index].description,
						phone: response[index].phone,
						fax: response[index].fax,
						url: response[index].url,
						email: response[index].email,
						hours: response[index].hours,
						thumb: response[index].thumb
					};

					location = new google.maps.LatLng( response[index].lat, response[index].lng );	
					addMarker( location, response[index].id, infoWindowData, draggable );	
					storeData = storeData + storeHtml( response[index] );					
				});
				
				$( "#wpsl-result-list" ).off( "click", ".wpsl-directions" );
				$storeList.append( storeData );
				
				$( "#wpsl-result-list" ).on( "click", ".wpsl-directions", function() {	
					renderDirections( $(this) );
					return false;
				});

			} else {
				$storeList.html( "<li class='no-results'>" + wpslLabels.noResults + "</li>" );
			}
			
			fitBounds();
	    } else {
			alert( wpslLabels.generalError );
	    }
	});
}

/* Add a new marker to the map based on the provided location (latlng) */
function addMarker( location, storeId, infoWindowData, draggable ) {
	var markerPath, mapIcon;
	
	if ( storeId === 0 ) {
		markerPath = wpslSettings.path + "img/markers/" + wpslSettings.startMarker;
	} else {
		markerPath = wpslSettings.path + "img/markers/" + wpslSettings.storeMarker;
	}
	
	var mapIcon = {
		url: markerPath,
		size: new google.maps.Size( 48,70 ), //original format
		scaledSize: new google.maps.Size( 24,35 ), //retina format
		origin: new google.maps.Point( 0,0 ),  
		anchor: new google.maps.Point( 12,35 )
	};
	
    var infoWindowContent,
		marker = new google.maps.Marker({
			position: location,
			map: map,
			optimized: false, //fixes markers flashing while bouncing
			title: infoWindowData.store,
			draggable: draggable,
			storeId: storeId,
			icon: mapIcon
		});	

    google.maps.event.addListener( marker, "click", function() {
		if ( storeId != 0 ) {
			infoWindowContent = createInfoWindowHtml( infoWindowData, storeId );
			infowindow.setContent( infoWindowContent );
		} else {
			infowindow.setContent( wpslLabels.startPoint ); //setting van maken
		}	
		infowindow.open( map, marker );
		
		//pixelOffset: new google.maps.Size(0, 60)
		
		$( ".wpsl-info-window" ).on( "click", ".wpsl-directions", function() {	
			renderDirections( $(this) );
			return false;
		});
    });

    /* Store the marker for later use */
    markersArray.push( marker );
	
	if ( draggable ) {
		google.maps.event.addListener( marker, "dragend", function( event ) { 
			map.setCenter( event.latLng );
			reverseGeocode( event.latLng );
			findStoreLocations( event.latLng );
		}); 
    }
}

/* Create the data for the infowindows on Google Maps */
function createInfoWindowHtml( infoWindowData, storeId ) {
    var storeHeader,
		windowContent = "<div data-store-id='" + storeId + "' class='wpsl-info-window'>";
    
    /* Check if we need to turn the store name into a link or not */
    if ( ( typeof( infoWindowData.url ) !== "undefined" ) && ( infoWindowData.url !== "" ) ) {
		storeHeader = "<a href='" + infoWindowData.url + "'><strong>" + infoWindowData.store + "</strong></a>";
    } else {
		storeHeader = "<strong>" + infoWindowData.store + "</strong>";
    }

    windowContent += "<p>" + storeHeader + "<span>" + infoWindowData.street + "</span><span>" + infoWindowData.city + "</span></p>";

    if ( ( typeof( infoWindowData.description ) !== "undefined" ) && ( infoWindowData.description !== "" ) ) {
		windowContent += "<p>" + infoWindowData.description + "</p>";
    }

    /* If no data exist for either the phone / fax / email then just don't show them */
    if ( ( typeof( infoWindowData.phone ) !== "undefined" ) && ( infoWindowData.phone !== "" ) ) {
		windowContent += "<span><strong>" + wpslLabels.phone + "</strong>: " + infoWindowData.phone + "</span>";
    }

    if ( ( typeof( infoWindowData.fax ) !== "undefined" ) && ( infoWindowData.fax !== "" ) ) {
		windowContent += "<span><strong>" + wpslLabels.fax + "</strong>: " + infoWindowData.fax + "</span>";
    }

    if ( ( typeof( infoWindowData.email ) !== "undefined" ) && ( infoWindowData.email !== "" ) ) {
		windowContent += "<span><strong>Email</strong>: " + infoWindowData.email + "</span>";
    }
	
	if ( ( typeof( infoWindowData.hours ) !== "undefined" ) && ( infoWindowData.hours !== "" ) ) {
		windowContent += "<div class='wpsl-store-hours'><strong>" + wpslLabels.hours + "</strong> " + infoWindowData.hours + "</div>";
    }

    windowContent += "<a class='wpsl-directions' href='#'>" + wpslLabels.directions + "</a>";
    windowContent += "</div>";

    return windowContent;
}

function storeHtml( response ) {
	var html, storeImg = "",
		id = response.id,
		store = response.store,
		street = response.street, 
		city = response.city,
		state = response.state, 
		zip = response.zip,
		thumb = response.thumb,
		country = response.country,
		distance = parseFloat( response.distance ).toFixed(1) + " " + wpslSettings.distanceUnit;

		if ( ( typeof( thumb ) !== "undefined" ) && ( thumb !== "" ) ) {
			storeImg = "<img class='wpsl-store-thumb' src='" + thumb + "' width='48' height='48'  alt='" + store + "' />";
		}

		html = "<li data-store-id='" + id + "'><div><p>" + storeImg + "<strong>" + store + "</strong><span class='wpsl-street'>" + street + "</span>"  + city + " " + state + " " + zip + "<span class='wpsl-country'>" + country + "</p></div>" + distance + "<a class='wpsl-directions' href='#'>" + wpslLabels.directions + "</a></li>";

	return html;
}

/* Zoom the map so that all markers fit in the window */
function fitBounds() {
    var i, markerLen, 
		maxZoom = 12,
		bounds = new google.maps.LatLngBounds();

    /* Make sure we don't zoom to far */
    google.maps.event.addListenerOnce( map, "bounds_changed", function( event ) {
		if ( this.getZoom() > maxZoom ) {
			this.setZoom( maxZoom );
		}
    });

    for ( i = 0, markerLen = markersArray.length; i < markerLen; i++ ) {
		bounds.extend ( markersArray[i].position );
    }

    map.fitBounds( bounds );
}

/* Remove all existing markers and route lines from the map */
function deleteOverlays() {
    directionsDisplay.setMap( null );

    /* Remove all the markers from the map, and empty the array */
    if ( markersArray ) {
		for ( i = 0, markerLen = markersArray.length; i < markerLen; i++ ) {
			markersArray[i].setMap( null );
		}

		markersArray.length = 0;
    }
}

/* Handle the geocode errors */
function geocodeNotification( status ) {
    var msg;

    switch ( status ) {
		case "ZERO_RESULTS":
			msg = wpslLabels.noResults;
			break;	
		case "OVER_QUERY_LIMIT":
			msg = wpslLabels.queryLimit;
			break;	
		default:
			msg = wpslLabels.generalError;
			break;
    }

    alert( msg );	
}

/* Trigger the search when the user presses "enter" on the keyboard */
$( "#wpsl-search-input" ).keydown( function ( event ) {
    var keypressed = event.keyCode || event.which;
    if ( keypressed == 13 ) {
		$( "#wpsl-search-btn" ).trigger( "click" );
    }
});

if ( $("#wpsl-gmap").length ) {
    google.maps.event.addDomListener( window, "load", initializeGmap );
}

});