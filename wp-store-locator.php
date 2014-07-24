<?php
/*
Plugin Name: WP Store Locator
Plugin URI: 
Description: An easy to use location management system that enables users to search for nearby physical stores
Author: Tijmen Smit
Author URI: http://tijmensmit.com/
Version: 1.2.23
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
        public $default_settings = array();        
        
        /**
         * Class constructor
         */          
        function __construct() {
            
            $this->define_constants();
            $this->define_tables();
               
            if ( is_admin() ) {
                require_once( WPSL_PLUGIN_DIR . 'admin/class-admin.php' );
                require_once( WPSL_PLUGIN_DIR . 'admin/misc-functions.php' );
                
                load_plugin_textdomain( 'wpsl', false, basename( dirname( __FILE__ ) ) . '/languages' );
                
                register_activation_hook( __FILE__, array( $this, 'run_install' ) );
                
                $this->default_settings = $this->get_default_settings();
            } else {         
                require_once( WPSL_PLUGIN_DIR . 'frontend/class-frontend.php' );
            } 
            
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
                define( 'WPSL_VERSION_NUM', '1.2.23' );

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
         * @since 1.2.20
         * @return void
         */
        public function run_install( $network_wide ) {
            
            global $wpdb;
            
            if ( function_exists( 'is_multisite' ) && is_multisite() ) {
                
                if ( $network_wide ) {
                    $blog_ids = $wpdb->get_col( "SELECT blog_id FROM $wpdb->blogs" );

                    foreach ( $blog_ids as $blog_id ) {
                        switch_to_blog( $blog_id );
                        $this->define_tables();
                        $this->install_data();
                    }

                    restore_current_blog();     
                } else {
                    $this->install_data();
                }
            } else {
                $this->install_data();
            }
        }
        
        /**
         * Create the required db and install the default settings and options values
         *
         * @since 1.2.20
         * @return void
         */
        public function install_data() {
                        
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
									 address varchar(255) NULL,
                                     address2 varchar(255) NULL,
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
         * Get the default plugin settings
         *
         * @since 1.0
         * @return void
         */
		public function get_default_settings() {
            
            $default_settings = array (
                'api_key' 		      => '',
                'api_language'        => 'en',
                'api_region' 	      => '',
                'distance_unit'       => 'km',
                'max_results' 	      => '(25),50,75,100',
                'search_radius'       => '10,25,(50),100,200,500',
                'marker_bounce'       => '1',
                'auto_locate' 	      => '1',
                'auto_load'           => '1',
                'zoom_level' 	      => '3',
                'zoom_name' 	      => '',
                'zoom_latlng' 	      => '',
                'height' 		      => '350',
                'map_type'            => 'roadmap',
                'pan_controls'        => '0',
                'streetview' 	      => '0',
                'results_dropdown'    => '1',
                'infowindow_width'    => '225',
                'search_width'        => '179',
                'label_width'         => '95',
                'control_position'    => 'left',
                'control_style'       => 'small',
                'marker_clusters'     => '0',
                'cluster_zoom'        => '0',
                'cluster_size'        => '0',
                'new_window'          => '0',
                'reset_map'           => '0',
                'template_id'         => '0',
                'store_below_scroll'  => '0',
                'direction_redirect'  => '0',
                'more_info'           => '0',
                'store_url'           => '0',
                'phone_url'           => '0',
                'marker_streetview'   => '0',
                'marker_zoom_to'      => '0',
                'more_info_location'  => 'info window',
                'mouse_focus'         => '1',
                'start_marker'        => 'red.png',
                'store_marker'        => 'blue.png',
                'editor_country'      => '',
                'start_label'         => __( 'Start location', 'wpsl' ),
                'search_label'        => __( 'Your location', 'wpsl' ),
                'search_btn_label'    => __( 'Search', 'wpsl' ),
                'preloader_label'     => __( 'Searching...', 'wpsl' ),
                'radius_label'        => __( 'Search radius', 'wpsl' ),
                'no_results_label'    => __( 'No results found', 'wpsl' ),
                'results_label'       => __( 'Results', 'wpsl' ),
                'more_label'          => __( 'More info', 'wpsl' ),
                'directions_label'    => __( 'Directions', 'wpsl' ),
                'no_directions_label' => __( 'No route could be found between the origin and destination', 'wpsl' ),
                'back_label'          => __( 'Back', 'wpsl' ),
                'reset_label'         => __( 'Reset', 'wpsl' ),
                'street_view_label'   => __( 'Street view', 'wpsl' ),
                'zoom_here_label'     => __( 'Zoom here', 'wpsl' ),
                'error_label'         => __( 'Something went wrong, please try again!', 'wpsl' ),
                'limit_label'         => __( 'API usage limit reached', 'wpsl' ),
                'phone_label'         => __( 'Phone', 'wpsl' ),
                'fax_label'           => __( 'Fax', 'wpsl' ),
                'hours_label'         => __( 'Hours', 'wpsl' )
            ); 
            
            return $default_settings;
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
        
        /**
         * Return a list of the default store templates
         * 
         * @since 1.2.20
         * @return array $templates The list of default store templates
         */
        public function get_templates() {
            
            $templates = array (
                array (
                    'name' => __( 'Default', 'wpsl' ), 
                    'path' => WPSL_PLUGIN_DIR . 'frontend/templates/default.php'
                ), 
                array (
                    'name' => __( 'Show the store list below the map', 'wpsl' ), 
                    'path' => WPSL_PLUGIN_DIR . 'frontend/templates/store-listings-below.php'
                )
            );
            
            return apply_filters( 'wpsl_templates', $templates );
        }
        
	}
	
	$wpsl = new WP_Store_locator();
}