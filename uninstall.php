<?php
if ( !defined( 'ABSPATH' ) && !defined( 'WP_UNINSTALL_PLUGIN ') ) {
	exit;
}

function wpsl_uninstall() {
	
	global $wpdb;

	$wpdb->query( 'DROP TABLE IF EXISTS ' . $wpdb->prefix . 'wpsl_stores' );

	delete_option( 'wpsl_version' );
	delete_option( 'wpsl_settings' );
	
}

/* Delete the tables and options from the db  */
wpsl_uninstall();
?>