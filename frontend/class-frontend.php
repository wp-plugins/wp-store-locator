<?php
/**
 * Frontend class
 *
 * @package     WP_Store_locator
 * @subpackage  Classes/Frontend
 * @copyright   Copyright (c) 2013, Tijmen Smit
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @since       1.0
*/

if ( ! defined( 'ABSPATH' ) ) exit;

if ( !class_exists( 'WPSL_Frontend' ) ) {
    /**
    * Handle the frontend of the store locator
    *
    * @since 1.0
    */
    class WPSL_Frontend extends WP_Store_locator {

        /**
         * Class constructor
         */
		public function __construct() {               
			add_shortcode( 'wpsl', array( $this, 'render_store_locator' ) );
            $this->settings = $this->get_settings();
		}

        /**
         * Load the required front-end template and scripts
         *
         * @since 1.0
         * @return void
         */
		public function render_store_locator() {			            
			require_once( WPSL_PLUGIN_DIR . 'frontend/templates/default.php' );	
			$this->add_frontend_scripts();
		}
        
        /**
         * Create the css rules based on the height / max-width that is set on the settings page
         *
         * @since 1.0
         * @return string $css The custom css rules
         */
		public function get_custom_css() {	
			$css  = '<style>' . "\r\n";
			$css .= "#wpsl-stores, #wpsl-direction-details, #wpsl-gmap {height:" . esc_attr( $this->settings['height'] ) . "px !important;}" . "\r\n";
            $css .= "#wpsl-gmap .wpsl-info-window {max-width:" . esc_attr( $this->settings['infowindow_width'] ) . "px !important;}" . "\r\n";
            $css .= ".wpsl-input label, #wpsl-radius label {width:" . esc_attr( $this->settings['label_width'] ) . "px;}" . "\r\n";
            $css .= "#wpsl-search-input {width:" . esc_attr( $this->settings['search_width'] ) . "px !important;}" . "\r\n";
            $css .= '</style>' . "\r\n";

			return $css;
		}
        
        /**
         * Collect all the attributes (language, key, region) 
         * we need before making a request to the Google Maps API 
         *
         * @since 1.0
         * @param string The name of the list we need to load data for
         * @return string $dropdown_list A list with the available options for the dropdown list
         */
        public function get_dropdown_list( $list_type ) {
            
			$settings = explode( ',', $this->settings[$list_type] );
            
            /* Only show the distance unit when we are dealing with the search radius */
            if ( $list_type == 'search_radius' ) {
                $distance_unit = ' '. esc_attr( $this->settings['distance_unit'] );
            } else {
                $distance_unit = '';
            }

			foreach ( $settings as $k => $setting_value ) {

				/* The default radius has a () wrapped around it, so we check for that and filter out the () */
				if ( strpos( $setting_value, '(' ) !== false ) {
					$setting_value = filter_var( $setting_value, FILTER_SANITIZE_NUMBER_INT );
					$selected = 'selected="selected"';
				} else {
					$selected = '';
				}	

				$dropdown_list .= '<option ' . $selected . ' value="'. absint( $setting_value ) .'">'. absint( $setting_value ) . $distance_unit .'</option>';
			}	

			return $dropdown_list;		
		}

        /**
         * Collect all the attributes (language, key, region) 
         * we need before making a request to the Google Maps API 
         *
         * @since 1.0
         * @return string $api_data The collected api attributes
         */
		public function get_gmap_api_attributes() {
            
			$api_attributes = array( 'language', 'key', 'region' );

			foreach ( $api_attributes as $api_key ) {
				if ( !empty( $this->settings['api_'.$api_key] ) ) {
					$api_data .= '&'.$api_key.'=' . $this->settings['api_'.$api_key];	
				}	
			}

			return $api_data;
		}
        
        /**
         * Create a filename with @2x in it for the selected marker color. 
         * So when a user selected green.png in the admin panel. The js on the front-end will end up 
         * loading green@2x.png to provide support for retina compatible devices. 
         *
         * @since 1.0
         * @param string $filename The name of the seleted marker
         * @return string $filename The filename with @2x added to the end
         */
        public function create_retina_filename( $filename ) {
            
            $filename = explode( '.', $filename );
            $filename = $filename[0] . '@2x.' . $filename[1];
            
            return $filename;
        }

        /**
         * Load the front-end scripts and localize the required js data 
         *
         * @since 1.0
         * @return void
         */
		public function add_frontend_scripts( ) {
			wp_enqueue_style( 'wpsl-css', WPSL_URL . 'css/styles.css', false );
            wp_enqueue_script( 'wpsl-dropdown', WPSL_URL.'js/jquery.easydropdown.min.js', array( 'jquery' ) ); //not minified version is in the js folder
			wp_enqueue_script( 'wpsl-gmap', ( "//maps.google.com/maps/api/js?sensor=false".$this->get_gmap_api_attributes() ),'' ,'' ,true );
			wp_enqueue_script( 'wpsl-js', WPSL_URL.'js/wpsl-gmap.js', array( 'jquery' ) );

			$settings = array(
                'startMarker'     => $this->create_retina_filename( $this->settings['start_marker'] ),
                'storeMarker'     => $this->create_retina_filename( $this->settings['store_marker'] ),
				'autoLocate'      => $this->settings['auto_locate'],
				'mapType'         => $this->settings['map_type'],
				'zoomLevel' 	  => $this->settings['zoom_level'],
				'zoomLatlng' 	  => $this->settings['zoom_latlng'],
				'streetView' 	  => $this->settings['streetview'],
                'panControls' 	  => $this->settings['pan_controls'],
				'controlPosition' => $this->settings['control_position'],
				'controlStyle' 	  => $this->settings['control_style'],
				'markerBounce' 	  => $this->settings['marker_bounce'],
				'distanceUnit'    => ucfirst( $this->settings['distance_unit'] ),
				'ajaxurl'         => admin_url( 'admin-ajax.php' ),
				'path'		      => WPSL_URL,
			);

			$labels = array( 
				'preloader'    => $this->settings['preloader_label'],
				'noResults'    => $this->settings['no_results_label'],
				'generalError' => $this->settings['error_label'],
				'queryLimit'   => $this->settings['limit_label'],
				'directions'   => $this->settings['directions_label'],
				'phone'        => $this->settings['phone_label'],
				'fax'          => $this->settings['fax_label'],
				'hours'        => $this->settings['hours_label'],
                'startPoint'   => $this->settings['start_label']
			);			

			wp_localize_script( 'wpsl-js', 'wpslSettings', $settings );
			wp_localize_script( 'wpsl-js', 'wpslLabels', $labels );
		}

    }

new WPSL_Frontend;

}