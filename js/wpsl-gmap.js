jQuery( document ).ready( function( $ ) { 
var geocoder, map, infoWindow, directionsDisplay, directionsService, geolocationLatlng, markerClusterer,
	markersArray = [],
	directionMarkerPosition = {},
	mapDefaults = {},
	resetMap = false,
	streetViewAvailable = false,
	startMarkerData,
	startAddress,
	startLatLng,
	autoLoad = wpslSettings.autoLoad,
	$selects = $( "#wpsl-search-wrap select" );

/**
 * Initialize the map with the correct settings
 *
 * @since 1.0
 * @returns {void}
 */
function initializeGmap() {
    var myOptions, zoomControlPosition, zoomControlStyle, latLng, zoomLevel, mapType,
		streetViewVisible = ( wpslSettings.streetView == 1 ) ? true : false;

    /* If no zoom location is defined, we show the entire world */	
    if ( wpslSettings.zoomLatlng !== "" ) {
		latLng		= wpslSettings.zoomLatlng.split( ',' );
		startLatLng = new google.maps.LatLng( latLng[0], latLng[1] );
		zoomLevel	= parseInt( wpslSettings.zoomLevel );
    } else {
		startLatLng = new google.maps.LatLng( 0,0 );
		zoomLevel	= 1;
    }

    geocoder	      = new google.maps.Geocoder();
    infoWindow		  = new google.maps.InfoWindow();
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

	/* Not the most optimal solution, but we check the useragent if we should enable the easydropdown library.
	 * We do this because several people have reported issues with it on iOS and Android devices. So on mobile
	 * devices the dropdowns will be styled according to the browser styles on that device.
	 */
	if ( !checkMobileUserAgent() ) {
		$selects.easyDropDown({
			cutOff: 10,
			wrapperClass: "wpsl-dropdown"
		});
	} else {
		$( "#wpsl-search-wrap select").show();
		$( "#wpsl-wrap" ).addClass( "wpsl-mobile" );
	}
	
    /* Check if we need to try and autolocate the user */
    if ( wpslSettings.autoLocate == 1 ) {
		checkGeolocation();
    } else {
		if ( wpslSettings.autoLoad == 1 ) {
			showStores();
		}
	}
					
	/* Move the mousecursor to the store search field if the focus option is enabled */
	if ( wpslSettings.mouseFocus == 1 ) {
		$( "#wpsl-search-input" ).focus();
	}
}

/**
 * Add the start marker and call the function that inits the store search
 *
 * @since 1.1
 * @returns {void}
 */
function showStores() {
	var startMarker = {
			store: wpslLabels.startPoint
		};
	
	addMarker( startLatLng, 0, startMarker, true ); // This marker is the 'start location' marker. With a storeId of 0, no name and is draggable
	findStoreLocations( startLatLng, resetMap, autoLoad );
}

/**
 * Compare the current useragent to a list of known mobile useragents ( not optimal, I know )
 *
 * @since 1.2.20
 * @returns {boolean} Whether the useragent is from a known mobile useragent or not.
 */
function checkMobileUserAgent() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent );	
}

/* Check if Geolocation detection is supported. 
 * 
 * If there is an error / timeout with determining the users 
 * location we use the 'start point' value from the settings as the start location through the showStores function. 
 *
 * @since 1.0
 * @returns {void}
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

/* Check if Geolocation detection is supported. 
 * 
 * If there is an error / timeout determining the users location,
 * then we use the 'start point' value from the settings as the start location through the showStores function. 
 *
 * @since 1.0
 * @param {object} position The latlng coordinates
 * @param {boolean} resetMap Whether we should reset the map or not
 * @returns {void}
 */
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
		$( "#wpsl-search-input" ).addClass( "wpsl-error" ).focus();
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

/* Handle clicks on the "Reset" button */
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
		$( "#wpsl-search-input" ).val("").removeClass();
		
		/* If marker clusters exist, remove them from the map */
		if ( markerClusterer ) {
			markerClusterer.clearMarkers();
		}
		
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
	
	/* Make sure the stores are shown and the direction details are hidden  */
	$( "#wpsl-stores" ).show();
    $( "#wpsl-direction-details" ).hide();
});

/* Remove the start marker from the map
 *
 * @since 1.2.12
 * @returns {void}
 */
function deleteStartMarker() {
	if ( ( typeof( startMarkerData ) !== "undefined" ) && ( startMarkerData !== "" ) ) {
		startMarkerData.setMap( null );
		startMarkerData = "";
	}
}

/* Reset the dropdown values after the "reset" button is triggerd
 * 
 * @since 1.1
 * @returns {void}
 */
function resetDropdowns() {
	var i, arrayLength,
		defaultValues = [wpslSettings.searchRadius + ' ' + wpslSettings.distanceUnit, wpslSettings.maxResults],
		dropdowns = ["wpsl-radius", "wpsl-results"];
	
	for ( i = 0, arrayLength = dropdowns.length; i < arrayLength; i++ ) {
	  	$( "#" + dropdowns[i] + " .selected" ).html( defaultValues[i] );
		$( "#" + dropdowns[i] + " li" ).removeClass();

		$( "#" + dropdowns[i] + " li" ).each( function () {
			if ( $( this ).text() === defaultValues[i] ) {
				$( this ).addClass( "active" );
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

	/* If marker clusters are enabled, then restore them */
	if ( markerClusterer ) {		
		checkMarkerClusters();			
	}
	
	map.setCenter( directionMarkerPosition.centerLatlng );
	map.setZoom( directionMarkerPosition.zoomLevel );	

    $( ".wpsl-direction-before, .wpsl-direction-after" ).remove();
    $( "#wpsl-stores" ).show();
    $( "#wpsl-direction-details" ).hide();

    return false;
});

/* Show the driving directions
 * 
 * @since 1.1
 * @param {object} e The clicked elemennt
 * @returns {void}
 */
function renderDirections( e ) {
    var i, start, end, len, storeId;

    /* 
    The storeId is placed on the li in the results list, 
    but in the marker it will be on the wrapper div. So we check which one we need to target.
    */
    if ( e.parent( "li" ).length > 0 ) {
		storeId = e.parent( "li" ).data( "store-id" );
    } else {
		storeId = e.parents( ".wpsl-info-window" ).data( "store-id" );
    }
	
	/* Check if we need to get the start point from a dragged marker */
	if ( ( typeof( startMarkerData ) !== "undefined" )  && ( startMarkerData !== "" ) ) {
		start = startMarkerData.getPosition();
	}
	
	/* Used to restore the map back to the state it was in before the user clicked on 'directions' */
	directionMarkerPosition = {
		centerLatlng: map.getCenter(),
		zoomLevel: map.getZoom()	
	};

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
		letsBounce( $( this ).data( "store-id" ), "start" );
    });
	
    $( "#wpsl-stores" ).on( "mouseleave", "li", function() {	
		letsBounce( $( this ).data( "store-id" ), "stop" );
    });
}

/* Let a single marker bounce
 * 
 * @since 1.0
 * @param {number} storeId The storeId of the marker that we need to bounce on the map
 * @param {string} status Indicates whether we should stop or start the bouncing
 * @returns {void}
 */
function letsBounce( storeId, status ) {
    var i, len, animation = "";

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

/* Calculate the route from the start to the end
 * 
 * @since 1.0
 * @param {object} start The latlng from the start point
 * @param {object} end The latlng from the end point
 * @returns {void}
 */
function calcRoute( start, end ) {
    var legs, len, step, index, direction, i, j, distanceUnit, directionOffset,
		directionStops = "",    
		request = {};
		
	if ( wpslSettings.distanceUnit == "km" ) {
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
				
				/* Remove all single markers from the map */
				for ( i = 0, len = markersArray.length; i < len; i++ ) {
					markersArray[i].setMap( null );
				}
			
				/* Remove the marker clusters from the map */
				if ( markerClusterer ) {
					markerClusterer.clearMarkers();
				}			
				
				/* Remove the start marker from the map */
				if ( ( typeof( startMarkerData ) !== "undefined" )  && ( startMarkerData !== "" ) ) {
					startMarkerData.setMap( null );
				}

				$( "#wpsl-stores" ).hide();		
								
				/* Make sure the start of the route directions are visible if the store listings are shown below the map */						
				if ( wpslSettings.templateId == 1 ) {
					directionOffset = $( "#wpsl-gmap" ).offset();
					$( window ).scrollTop( directionOffset.top );
				}
			}
		} else {
			directionErrors( status );
		}
    });
}

/* Geocode the user input
 * 
 * @since 1.0
 * @returns {void}
 */
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
			geocodeErrors( status );
		}
    });
}

/* Geocode the user input and set the returned zipcode in the input field
 * 
 * @since 1.0
 * @param {object} latlng The coordinates of the location that should be reverse geocoded
 * @returns {void}
 */
function reverseGeocode( latLng ) {
    var zipCode;

    geocoder.geocode( {'latLng': latLng}, function( response, status ) {
		if ( status == google.maps.GeocoderStatus.OK ) {
			zipCode = filterApiResponse( response );	

			if ( zipCode !== "" ) {
				$( "#wpsl-search-input" ).val( zipCode );
			}
		} else {
			geocodeErrors( status );
		}
	});
}

/* Filter out the zipcode from the response
 * 
 * @since 1.0
 * @param {object} response The complete Google API response
 * @returns {string} zipcode The zipcode
 */
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

/* Call the function to make the ajax request. But if we need to show the driving directions
 * on maps.google.com itself, we first need to geocode the start latlng into a formatted address.
 * 
 * @since 1.0
 * @param {object} startLatLng The latlng used as the starting point
 * @param {boolean} resetMap Whether we should reset the map or not
 * @param {string} autoLoad Check if we need to autoload all the stores
 * @returns {void}
 */
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

/* Convert the latlng into a formatted address
 * 
 * @since 1.0
 * @param {object} latlng The latlng to geocode
 * @returns {void}
 */
function findFormattedAddress( latLng, callback ) {
	geocoder.geocode( {'latLng': latLng}, function( response, status ) {
		if ( status == google.maps.GeocoderStatus.OK ) {
			startAddress = response[0].formatted_address;
			callback();
		} else {
			geocodeErrors( status );
		}
	});
}

/* Make the Ajax request to load the store data
 * 
 * @since 1.2
 * @param {object} startLatLng The latlng used as the starting point
 * @param {boolean} resetMap Whether we should reset the map or not
 * @param {string} autoLoad Check if we need to autoload all the stores
 * @returns {void}
 */
function makeAjaxRequest( startLatLng, resetMap, autoLoad ) {
	var latLng,
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
		
	/* If we reset the map we use the default dropdown values instead of the selected values. */
	if ( resetMap ) {
		ajaxData.max_results = wpslSettings.maxResults;
		ajaxData.radius		 = wpslSettings.searchRadius;
	} else {
		if ( $( "#wpsl-wrap" ).hasClass( "wpsl-mobile" ) ) {
			ajaxData.max_results = $( "#wpsl-results .wpsl-dropdown" ).val();
			ajaxData.radius 	 = $( "#wpsl-radius .wpsl-dropdown" ).val();
		} else {
			ajaxData.max_results = parseInt( $( "#wpsl-results .wpsl-dropdown .selected" ).text() );
			ajaxData.radius 	 = parseInt( $( "#wpsl-radius .wpsl-dropdown .selected" ).text() );
		}
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
						address: response[index].address,
						address2: response[index].address2,
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

					latLng = new google.maps.LatLng( response[index].lat, response[index].lng );	
					addMarker( latLng, response[index].id, infoWindowData, draggable );	
					storeData = storeData + storeHtml( response[index], url );	
					$( "#wpsl-reset-map" ).show();					
				});

				$( "#wpsl-result-list" ).off( "click", ".wpsl-directions" );
				$storeList.append( storeData );
				
				$( "#wpsl-result-list" ).on( "click", ".wpsl-directions", function() {	
					/* Check if we need to disable the rendering of the direction on the map or not. */
					if ( wpslSettings.directionRedirect != 1 ) {
						renderDirections( $( this ) );
						return false;
					}
				});
				
				/* Do we need to create a marker cluster? */
				checkMarkerClusters();
				
				/* Make sure everything fits on the screen */
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
		 */
		if ( $( "#wpsl-reset-map" ).length > 0 ) {
			if ( $.isEmptyObject( mapDefaults ) ) {
				mapDefaults = {
					centerLatlng: map.getCenter(),
					zoomLevel: map.getZoom()
				};	
			}
		}		
	});	
	
	/* Move the mousecursor to the store search field if the focus option is enabled */
	if ( wpslSettings.mouseFocus == 1 ) {
		$( "#wpsl-search-input" ).focus();
	}
}

/**
 * Check if cluster markers are enabled.
 * If so, init the marker clustering with the 
 * correct gridsize and max zoom.
 * 
 * @since 1.2.20
 * @return {void}
 */
function checkMarkerClusters() {
	if ( wpslSettings.markerClusters == 1 ) {
		var clusterZoom = Number( wpslSettings.clusterZoom ),
			clusterSize = Number( wpslSettings.clusterSize );

		if ( isNaN( clusterZoom ) ) {
			clusterZoom = "";
		}
		
		if ( isNaN( clusterSize ) ) {
			clusterSize = "";
		}

		markerClusterer = new MarkerClusterer( map, markersArray, {
			gridSize: clusterSize,
			maxZoom: clusterZoom
		});
	}
}

/**
 * Add a new marker to the map based on the provided location (latlng)
 * 
 * @since 1.0
 * @param {object} latLng
 * @param {number} storeId
 * @param {object} infoWindowData
 * @param {boolean} draggable
 * @return {void}
 */
function addMarker( latLng, storeId, infoWindowData, draggable ) {
	var markerPath, mapIcon, marker, 
		keepStartMarker = true;
	
	if ( storeId === 0 ) {
		markerPath = wpslSettings.path + "img/markers/" + wpslSettings.startMarker;
	} else {
		markerPath = wpslSettings.path + "img/markers/" + wpslSettings.storeMarker;
	}
	
	mapIcon = {
		url: markerPath,
		scaledSize: new google.maps.Size( 24,35 ), //retina format
		origin: new google.maps.Point( 0,0 ),  
		anchor: new google.maps.Point( 12,35 )
	};
	
    marker = new google.maps.Marker({
		position: latLng,
		map: map,
		optimized: false, //fixes markers flashing while bouncing
		title: infoWindowData.store,
		draggable: draggable,
		storeId: storeId,
		icon: mapIcon
	});	
		
    /* Store the marker for later use */
    markersArray.push( marker );

    google.maps.event.addListener( marker, "click", function() {
		
		/* The start marker will have a store id of 0, all others won't */
		if ( storeId != 0 ) {
			
			/* Check if streetview is available at the clicked location */
			if ( wpslSettings.markerStreetView == 1) {
				checkStreetViewStatus( latLng, function() {	
					setInfoWindowContent( marker, createInfoWindowHtml( infoWindowData, storeId, streetViewAvailable ) );
				});
			} else {
				setInfoWindowContent( marker, createInfoWindowHtml( infoWindowData, storeId, streetViewAvailable ) );
			}
		} else {
			setInfoWindowContent( marker, wpslLabels.startPoint );
		}	
				
		google.maps.event.clearListeners( infoWindow );
		google.maps.event.addListener( infoWindow, "domready", function() {	
			infoWindowActions( marker, latLng );
		});
    });
	
	if ( draggable ) {
		google.maps.event.addListener( marker, "dragend", function( event ) { 
			deleteOverlays( keepStartMarker );
			map.setCenter( event.latLng );
			reverseGeocode( event.latLng );
			findStoreLocations( event.latLng, resetMap, autoLoad = false );
		}); 
    }
}

/**
 * Set the correct infowindow content for the marker
 * 
 * @since 1.2.20
 * @param {object} marker Marker data
 * @param {string} InfoWindowContent The infowindow content
 * @returns {void}
 */
function setInfoWindowContent( marker, InfoWindowContent ) {
	infoWindow.setContent( InfoWindowContent );
	infoWindow.open( map, marker );
}

/**
 * Handle clicks for the different infowindow actions like, 
 * direction, streetview and zoom here.
 * 
 * @since 1.2.20
 * @param {object} marker Holds the marker data
 * @param {object} activelatLng The latng of the clicked marker
 * @returns {void}
 */
function infoWindowActions( marker, activelatLng ) {
	$( ".wpsl-info-actions a" ).on( "click", function() {
		if ( $( this ).hasClass( "wpsl-directions" ) ) {

			/* Check if we need to show the direction on the map
			 * or send the users to maps.google.com 
			 */
			if ( wpslSettings.directionRedirect != 1 ) {
				renderDirections( $( this ) );
				
				return false;
			}
		} else if ( $( this ).hasClass( "wpsl-streetview" ) ) {
			activateStreetView( marker );
			
			return false;
		} else if ( $( this ).hasClass( "wpsl-zoom-here" ) ) {
			map.setCenter( activelatLng );
			map.setZoom( 15  );

			return false;
		}
	});
}
	
/**
 * Activate streetview for the clicked location
 * 
 * @since 1.2.20
 * @param {object} marker The current marker
 * @returns {void}
 */
function activateStreetView( marker ) {
	var panorama = map.getStreetView();
		panorama.setPosition( marker.getPosition() );
		panorama.setVisible( true );
		
	$( "#wpsl-reset-map" ).hide();
		
	StreetViewListener( panorama );
}

/**
 * Listen for changes in the streetview visibility
 * 
 * Sometimes the infowindow offset is incorrect after switching back from streetview.
 * We fix this by zooming in and out. If someone has a better fix, then let me know at
 * info at tijmensmit.com
 * 
 * @since 1.2.20
 * @param {object} panorama The streetview object
 * @returns {void}
 */
function StreetViewListener( panorama ) {
	google.maps.event.addListener( panorama, 'visible_changed', function() {
		if ( !panorama.getVisible() ) {
			var currentZoomLevel = map.getZoom();
			$( "#wpsl-reset-map" ).show();
			
			map.setZoom( currentZoomLevel-1 );
			map.setZoom( currentZoomLevel );
		}
	});
}

/**
 * Check the streetview status
 * 
 * Make sure that a streetview exists for the latlng
 * 
 * @since 1.2.20
 * @param {object} latLng The latlng coordinates
 * @returns {void}
 */
function checkStreetViewStatus( latLng, callback ) {
	var service = new google.maps.StreetViewService();
	
	service.getPanoramaByLocation( latLng, 50, function( result, status ) {
		streetViewAvailable = ( status == google.maps.StreetViewStatus.OK ) ? true : false;	
		callback();
	});
}

/**
 * Create the data for the infowindows on Google Maps
 * 
 * @since 1.0
 * @param {object} infoWindowData The data that is shown in the infowindow (address, url, phone etc)
 * @param {number} storeId The ID of the store
 * @param {boolean} streetViewAvailable Indicates whether or not we should show the streetview link
 * @returns {string} windowContent The html content that is placed in the infowindow
 */
function createInfoWindowHtml( infoWindowData, storeId, streetViewAvailable ) {
    var storeHeader, url, 
		address2 = "",
		newWindow = "",
		streetView = "",
		zoomTo = "",
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

	if ( ( typeof( infoWindowData.address2 ) !== "undefined" ) && ( infoWindowData.address2 !== "" ) ) {
		 address2 = "<span>" + infoWindowData.address2 + "</span>";
	}

    windowContent += "<p>" + storeHeader + "<span>" + infoWindowData.address + "</span>" + address2 + "<span>" + infoWindowData.city + "</span></p>";

    if ( ( typeof( infoWindowData.description ) !== "undefined" ) && ( infoWindowData.description !== "" ) ) {
		windowContent += "<p>" + infoWindowData.description + "</p>";
    }

    /* If no data exist for either the phone / fax / email then we just don't show them */
    if ( ( typeof( infoWindowData.phone ) !== "undefined" ) && ( infoWindowData.phone !== "" ) ) {
		windowContent += "<span><strong>" + wpslLabels.phone + "</strong>: " + formatPhoneNumber( infoWindowData.phone ) + "</span>";
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
		url = createDirectionUrl( infoWindowData.address, infoWindowData.city, infoWindowData.zip, infoWindowData.country );
	} else {
		url = {
			src : "#",
			target : ""
		};
	}
		
	if ( streetViewAvailable ) {
		streetView = "<a class='wpsl-streetview' href='#'>" + wpslLabels.streetView + "</a>";
	}

	if ( wpslSettings.markerZoomTo == 1 ) {
		zoomTo = "<a class='wpsl-zoom-here' href='#'>" + wpslLabels.zoomHere + "</a>";
	}
	
    windowContent += "<div class='wpsl-info-actions'><a class='wpsl-directions' " + url.target + " href='" + url.src + "'>" + wpslLabels.directions + "</a>" + streetView + zoomTo + "</div>";	
	windowContent += "</div>";

    return windowContent;
}

/**
 * Make the phone number clickable if we are dealing with a mobile useragent
 * 
 * @since 1.2.20
 * @param {string} phoneNumber The phone number
 * @returns {string} phoneNumber Either just the plain number, or with a link wrapped around it with tel:
 */
function formatPhoneNumber( phoneNumber ) {
	if ( ( wpslSettings.phoneUrl == 1 ) && ( checkMobileUserAgent() ) ) {
		phoneNumber = "<a href='tel:" + formatClickablePhoneNumber( phoneNumber ) + "'>" + phoneNumber + "</a>";
	}
	
	return phoneNumber;
}

/**
 * Replace spaces - . and () from phone numbers. 
 * Also if the number starts with a + we check for a (0) and remove it.
 * 
 * @since 1.2.20
 * @param {string} phoneNumber The phone number
 * @returns {string} phoneNumber The 'cleaned' number
 */
function formatClickablePhoneNumber( phoneNumber ) {
	if ( ( phoneNumber.indexOf( "+" ) != -1 ) && ( phoneNumber.indexOf( "(0)" ) != -1 ) ) {
		phoneNumber = phoneNumber.replace( '(0)', '' );
	}
	
	return phoneNumber.replace( /(-| |\(|\)|\.|)/g, '' );	
}

/**
 * Create the html for the more info data
 * 
 * @since 1.2.12
 * @param {object} storeData The store details shown in the more info section
 * @returns {string} moreInfoContent The html that is used to show the more info content
 */
function createMoreInfoListing( storeData ) {
	var newWindow = "",
		moreInfoContent = "<div id='wpsl-id-" + storeData.id + "' class='wpsl-more-info-listings'>";
	
	if ( ( typeof( storeData.description ) !== "undefined" ) && ( storeData.description !== "" ) ) {
		moreInfoContent += "<p>" + storeData.description + "</p>";
    }
	
	moreInfoContent += "<p>";
	
	/* If no data exist for either the phone / fax / email then just don't show them */
    if ( ( typeof( storeData.phone ) !== "undefined" ) && ( storeData.phone !== "" ) ) {
		moreInfoContent += "<span><strong>" + wpslLabels.phone + "</strong>: " + formatPhoneNumber( storeData.phone ) + "</span>";
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
		
		moreInfoContent += "<span><strong>Url</strong>: <a " + newWindow + " href='" + storeData.url + "'>" + storeData.url + "</a></span>";
	}
	
	moreInfoContent += "</p>";
		
	if ( ( typeof( storeData.hours ) !== "undefined" ) && ( storeData.hours !== "" ) ) {
		moreInfoContent += "<div class='wpsl-store-hours'><strong>" + wpslLabels.hours + "</strong> " + storeData.hours + "</div>";
    }

	moreInfoContent += "</div>";
	
	return moreInfoContent;
}

/**
 * Create the url that takes the user to the maps.google.com page 
 * and shows the correct driving directions.
 * 
 * @since 1.0
 * @param {string} address The store address
 * @param {string} city The store city
 * @param {string} zip The store zipcode
 * @param {string} country The store country
 * @returns {string} url The full maps.google.com url with the encoded start + end address
 */
function createDirectionUrl( address, city, zip, country ) {
	var destinationAddress, url;
	
	/* If we somehow failed to determine the start address, just set it to empty */
	if ( typeof( startAddress ) === 'undefined' ) {
		startAddress = '';
	}

	destinationAddress = address + ', ' + city + ', ' + zip + ', ' + country;

	url = {
		src : "https://maps.google.com/maps?saddr=" + rfc3986EncodeURIComponent( startAddress ) + "&daddr=" + rfc3986EncodeURIComponent( destinationAddress ) + "",
		target : "target='_blank'"
	};

	return url;
}

/**
 * Make the URI encoding compatible with RFC 3986
 * 
 * !, ', (, ), and * will be escaped, otherwise they break the string
 * 
 * @since 1.2.20
 * @param {string} str The string to encode
 * @returns {string} The encoded string
 */
function rfc3986EncodeURIComponent( str ) {  
    return encodeURIComponent( str ).replace( /[!'()*]/g, escape );  
}

/**
 * Create the html for the <li> elem in the store listing
 * 
 * @since 1.0
 * @param {object} response The store details shown in the more info section
 * @param {object} url The directions url
 * @returns {string} html The html with the store details
 */
function storeHtml( response, url ) {
	var html = "", 
		moreInfoData,
		storeImg = "",
		storeUrlTarget = "",
		moreInfo = "",
		moreInfoUrl = "#",
		id = response.id,
		store = response.store,
		address = response.address,
		address2 = "",
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
		url = createDirectionUrl( address, city, zip, country );
	}

	/* Check if we need to show the 'more info' link in the store listings */
	if ( wpslSettings.moreInfo == 1 ) {	

	   /* If we show the store listings under the map, we do want to jump to the 
		* top of the map to focus on the opened infowindow 
		*/
		if ( ( wpslSettings.templateId == 1 ) && ( wpslSettings.moreInfoLocation == 'info window' ) ) {
			moreInfoUrl = '#wpsl-search-wrap';
		}

		/* Do we need to show the 'more info' data under the store details, 
		 * or should we only add a link which will trigger the infowindow? 
		 */
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

	/* Check if we need to make the store name clickable */
	if ( wpslSettings.storeUrl == 1) {
		if ( ( typeof( response.url ) !== "undefined" ) && ( response.url !== "" ) ) {

			/* Do we need to open the url in a new window? */
			if ( wpslSettings.newWindow == 1 ) {
				storeUrlTarget = "target='_blank'";
			}

			store = "<a " + storeUrlTarget + " href='" + response.url + "'>" + store + "</a>";
		}
	}

	/* If we have a second address line, we add it */
	if ( ( typeof( response.address2 ) !== "undefined" ) && ( response.address2 !== "" ) ) {
		address2 = "<span class='wpsl-street'>" + response.address2 + "</span>";
	}

	html = "<li data-store-id='" + id + "'><div><p>" + storeImg + "<strong>" + store + "</strong><span class='wpsl-street'>" + address + "</span>" + address2 + city + " " + state + " " + zip + "<span class='wpsl-country'>" + country + "</p>" + moreInfo + "</div>" + distance + "<a class='wpsl-directions' " + url.target + " href='" + url.src + "'>" + wpslLabels.directions + "</a></li>";

	return html;
}

/**
 * Zoom the map so that all markers fit in the window 
 * 
 * @since 1.0
 * @returns {void}
 */
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

/**
 * Remove all existing markers and route lines from the map
 * 
 * @since 1.0
 * @param {boolean} keepStartMarker Whether or not to keep the start marker while removing all the other markers from the map
 * @returns {void}
 */
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
	
	/* If marker clusters exist, remove them from the map */
	if ( markerClusterer ) {
		markerClusterer.clearMarkers();
	}
}

/**
 * Handle the geocode errors.
 * 
 * @since 1.0
 * @param {string} status Contains the error code
 * @returns void
 */
function geocodeErrors( status ) {
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

/**
 * Handle the driving direction errors.
 * 
 * @since 1.2.20
 * @param {string} status Contains the error code
 * @returns void
 */
function directionErrors( status ) {
    var msg;

    switch ( status ) {
		case "NOT_FOUND":
		case "ZERO_RESULTS":
			msg = wpslLabels.noDirectionsFound;
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
	if ( wpslSettings.templateId != 1 || wpslSettings.moreInfoLocation == "store listings" ) {
		return false;
	}
});

if ( $( "#wpsl-gmap" ).length ) {
    google.maps.event.addDomListener( window, "load", initializeGmap );
}

});