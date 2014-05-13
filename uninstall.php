<?php
if ( !defined( 'ABSPATH' ) && !defined( 'WP_UNINSTALL_PLUGIN ') ) {
	exit;
}

/* Check if we need to run the uninstall for a single or mu installation */
if ( !is_multisite() ) {
    wpsl_uninstall();
} else {

    global $wpdb;
    
    $blog_ids = $wpdb->get_col( "SELECT blog_id FROM $wpdb->blogs" );
    $original_blog_id = get_current_blog_id();
    
    foreach ( $blog_ids as $blog_id ) {
        switch_to_blog( $blog_id );
        wpsl_uninstall();  
    }
    
    switch_to_blog( $original_blog_id );
}

/* Delete the tables and options from the db  */
function wpsl_uninstall() {
	
	global $wpdb, $current_user;
    
	$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'wpsl_stores' );

	delete_option( 'wpsl_version' );
	delete_option( 'wpsl_settings' );

    delete_user_meta( $current_user->ID, 'wpsl_disable_location_warning' );
    delete_user_meta( $current_user->ID, 'wpsl_stores_per_page' );
}