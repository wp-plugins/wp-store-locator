<?php
if ( !defined( 'ABSPATH' ) && !defined( 'WP_UNINSTALL_PLUGIN ') ) {
	exit;
}

function wpsl_uninstall() {
	
	global $wpdb;
    global $current_user;
    
	$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'wpsl_stores' );

	delete_option( 'wpsl_version' );
	delete_option( 'wpsl_settings' );

    delete_user_meta( $current_user->ID, 'wpsl_disable_location_warning' );
	
}

/* Delete the tables and options from the db  */
wpsl_uninstall();
?>