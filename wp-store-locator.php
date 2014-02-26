<?php
/*
Plugin Name: WP Store Locator
Plugin URI: 
Description: An easy to use location management system that enables users to search for nearby physical stores
Author: Tijmen Smit
Author URI: http://tijmensmit.com/
Version: 1.2.13
Text Domain: wpsl
Domain Path: /languages/
License: GPLv3

WP Store Locator
Copyright (C)2013, Tijmen Smit - info@tijmensmit.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
  
@package WP_Store_locator
@category Core
@author Tijmen Smit
@version 1.0
*/

if ( !class_exists( 'WP_Store_locator' ) ) {		

	class WP_Store_locator {
        
       /**
	   * Stores the current plugin settings
       * @since 1.0
	   * @var array
	   */
        public $settings = array();
        
        /**
        * Stores the default plugin settings
        * @since 1.0
        * @var array
        */
        public $default_settings = array(
            'api_key' 		     => '',
            'api_language'       => 'en',
            'api_region' 	     => '',
            'distance_unit'      => 'km',
            'max_results' 	     => '(25),50,75,100',
            'search_radius'      => '10,25,(50),100,200,500',
            'marker_bounce'      => '1',
            'auto_locate' 	     => '1',
            'auto_load'          => '1',
            'zoom_level' 	     => '3',
            'zoom_name' 	     => '',
            'zoom_latlng' 	     => '',
            'height' 		     => '350',
            'map_type'           => 'roadmap',
            'pan_controls'       => '0',
            'streetview' 	     => '0',
            'results_dropdown'   => '1',
            'infowindow_width'   => '225',
            'search_width'       => '179',
            'label_width'        => '95',
            'control_position'   => 'left',
            'control_style'      => 'small',
            'new_window'         => '0',
            'reset_map'          => '0',
            'store_below'        => '0',
            'store_below_scroll' => '0',
            'direction_redirect' => '0',
            'more_info'          => '0',
            'more_info_location' => 'info window',
            'mouse_focus'        => '1',
            'start_marker'       => 'red.png',
            'store_marker'       => 'blue.png',
            'start_label'        => 'Start location',
            'search_label'       => 'Your location',
            'search_btn_label'   => 'Search',
            'preloader_label'    => 'Searching...',
            'radius_label'       => 'Search radius',
            'no_results_label'   => 'No results found',
            'results_label'      => 'Results',	
            'more_label'         => 'More info',	
            'directions_label'   => 'Directions',
            'back_label'         => 'Back',
            'reset_label'        => 'Reset',
            'error_label'        => 'Something went wrong, please try again!',
            'limit_label'        => 'API usage limit reached',
            'phone_label'        => 'Phone',
            'fax_label'          => 'Fax',
            'hours_label'        => 'Hours'
        );        
        
        /**
         * Class constructor
         */          
        function __construct() {

            $this->define_constants();
            $this->define_tables();
                   
            if ( is_admin() ) {
                require_once( WPSL_PLUGIN_DIR . 'admin/class-admin.php' );
                
                load_plugin_textdomain( 'wpsl', false, basename( dirname( __FILE__ ) ) . '/languages' );

                register_activation_hook( __FILE__, array( $this, 'install' ) );
            } else {         
                require_once( WPSL_PLUGIN_DIR . 'frontend/class-frontend.php' );
            } 
            
            //if placed in the if else together with the class-frontend, the ajax hook always fails?
            require_once( WPSL_PLUGIN_DIR . 'frontend/wpsl-ajax-functions.php' );      
        }
        
        /**
         * Setup plugin constants
         *
         * @since 1.0
         * @return void
         */
        public function define_constants() {
            
            if ( !defined( 'WPSL_VERSION_NUM' ) )
                define( 'WPSL_VERSION_NUM', '1.2.13' );

            if ( !defined( 'WPSL_URL' ) )
                define( 'WPSL_URL', plugin_dir_url( __FILE__ ) );

            if ( !defined( 'WPSL_BASENAME' ) )
                define( 'WPSL_BASENAME', plugin_basename( __FILE__ ) );

            if ( ! defined( 'WPSL_PLUGIN_DIR' ) )
                define( 'WPSL_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
        }

        private function define_tables() {
            
			global $wpdb;
		
			$wpdb->wpsl_stores = $wpdb->prefix . 'wpsl_stores';
		}
        
        /**
         * Run the install functions
         *
         * @since 1.0
         * @return void
         */
        public function install() {
            $this->create_tables();
            $this->set_default_settings();
            
            update_option( 'wpsl_version', WPSL_VERSION_NUM );
        }
                
        /**
         * Create the required tables
         *
         * @since 1.0
         * @return void
         */
		public function create_tables() {
            
			global $wpdb;
			
			$charset_collate = '';
		
			if ( !empty( $wpdb->charset ) )
				$charset_collate = "DEFAULT CHARACTER SET $wpdb->charset";
			if ( !empty( $wpdb->collate ) )
				$charset_collate .= " COLLATE $wpdb->collate";	
				
			if ( $wpdb->get_var( "SHOW TABLES LIKE '$wpdb->wpsl_stores'" ) != $wpdb->wpsl_stores ) {
				$sql = "CREATE TABLE " . $wpdb->wpsl_stores . " (
									 wpsl_id int(10) unsigned NOT NULL auto_increment,
									 store varchar(255) NULL,
									 street varchar(255) NULL,
									 city varchar(255) NULL,
									 state varchar(255) NULL,
									 zip varchar(100) NULL,
									 country varchar(255) NULL,
                                     country_iso tinytext NOT NULL,
									 lat float(10,6) NOT NULL,
									 lng float(10,6) NOT NULL,
									 description text NULL,
									 phone varchar(100) NULL,
									 fax varchar(100) NULL,
									 url varchar(255) NULL,
									 email varchar(255) NULL,
									 hours varchar(255) NULL,
									 thumb_id bigint(20) unsigned NOT NULL,
									 active tinyint(1) NULL default 1,
						PRIMARY KEY (wpsl_id)
									 ) $charset_collate;";
				require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
				dbDelta( $sql );
			}	
		}

        /**
         * Set the default pluging settings
         *
         * @since 1.0
         * @return void
         */
		public function set_default_settings() {
            
			$settings = get_option( 'wpsl_settings' );
			
			if ( !$settings ) {
                update_option( 'wpsl_settings', $this->default_settings );
			}
		}
        
        /**
         * Get the current plugin settings
         * 
         * @since 1.0
         * @return array $setting The current plugin settings
         */
        public function get_settings() {
            
            $settings = get_option( 'wpsl_settings' );

            if ( !$settings ) {
                update_option( 'wpsl_settings', $this->default_settings );
                $settings = $this->default_settings;
            }

            return $settings;
        }        
	}
	
	$wpsl = new WP_Store_locator();
}

?>