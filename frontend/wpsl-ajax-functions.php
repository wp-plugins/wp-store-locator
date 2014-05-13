<?php
add_action( 'wp_ajax_store_search', 'wpsl_store_search' );
add_action( 'wp_ajax_nopriv_store_search', 'wpsl_store_search' );
            
/**
 * Handle the ajax store search on the frontend.
 * 
 * Search for stores that fall within the selected distance range. 
 * This happens by calculating the distance between the latlng of the starting point 
 * and the latlng from the stores.
 * 
 * @since 1.0
 * @return json The list of stores in $store_results that matches with the request or false if the query returns no results
 */
function wpsl_store_search() {
    
    global $wpdb;

    $options       = get_option( 'wpsl_settings' );
    $distance_unit = ( $options['distance_unit'] == 'km' ) ? '6371' : '3959'; 
    
    /* Check if we need to include the distance and radius limit in the sql query. 
     * If autoload is enabled we load all stores, so no limits required. 
     */
    if ( isset( $_GET['autoload'] ) && ( $_GET['autoload'] == 1 ) ) {
        $sql_part = ' ORDER BY distance';
        $placeholders = array(
             $_GET["lat"], 
             $_GET["lng"], 
             $_GET["lat"]
         );
    } else {
        $max_results = ( isset( $_GET['max_results'] ) ) ? $_GET['max_results'] : '';
    
        if ( ( $max_results == 'NaN' ) || ( !$max_results ) ) {
            $max_results = get_default_list_value( $type = 'max_results' );   
        }
        
        $sql_part = ' HAVING distance < %d ORDER BY distance LIMIT 0, %d';
        $placeholders = array(
            $_GET["lat"], 
            $_GET["lng"], 
            $_GET["lat"],
            $_GET["radius"], 
            $max_results
        );  
    }

    $result = $wpdb->get_results( 
                    $wpdb->prepare( "
                                    SELECT *, ( $distance_unit * acos( cos( radians( %s ) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians( %s ) ) + sin( radians( %s ) ) * sin( radians( lat ) ) ) ) 
                                    AS distance FROM $wpdb->wpsl_stores WHERE active = 1
                                    $sql_part
                                    ",
                                    $placeholders
                    ) 
                );
    
    if ( $result === false ) {
		wp_send_json_error();
    } else {
		$store_results = array();

		foreach ( $result as $k => $v ) {
			/* If we have a valid thumb id, get the src */
			if ( absint ( $result[$k]->thumb_id ) ) {
				$thumb_src = wp_get_attachment_image_src( $result[$k]->thumb_id );
				$result[$k]->thumb_src = $thumb_src[0];
			} else {
				$result[$k]->thumb_src = '';
			}

			/* Sanitize the results before they are returned */
			$store_results[] = array (
				'id'          => absint( $result[$k]->wpsl_id ),
				'store'       => sanitize_text_field( stripslashes( $result[$k]->store ) ),
				'address'     => sanitize_text_field( stripslashes( $result[$k]->address ) ),
                'address2'    => sanitize_text_field( stripslashes( $result[$k]->address2 ) ),
				'city'        => sanitize_text_field( stripslashes( $result[$k]->city ) ),
				'state'       => sanitize_text_field( stripslashes( $result[$k]->state ) ),
				'zip'         => sanitize_text_field( stripslashes( $result[$k]->zip ) ),
				'country'     => sanitize_text_field( stripslashes( $result[$k]->country ) ),	
				'distance'    => $result[$k]->distance,
				'lat'         => $result[$k]->lat,
				'lng'         => $result[$k]->lng,
				'description' => wpautop( strip_tags( stripslashes( $result[$k]->description ) ) ),	
				'phone'       => sanitize_text_field( stripslashes( $result[$k]->phone ) ),	
				'fax'         => sanitize_text_field( stripslashes( $result[$k]->fax ) ),
				'email'       => sanitize_email( $result[$k]->email ),	
				'hours'       => wpautop( strip_tags( stripslashes( $result[$k]->hours ) ) ),
				'url'         => esc_url( $result[$k]->url ),
    			'thumb'       => esc_url( $result[$k]->thumb_src )	
			);
		}

		wp_send_json( $store_results );	
    }

    die();
}
            
/**
 * Get the default selected value for a dropdown
 * 
 * @since 1.0
 * @param string $type The request list type
 * @return string $response The default list value
 */
function get_default_list_value( $type ) {

    $settings    = get_option( 'wpsl_settings' );
    $list_values = explode( ',', $settings[$type] );

    foreach ( $list_values as $k => $list_value ) {

        /* The default radius has a () wrapped around it, so we check for that and filter out the () */
        if ( strpos( $list_value, '(' ) !== false ) {
            $response = filter_var( $list_value, FILTER_SANITIZE_NUMBER_INT );
            break;
        }
    }	

    return $response;		
}