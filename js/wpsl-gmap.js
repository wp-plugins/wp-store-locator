jQuery( document ).ready( function( $ ) { 
var geocoder, map, infowindow, directionsDisplay, directionsService, geolocationLatlng,
	markersArray = [],
	mapDefaults = {},
	resetMap = false,
	startMarkerData,
	startAddress,
	startLatLng,
	autoLoad = wpslSettings.autoLoad,
	$selects = $( "#wpsl-search-wrap select" );

/* Load Google Maps */
function initializeGmap() {
    var myOptions, zoomControlPosition, zoomControlStyle,
		latLng, zoomLevel, mapType,
		streetViewVisible = ( wpslSettings.streetView == 1 ) ? true : false;

    /* If no zoom location is defined, we show the entire world */	
    if ( wpslSettings.zoomLatlng !== '' ) {
		latLng = wpslSettings.zoomLatlng.split( ',' );
		startLatLng = new google.maps.LatLng( latLng[0], latLng[1] );
		zoomLevel = parseInt( wpslSettings.zoomLevel );
    } else {
		startLatLng = new google.maps.LatLng( 0,0 );
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
		center: startLatLng,
		mapTypeId: mapType,
		mapTypeControl: false,
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
    } else {
		showStores();
	}
					
	/* Move the mousecursor to the store search field if the focus option is enabled */
	if ( wpslSettings.mouseFocus == 1 ) {
		$( "#wpsl-search-input" ).focus();
	}
		
	/* Style the dropdown menu */
	$selects.easyDropDown({
		cutOff: 10,
		wrapperClass: "wpsl-dropdown"
	});
}

function showStores() {
	var startMarker = {
			store: wpslLabels.startPoint
		};
	
	addMarker( startLatLng, 0, startMarker, true ); // This marker is the 'start location' marker. With a storeId of 0, no name and is draggable
	findStoreLocations( startLatLng, resetMap, autoLoad );
}

/* Check if Geolocation detection is supported. If there is an error / timeout with determining the users 
 * location we use the 'start point' value from the settings as the start location through the showStores function. 
 */
function checkGeolocation() {
	if ( navigator.geolocation ) {
		var keepStartMarker = false,
			locationTimeout = setTimeout( showStores, 3000 );

		navigator.geolocation.getCurrentPosition( function( position ) {
			clearTimeout( locationTimeout );
			
			/* If the timeout is triggerd, and the user later decides to enable the gelocation detection, 
			 * it gets messy with multiple start markers. So we first clear the map before adding new ones.
			 */
			deleteOverlays( keepStartMarker ); 
			handleGeolocationQuery( position, resetMap );
		}, function( error ) {
			clearTimeout( locationTimeout );
			showStores();
		});
	} else {
		showStores();
	}
};

function handleGeolocationQuery( position, resetMap ) {  
	if ( typeof( position ) === "undefined" ) {
		showStores();
	 } else {
		var latLng = new google.maps.LatLng( position.coords.latitude, position.coords.longitude );

		/* Store the latlng from the geolocation for when the user hits "reset" again 
		 * without having to ask for permission again
		 */
		geolocationLatlng = position;

		reverseGeocode( latLng ); // Set the zipcode that belongs to the latlng in the input field
		map.setCenter( latLng );
		addMarker( latLng, 0, '', true ); // This marker is the 'start location' marker. With a storeId of 0, no name and is draggable
		findStoreLocations( latLng, resetMap, autoLoad );
	}
};

/* Handle clicks on the search button */
$( "#wpsl-search-btn" ).on( "click", function() {
	var keepStartMarker = false;
	$( "#wpsl-search-input" ).removeClass();
	
	if ( !$( "#wpsl-search-input" ).val() ) {
		$( "#wpsl-search-input" ).addClass( 'wpsl-error' ).focus();
	} else {
		$( "#wpsl-result-list ul" ).empty();
		$( "#wpsl-stores" ).show();
		$( ".wpsl-direction-before, .wpsl-direction-after" ).remove();
		$( "#wpsl-direction-details" ).hide();
		resetMap = false;
		deleteOverlays( keepStartMarker );
		deleteStartMarker();
		codeAddress();
	}
});

/* Reset the map */
$( "#wpsl-reset-map" ).on( "click", function() {
	var keepStartMarker = false,
		resetMap = true;

	/* When the start marker is dragged the autoload value is set to false. 
	 * So we need to check the correct value when the reset button is pushed before reloading the stores. 
	 */
	if ( wpslSettings.autoLoad == 1) {
		autoLoad = 1;
	}	
	
	/* Check if the latlng or zoom has changed since pageload, if so there is something to reset */
	if ( ( ( ( map.getCenter().lat() !== mapDefaults.centerLatlng.lat() ) || ( map.getCenter().lng() !== mapDefaults.centerLatlng.lng() ) || ( map.getZoom() !== mapDefaults.zoomLevel ) ) ) ) {
		deleteOverlays( keepStartMarker );
		$( "#wpsl-search-input" ).val('').removeClass();
		
		/* Remove the start marker */
		deleteStartMarker();

		/* Reset the dropdown values */
		resetDropdowns();

		if ( wpslSettings.autoLocate == 1 ) {
			handleGeolocationQuery( geolocationLatlng, resetMap );
		} else {
			showStores();
		}		
	}
	
	$( "#wpsl-stores" ).show();
    $( "#wpsl-direction-details" ).hide();
});

/* Remove the start marker from the map and empty the var */
function deleteStartMarker() {
	if ( ( typeof( startMarkerData ) !== "undefined" )  && ( startMarkerData !== "" ) ) {
		startMarkerData.setMap( null );
		startMarkerData = '';
	}
}

/* Reset the dropdown values after the "reset" button is triggerd */
function resetDropdowns() {
	var i, arrayLength,
		defaultValues = [wpslSettings.searchRadius + ' ' + wpslSettings.distanceUnit, wpslSettings.maxResults],
		dropdowns = ["wpsl-radius", "wpsl-results"];
	
	for ( i = 0, arrayLength = dropdowns.length; i < arrayLength; i++ ) {
	  	$( "#" + dropdowns[i] + " .selected" ).html( defaultValues[i] );
		$( "#" + dropdowns[i] + " li" ).removeClass();

		$( "#" + dropdowns[i] + " li" ).each( function () {
			if ( $(this).text() === defaultValues[i] ) {
				$(this).addClass('active');
			}
		});
	}	
}
						
/* Handle the click on the back button when the route directions are displayed */
$( "#wpsl-result-list" ).on( "click", ".wpsl-back", function() {	
	var i, len;

    /* Remove the directions from the map */
    directionsDisplay.setMap( null );

    /* Restore the store markers on the map */
    for ( i = 0, len = markersArray.length; i < len; i++ ) {
		markersArray[i].setMap( map );
    }
	
	/* Restore the start marker on the map */
	if ( ( typeof( startMarkerData ) !== "undefined" )  && ( startMarkerData !== "" ) ) {
		startMarkerData.setMap( map );
	}

    fitBounds();
	infoWindowDirectionButton();
   
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
	
	/* Check if we need get the start point from a dragged marker */
	if ( ( typeof( startMarkerData ) !== "undefined" )  && ( startMarkerData !== "" ) ) {
		start = startMarkerData.getPosition();
	}

    /* Find the latlng that belongs to the start and end point */
    for ( i = 0, len = markersArray.length; i < len; i++ ) {
		
		/* Only continue if the start data is still empty or undefined */
		if ( ( markersArray[i].storeId == 0 ) && ( ( typeof( start ) === "undefined" ) || ( start === "" ) ) ) {
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
    var i, len, animation = '';

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
    var legs, len, step, index, direction, i, j, distanceUnit, directionOffset,
		directionStops = "",    
		request = {};
		
	if ( wpslSettings.distanceUnit == 'km' ) {
		distanceUnit = google.maps.UnitSystem.METRIC
	} else {
		distanceUnit = google.maps.UnitSystem.IMPERIAL
	}

	request = {
		origin: start,
		destination: end,
		travelMode: google.maps.DirectionsTravelMode.DRIVING,
		unitSystem: distanceUnit 
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

				$( "#wpsl-direction-details ul" ).append( directionStops ).before( "<p class='wpsl-direction-before'><a class='wpsl-back' id='wpsl-direction-start' href='#'>" + wpslLabels.back + "</a>" + direction.legs[0].distance.text + " - " + direction.legs[0].duration.text + "</p>" ).after( "<p class='wpsl-direction-after'>" + response.routes[0].copyrights + "</p>" );
				$( "#wpsl-direction-details" ).show();

				/* Remove all other markers from the map */
				for ( i = 0, len = markersArray.length; i < len; i++ ) {
					markersArray[i].setMap( null );
				}
				
				/* Remove the start marker from the map */
				if ( ( typeof( startMarkerData ) !== "undefined" )  && ( startMarkerData !== "" ) ) {
					startMarkerData.setMap( null );
				}

				$( "#wpsl-stores" ).hide();		
								
				/* Make sure the start of the route directions are visible if the store listings are shown below the map */						
				if ( wpslSettings.storeBelow == 1 ) {
					directionOffset = $( "#wpsl-gmap" ).offset();
					$( window ).scrollTop( directionOffset.top );
				}
			}
		}
    });
}

/* Geocode the user input */ 
function codeAddress() {
    var latLng, 
		autoLoad = false,
		keepStartMarker = false,
		address = $( "#wpsl-search-input" ).val();
		
    geocoder.geocode( { 'address': address}, function( response, status ) {
		if ( status == google.maps.GeocoderStatus.OK ) {			
			latLng = response[0].geometry.location;
			
			/* Remove any previous markers and add a new one */
			deleteOverlays( keepStartMarker );
			addMarker( latLng, 0, '', true ); // This marker is the 'start location' marker. With a storeId of 0, no name and is draggable

			/* Try to find stores that match the radius, location criteria */
			findStoreLocations( latLng, resetMap, autoLoad );
		} else {
			geocodeNotification( status );
		}
    }
)};

/* Geocode the user input and set the returned zipcode in the input field */ 
function reverseGeocode( latLng ) {
    var zipCode;
		
    geocoder.geocode( {'latLng': latLng}, function( response, status ) {
		if ( status == google.maps.GeocoderStatus.OK ) {
			zipCode = filterApiResponse( response );	

			if ( zipCode !== "" ) {
				$( "#wpsl-search-input" ).val( zipCode );
			}
		} else {
			geocodeNotification( status );
		}
	});
}

/* Filter out the zipcode from the response */
function filterApiResponse( response ) {
    var zipcode, responseType, i,
		addressLength = response[0].address_components.length;

    /* Loop over the API response */
    for ( i = 0; i < addressLength; i++ ){
		responseType = response[0].address_components[i].types;

		/* filter out the postal code */
		if ( ( /^postal_code$/.test( responseType ) ) || ( /^postal_code_prefix,postal_code$/.test( responseType ) ) ) {
			zipcode = response[0].address_components[i].long_name;
		}
    }

    return zipcode;
}

function findStoreLocations( startLatLng, resetMap, autoLoad ) {		
	
	/* Check if we need to open a new window and show the route on the Google Maps site itself. */
	if ( wpslSettings.directionRedirect == 1 ) {
		findFormattedAddress( startLatLng, function() {
			makeAjaxRequest( startLatLng, resetMap, autoLoad );
		});
	} else {
		makeAjaxRequest( startLatLng, resetMap, autoLoad );
	}
}

/* The formatted address is used to build the url for the driving direction and send the user to maps.google.com */
function findFormattedAddress( latLng, callback ) {
	geocoder.geocode( {'latLng': latLng}, function( response, status ) {
		if ( status == google.maps.GeocoderStatus.OK ) {
			startAddress = response[0].formatted_address;
			callback();
		} else {
			geocodeNotification( status );
		}
	});
}

function makeAjaxRequest( startLatLng, resetMap, autoLoad ) {
	var location,
		infoWindowData = {},
		storeData = "",
		draggable = false,
		$storeList = $( "#wpsl-stores ul" ),
		preloader = wpslSettings.path + "img/ajax-loader.gif",
		ajaxData = {
			action: "store_search",
			lat: startLatLng.lat(),
			lng: startLatLng.lng()
		},
		url = {
			src : "#wpsl-direction-start",
			target : ""
		};
		
	/* 
	 * If we reset the map we use the default dropdown
	 * values instead of the selected values
	 */
	if ( resetMap ) {
		ajaxData.max_results = wpslSettings.maxResults;
		ajaxData.radius = wpslSettings.searchRadius;
	} else {
		ajaxData.max_results = parseInt( $( "#wpsl-results .wpsl-dropdown .selected" ).text() );
		ajaxData.radius = parseInt( $( "#wpsl-radius .wpsl-dropdown .selected" ).text() );
	}

	/* Check if autoload all stores is enabled */
	if ( autoLoad == 1 ) {
		ajaxData.autoload = 1 ;
	}
	
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
						country: response[index].country,
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
					storeData = storeData + storeHtml( response[index], url );	
					$("#wpsl-reset-map").show();					
				});

				$( "#wpsl-result-list" ).off( "click", ".wpsl-directions" );
				$storeList.append( storeData );
				
				$( "#wpsl-result-list" ).on( "click", ".wpsl-directions", function() {	
					/* Check if we need to disable the rendering of the direction on the map or not. */
					if ( wpslSettings.directionRedirect != 1 ) {
						renderDirections( $(this) );
						return false;
					}
				});
				
				fitBounds();
			} else {
				$storeList.html( "<li class='no-results'>" + wpslLabels.noResults + "</li>" );
			}
			
	    } else {
			alert( wpslLabels.generalError );
	    }
		
		/* If a reset button exists, store the default zoom and latlng values. 
		 * This way when a user clicks the reset button we can check if the zoom/latlng values have changed, 
		 * and if we actually have to reload the map.
		 * 
		 */
		if ( $("#wpsl-reset-map").length > 0 ) {
			if ( $.isEmptyObject( mapDefaults ) ) {
				mapDefaults = {
					centerLatlng : map.getCenter(),
					zoomLevel : map.getZoom()
				};	
			}
		}		
	});	
	
	/* Move the mousecursor to the store search field if the focus option is enabled */
	if ( wpslSettings.mouseFocus == 1 ) {
		$("#wpsl-search-input").focus();
	}
}

/* Add a new marker to the map based on the provided location (latlng) */
function addMarker( location, storeId, infoWindowData, draggable ) {
	var markerPath, mapIcon, keepStartMarker = true;
	
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
			infowindow.setContent( wpslLabels.startPoint );
		}	
		
		infowindow.open( map, marker );
		infoWindowDirectionButton();
    });

    /* Store the marker for later use */
    markersArray.push( marker );
	
	if ( draggable ) {
		google.maps.event.addListener( marker, "dragend", function( event ) { 
			deleteOverlays( keepStartMarker );
			map.setCenter( event.latLng );
			reverseGeocode( event.latLng );
			findStoreLocations( event.latLng, resetMap, autoLoad = false );
		}); 
    }
}

/* Activate the click listener for the direction buttons */
function infoWindowDirectionButton() {
	$( ".wpsl-info-window" ).on( "click", ".wpsl-directions", function() {	
		/* Check if we need to disable the rendering of the direction on the map or not. */
		if ( wpslSettings.directionRedirect != 1 ) {
			renderDirections( $(this) );
			return false;
		}
	});
}

/* Create the data for the infowindows on Google Maps */
function createInfoWindowHtml( infoWindowData, storeId ) {
    var storeHeader,
		url,
		newWindow = "",
		windowContent = "<div data-store-id='" + storeId + "' class='wpsl-info-window'>";
    
    /* Check if we need to turn the store name into a link or not */
    if ( ( typeof( infoWindowData.url ) !== "undefined" ) && ( infoWindowData.url !== "" ) ) {
		if ( wpslSettings.newWindow == 1 ) {
			newWindow = "target='_blank'";
		}
		
		storeHeader = "<a " + newWindow + " href='" + infoWindowData.url + "'><strong>" + infoWindowData.store + "</strong></a>";
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
	
	if ( wpslSettings.directionRedirect == 1 ) {			
		url = createDirectionUrl( infoWindowData.street, infoWindowData.city, infoWindowData.zip, infoWindowData.country );
	} else {
		url = {
			src : "#",
			target : ""
		};
	}

    windowContent += "<a class='wpsl-directions' " + url.target + " href='" + url.src + "'>" + wpslLabels.directions + "</a>";
    windowContent += "</div>";

    return windowContent;
}

function createMoreInfoListing( storeData ) {
	var newWindow = "",
		moreInfoContent = "<div id='wpsl-id-" + storeData.id + "' class='wpsl-more-info-listings'>";
	
	if ( ( typeof( storeData.description ) !== "undefined" ) && ( storeData.description !== "" ) ) {
		moreInfoContent += "<p>" + storeData.description + "</p>";
    }
	
	moreInfoContent += "<p>";
	
	/* If no data exist for either the phone / fax / email then just don't show them */
    if ( ( typeof( storeData.phone ) !== "undefined" ) && ( storeData.phone !== "" ) ) {
		moreInfoContent += "<span><strong>" + wpslLabels.phone + "</strong>: " + storeData.phone + "</span>";
    }

    if ( ( typeof( storeData.fax ) !== "undefined" ) && ( storeData.fax !== "" ) ) {
		moreInfoContent += "<span><strong>" + wpslLabels.fax + "</strong>: " + storeData.fax + "</span>";
    }

    if ( ( typeof( storeData.email ) !== "undefined" ) && ( storeData.email !== "" ) ) {
		moreInfoContent += "<span><strong>Email</strong>: " + storeData.email + "</span>";
    }
	
	if ( ( typeof( storeData.url ) !== "undefined" ) && ( storeData.url !== "" ) ) {
		if ( wpslSettings.newWindow == 1 ) {
			newWindow = "target='_blank'";
		}
		
		moreInfoContent += "<span><strong>Url</strong>: <a " + newWindow + " href=" + storeData.url + ">" + storeData.url + "</a></span>";
	}
	
	moreInfoContent += "</p>";
		
	if ( ( typeof( storeData.hours ) !== "undefined" ) && ( storeData.hours !== "" ) ) {
		moreInfoContent += "<div class='wpsl-store-hours'><strong>" + wpslLabels.hours + "</strong> " + storeData.hours + "</div>";
    }

	moreInfoContent += "</div>";
	
	return moreInfoContent;
}

function createDirectionUrl( street, city, zip, country ) {
	var destinationAddress, url;
	
	/* If we somehow failed to determine the start address, just set it to empty */
	if ( typeof( startAddress ) === 'undefined' ) {
		startAddress = '';
	}

	destinationAddress = street + ', ' + city + ', ' + zip + ', ' + country;

	url = {
		src : "https://maps.google.com/maps?saddr=" + encodeURIComponent( startAddress ) + "&daddr=" + encodeURIComponent( destinationAddress ) + "",
		target : "target='_blank'"
	};

	return url;
}

function storeHtml( response, url ) {
	var html = "", 
		moreInfoData,
		storeImg = "",
		moreInfo = "",
		moreInfoUrl = "#",
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
		
		/* Check if we need to create an url that sends the user to maps.google.com for driving directions */
		if ( wpslSettings.directionRedirect == 1 ) {			
			url = createDirectionUrl( street, city, zip, country );
		}
		
		/* Check if we need to show the 'more info' link in the store listings */
		if ( wpslSettings.moreInfo == 1 ) {	
			
		   /* If we show the store listings under the map, we do want to jump to the 
			* top of the map to focus on the opened infowindow 
			*/
			if ( ( wpslSettings.storeBelow == 1 ) && ( wpslSettings.moreInfoLocation == 'info window' ) ) {
				moreInfoUrl = '#wpsl-search-wrap';
			}
			
			if ( wpslSettings.moreInfoLocation == "store listings" ) {
				
				/* Only create the 'more info' link if there is data to show */
				if ( ( ( typeof( response.description ) !== "undefined" ) && ( response.description !== "" ) ) ||
					 ( ( typeof( response.phone ) !== "undefined" ) && ( response.phone !== "" ) ) ||
					 ( ( typeof( response.fax ) !== "undefined" ) && ( response.fax !== "" ) ) ||
					 ( ( typeof( response.email ) !== "undefined" ) && ( response.email !== "" ) ) ||
					 ( ( typeof( response.hours ) !== "undefined" ) && ( response.hours !== "" ) ) ) {
						moreInfoData = createMoreInfoListing( response );
						moreInfo = "<p><a class='wpsl-store-details wpsl-store-listing' href=" + moreInfoUrl + "wpsl-id-" + id + ">" + wpslLabels.moreInfo + "</a>" + moreInfoData + "</p>";
				}
			} else {
				moreInfo = "<p><a class='wpsl-store-details' href=" + moreInfoUrl + ">" + wpslLabels.moreInfo + "</a></p>";
			}
		}

		html = "<li data-store-id='" + id + "'><div><p>" + storeImg + "<strong>" + store + "</strong><span class='wpsl-street'>" + street + "</span>"  + city + " " + state + " " + zip + "<span class='wpsl-country'>" + country + "</p>" + moreInfo + "</div>" + distance + "<a class='wpsl-directions' " + url.target + " href='" + url.src + "'>" + wpslLabels.directions + "</a></li>";

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
function deleteOverlays( keepStartMarker ) {
	var markerLen, i;
    directionsDisplay.setMap( null );
	
    /* Remove all the markers from the map, and empty the array */
    if ( markersArray ) {
		for ( i = 0, markerLen = markersArray.length; i < markerLen; i++ ) {			
			/* Check if we need to keep the start marker, or remove everything */
			if ( keepStartMarker ) {
				if ( markersArray[i].draggable != true ) {
					markersArray[i].setMap( null );
				} else {
					startMarkerData = markersArray[i];
				}
			} else {
				markersArray[i].setMap( null );
			}
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

/* Handle clicks on the store details link */
$( "#wpsl-stores" ).on( "click", ".wpsl-store-details", function() {	
	var i, len,
		$parentLi = $( this ).parents( "li" ),
		storeId = $parentLi.data( "store-id" );

	/* Check if we should show the 'more info' details */
	if ( wpslSettings.moreInfoLocation == "info window" ) {
		for ( i = 0, len = markersArray.length; i < len; i++ ) {
			if ( markersArray[i].storeId == storeId ) {
				google.maps.event.trigger( markersArray[i], "click" );
			}
		}	
	} else {
		
		/* Check if we should set the 'more info' item to active or not */
		if ( $parentLi.find( ".wpsl-more-info-listings" ).is( ":visible" ) ) {
			$( this ).removeClass( "wpsl-active-details" );
		} else {
			$( this ).addClass( "wpsl-active-details" );
		}		
		
		$parentLi.siblings().find( ".wpsl-store-details" ).removeClass( "wpsl-active-details" );
		$parentLi.siblings().find( ".wpsl-more-info-listings" ).hide();
		$parentLi.find( ".wpsl-more-info-listings" ).toggle();
	}

	/* If we show the store listings under the map, we do want to jump to the 
	 * top of the map to focus on the opened infowindow 
	 */
	if ( wpslSettings.storeBelow != 1 || wpslSettings.moreInfoLocation == "store listings" ) {
		return false;
	}
});

if ( $( "#wpsl-gmap" ).length ) {
    google.maps.event.addDomListener( window, "load", initializeGmap );
}

});