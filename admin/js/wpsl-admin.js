jQuery( document ).ready( function( $ ) { 
var map, geocoder, uploadFrame, 
	markersArray = [];

/**
 * Initialize the map with the correct settings
 *
 * @since 1.0
 * @returns {void}
 */
function initializeGmap() {
	var myOptions = {
			zoom: 2,
			center: new google.maps.LatLng( "52.378153", "4.899363" ),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: false
		};

	geocoder = new google.maps.Geocoder();
	map		 = new google.maps.Map( document.getElementById( "wpsl-gmap-wrap" ), myOptions );
	
	checkEditStoreMarker();
}

/**
 * If we have an existing latlng value, add a marker to the map. This can only happen on the edit store page 
 *
 * @since 1.0
 * @returns {void}
 */
function checkEditStoreMarker() {
	var location,
		lat = $( "#wpsl-store-lat" ).val(),
		lng = $( "#wpsl-store-lng" ).val();
	
	if ( ( lat ) && ( lng ) ) {
		location = new google.maps.LatLng( lat, lng );

		map.setCenter( location );
		map.setZoom( 16 );
		addMarker( location );
	}
}

/* If we have a city/country input field enable the autocomplete */
if ( $( "#wpsl-zoom-name" ).length ) {
	activateAutoComplete();	
}

/**
 * Activate the autocomplete function for the city/country field
 *
 * @since 1.0
 * @returns {void}
 */
function activateAutoComplete() {
	var latlng,
		input = document.getElementById( "wpsl-zoom-name" ),
		options = {
		  types: ['geocode']
		},
		autocomplete = new google.maps.places.Autocomplete( input, options );
	
	google.maps.event.addListener( autocomplete, "place_changed", function() {
		latlng = autocomplete.getPlace().geometry.location;
		setLatlng( latlng, "zoom" );
	});	
}

/**
 * Add a new marker to the map based on the provided location (latlng)
 *
 * @since 1.0
 * @param {object} location The latlng value
 * @returns {void}
 */
function addMarker( location ) {
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		draggable: true
	});
	
	markersArray.push( marker );
	
	google.maps.event.addListener( marker, "dragend", function() {
		geocodeDraggedPosition( marker.getPosition() );
	});
}

/**
 * Lookup the location where the marker is dropped
 *
 * @since 1.0
 * @param {object} pos The latlng value
 * @returns {void}
 */
function geocodeDraggedPosition( pos ) {
	geocoder.geocode({
		latLng: pos
	}, function ( response ) {
		if ( response && response.length > 0 ) {
			setLatlng( response[0].geometry.location, "store" );
		} else {
			alert( wpslL10n.noAddress );
		}
	});
}

/* Lookup the provided location name with the Google Maps API */
$( "#wpsl-lookup-location" ).on( "click", function() {	
	codeAddress();
	return false;
});

/**
 * Geocode the user input 
 *
 * @since 1.0
 * @returns {void}
 */
function codeAddress() {
    var filteredResponse, fullAddress,
		address = $( "#wpsl-store-address" ).val(),
		city	= $( "#wpsl-store-city" ).val(),
		zip		= $( "#wpsl-store-zip" ).val(),
		country	= $( "#wpsl-store-country" ).val();
	
		if ( zip ) {
			fullAddress = address + ',' + city + ',' + zip + ',' + country;
		} else {
			fullAddress = address + ',' + city + ',' + country;
		}
		
		/* Check we have all the requird data before attempting to geocode the address */
		if ( !validatePreviewFields( address, city, country ) ) {
			geocoder.geocode( { 'address': fullAddress }, function( response, status ) {
				if ( status === google.maps.GeocoderStatus.OK ) {
					
					/* If we have a previous marker on the map remove it */
					if ( typeof( markersArray[0] ) !== "undefined" ) {
						if ( markersArray[0].draggable ) {
							markersArray[0].setMap( null );
							markersArray.splice(0, 1);
						}
					}
							
					/* Center and zoom to the searched location */
					map.setCenter( response[0].geometry.location );
					map.setZoom( 16 );
					addMarker( response[0].geometry.location );				
					setLatlng( response[0].geometry.location, "store" );

					filteredResponse = filterApiResponse( response );
					$( "#wpsl-store-country" ).val( filteredResponse.country.long_name );
					$( "#wpsl-country-iso" ).val( filteredResponse.country.short_name );
				} else {
					alert( wpslL10n.geocodeFail + ' ' + status );
				}
			});
		}
}

/**
 * Check that all required fields for the preview to work are there 
 *
 * @since 1.0
 * @param {string} address The store address
 * @param {string} city The store city
 * @param {string} country The store country
 * @returns {boolean} error Whether a field validated or not
 */
function validatePreviewFields( address, city, country ) {
	var error = false;
	
	$( "#wpsl-wrap input" ).removeClass( "wpsl-error" );
		
	if ( !address ) {
		$( "#wpsl-store-address" ).addClass( "wpsl-error" );
		error = true;
	}
	
	if ( !city ) {
		$( "#wpsl-store-city" ).addClass( "wpsl-error" );
		error = true;
	}
	
	if ( !country ) {
		$( "#wpsl-store-country" ).addClass( "wpsl-error" );
		error = true;
	}	
	
	return error;
}

/* Filter out the zipcode from the Google Maps API response */
function filterApiResponse( response ) {
	var responseType,
		country = {},
		collectedData = {},
		addressLength = response[0].address_components.length;
		
	/* Loop over the API response */
	for ( i = 0; i < addressLength; i++ ){
		responseType = response[0].address_components[i].types;
		
		/* filter out the country name */
		if ( /^country,political$/.test( responseType ) ) {
			country = { 
				long_name : response[0].address_components[i].long_name,
				short_name : response[0].address_components[i].short_name
			};
		}
	}
	
	collectedData = {
		country : country
	};
	
	return collectedData;
}

/* Update the hidden input field with the current lat/long values. */
function setLatlng( latlng, target ) {
	var coordinates = stripCoordinates( latlng ),
		lat = roundLatlng( coordinates[0], 6 ),
		lng = roundLatlng( coordinates[1], 6 );
	
	if ( target == "store" ) {
		$( "#wpsl-store-lat" ).val( lat );
		$( "#wpsl-store-lng" ).val( lng );
	} else if ( target == "zoom" ) {
		$( "#wpsl-latlng" ).val( lat + ',' + lng);
	}
}

/* Round the latlng to 6 digits after the comma */
function roundLatlng( num, decimals ) {
	return Math.round( num * Math.pow( 10, decimals ) ) / Math.pow( 10, decimals );
}

/* strip the '(' and ')' from the captured coordinates, and split them */
function stripCoordinates( coordinates ) {
	var latlng = [],
		selected = coordinates.toString(),
		latlngStr = selected.split( ",",2 );
	
	latlng[0] = latlngStr[0].replace( '(', '' );
	latlng[1] = latlngStr[1].replace( ')', '' );	

	return latlng;
}

/* Handle the selection of custom thumbnails */
$( "#wpsl-thumb-wrap" ).on( "click", "#wpsl-media-upload", function( e ) {
	e.preventDefault();

	if ( uploadFrame ) {
		uploadFrame.open();
		return;
	}

	uploadFrame = wp.media.frames.uploadFrame = wp.media({
		title: "Set store image",
		frame: "select",
		multiple: false,
		library: {
			type: "image"
		},
		button: {
			text: "upload"
		}
	});

	uploadFrame.on( "select", function() {
		var thumbUrl,
			media_attachment = uploadFrame.state().get( "selection" ).first().toJSON();
		
		if ( typeof( media_attachment.sizes.thumbnail ) !== 'undefined' ) {
			thumbUrl = media_attachment.sizes.thumbnail.url; 
		} else if ( typeof( media_attachment.sizes.medium ) !== 'undefined' ) {
			thumbUrl = media_attachment.sizes.medium.url; 
		} else if ( typeof( media_attachment.sizes.full ) !== 'undefined' ) {
			thumbUrl = media_attachment.sizes.full.url; 
		}
		
		setLocationThumb( thumbUrl, media_attachment.id ); 
	});

	uploadFrame.open();
});

/* Replace the thumnail with the placeholder */
$( "#wpsl-thumb-wrap" ).on( "click", "#wpsl-remove-thumb", function( e ) {
	e.preventDefault();

	$( "#wpsl-thumb-wrap img" ).replaceWith( "<span class='wpsl-thumb-placeholder'></span>" );
	$( "#wpsl-thumb-id" ).val('');
});

/* Show the selected thumb */
function setLocationThumb( thumbUrl, thumbId ) {
	var img;
	
	if ( $( "#wpsl-thumb-wrap img" ).length ) {
		$( "#wpsl-thumb-wrap img" ).attr({ 'src' : thumbUrl, 'data-img-id' : thumbId });
		$( "#wpsl-thumb-id" ).val( thumbId );
	} else {
		img = "<img class='wpsl-curve' src='" + thumbUrl + "' width='85' height='85' />";
		$( "#wpsl-thumb-wrap span" ).replaceWith( img );	
		$( "#wpsl-thumb-id" ).val( thumbId );
	}	
}

$( ".wpsl-delete-store-btn" ).removeAttr( "disabled" );

$( "#wpsl-store-overview" ).on( "click", ".wpsl-delete-store-btn", function() {	
	var elem = $(this),
		dialogBox = $( "#wpsl-delete-confirmation" ),
		cancelBtn = dialogBox.find( ".button-secondary" ),
		submitBtn = dialogBox.find( ".button-primary" );

	dialogBox.dialog({
		width: 325,
		resizable : false,
		modal: true,
		minHeight: 0
	});
	
	$( ".ui-dialog-titlebar" ).remove();
	cancelBtn.on( "click", function() {	
		dialogBox.dialog( "close" ); 
		submitBtn.unbind( "click" );
        dialogBox.unbind( "click" );
	});
	
	submitBtn.on( "click", function() {	
		dialogBox.dialog( "close" );
		deleteStore( elem ); 
		submitBtn.unbind( "click" );
        dialogBox.unbind( "click" );
		
        return false;
	});
	
	return false;
});

function deleteStore( elem ) {
	var ajaxData = {},
		$parentTr = elem.parents( "tr" );

	showPreloader( elem );
	elem.attr( "disabled", "disabled" );
	
	ajaxData = {
		action: "delete_store",
		store_id: elem.parent( ".column-action" ).find( "input[name='wpsl_store_id']" ).val(),
		_ajax_nonce: elem.parent( ".column-action" ).find( "input[name='wpsl_delete_nonce']" ).val()
	};
	
	jQuery.ajaxQueue({
		url: ajaxurl,
		data: ajaxData,
		type: "POST"
	}).done( function( response ) {
		if ( response === -1 ) {
			elem.removeAttr( "disabled" );
			$( ".wpsl-preloader" ).remove();
			alert( wpslL10n.securityFail );
		} else if ( response.success ) {
			
			/* Remove the deleted store row */
			setTimeout( function() {
				$parentTr.fadeOut( "200", function() {
					$parentTr.remove();
					
					/* Update the remaining store count */
					updateStoreCount();
				});
			}, 2000);			
		}
	});	
}

$( ".wpsl-marker-list input[type=radio]" ).click( function() {
	$(this).parents( ".wpsl-marker-list" ).find( "li" ).removeClass();
	$(this).parent( "li" ).addClass( "wpsl-active-marker" );
});

$( ".wpsl-marker-list li" ).click( function() {
	$(this).parents( ".wpsl-marker-list" ).find( "input" ).prop( "checked", false );
	$(this).find( "input" ).prop( "checked", true );
	$(this).siblings().removeClass();
	$(this).addClass( "wpsl-active-marker" );
});

/* Handle a click on the dismiss button. So that the warning msg that no starting point is set is disabled */
$( ".wpsl-dismiss" ).click( function() {
	var $link = $(this), 
		data = { 
			action: "disable_location_warning", 
			_ajax_nonce: $link.attr( "data-nonce" )
		};
		
	$.post( ajaxurl, data );
	
	$( "#wpbody-content #message.error" ).remove();

	return false;
});

/* Insert the preloader after the button */
function showPreloader( elem ) {
	if ( !elem.parent().find( ".wpsl-preloader" ).length ) {
		elem.after( "<img class='wpsl-preloader' src='" + wpsl_data.url + "img/ajax-loader.gif' />" );
	}
}

/* Detect changes for the 'More info' option on the settings page */
$( "#wpsl-more-info" ).on( "change", function() {
	$( "#wpsl-more-info-options" ).toggle();
});

/* Detect changes to the store template dropdown. If the template is selected to 
 * show the store list under the map then we show the option to hide the scrollbar.
 */
$( "#wpsl-store-template" ).on( "change", function() {
	var $scrollOption = $( "#wpsl-store-below-scroll" );
	
	if ( $( "#wpsl-store-template" ).val() == "1" ) {
		$scrollOption.show();
	} else {
		$scrollOption.hide();
	}
});

/* If the marker cluster checkbox changes, show/hide the options */
$( "#wpsl-marker-clusters" ).on( "change", function() {
	$( ".wpsl-cluster-options" ).toggle();
});

/**
 * When a store is deleted, update the store count that is 
 * shown above and below the store overview list
 * 
 * @since 1.2.20
 * @return void
 */
function updateStoreCount() {
	var pageNum = $( ".tablenav.top .displaying-num" ).text(),
		pageNum = pageNum.split( " " );
	
	if ( !isNaN( parseInt( pageNum[0] ) ) ) {
		$( ".tablenav .displaying-num" ).text( pageNum[0]-1 + ' ' + pageNum[1] );
	}
}

/* Load the map */
if ( $( "#wpsl-gmap-wrap" ).length ) {
	google.maps.event.addDomListener( window, "load", initializeGmap );
}
                
});