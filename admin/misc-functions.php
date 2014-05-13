<?php
add_action( 'plugins_loaded', 'add_wpsl_screen_filter' );

/**
 * Add the filter to save the visible store value
 * 
 * @since 1.2.20
 * @return void
 */
function add_wpsl_screen_filter() {
    add_filter( 'set-screen-option', 'set_wpsl_screen_option', 10, 3 );
}

/**
 * Save the wpsl screen options
 * 
 * Users can define the amount of visible stores
 *
 * @since 1.2.20
 * @param bool|int $status  Screen option value. Default false to skip.
 * @param string   $option The option name.
 * @param int      $value  The number of rows to use.
 * @return bool|int $value|$status
 */ 
function set_wpsl_screen_option( $status, $option, $value ) {
    
    if ( 'wpsl_stores_per_page' == $option ) return $value;
 
    return $status;
}