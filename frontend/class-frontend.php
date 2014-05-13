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

            $this->add_frontend_scripts();

            $template_list = $this->get_templates();
            $output        = require_once( $template_list[ absint( $this->settings['template_id'] ) ]['path'] );    
            
            return $output;
		}
        
        /**
         * Create the css rules based on the height / max-width that is set on the settings page
         *
         * @since 1.0
         * @return string $css The custom css rules
         */
		public function get_custom_css() {	
			$css  = '<style>' . "\r\n";
			
            if ( ( $this->settings['template_id'] == '1' ) && ( $this->settings['store_below_scroll'] == '1' ) ) {
                $css .= "#wpsl-gmap {height:" . esc_attr( $this->settings['height'] ) . "px !important;}" . "\r\n"; 
                $css .= "#wpsl-stores, #wpsl-direction-details {height:auto !important;}";
            } else {
                $css .= "#wpsl-stores, #wpsl-direction-details, #wpsl-gmap {height:" . esc_attr( $this->settings['height'] ) . "px !important;}" . "\r\n";  
            }
        
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
            
            $dropdown_list = '';
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
            
            $api_data = '';
			$api_attributes = array( 'language', 'key', 'region' );

			foreach ( $api_attributes as $api_key ) {
				if ( !empty( $this->settings['api_'.$api_key] ) ) {
					$api_data .= '&'.$api_key.'=' . $this->settings['api_'.$api_key];	
				}	
			}

			return apply_filters( 'wpsl_gmap_api_attributes', $api_data );
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
         * Get the default values for the max_results and the search_radius dropdown
         *
         * @since 1.0.2
         * @return array $output The default dropdown values
         */
        public function get_dropdown_defaults() {
            
            $required_defaults = array( 
                "max_results",
                "search_radius" 
            );
            
            /* Strip out the default values that are wrapped in ( ) */
            foreach ( $required_defaults as $required_default ) {
                preg_match_all('/\(([0-9]+?)\)/', $this->settings[$required_default], $match, PREG_PATTERN_ORDER );
                $output[$required_default] = $match[1][0];
            }

            return $output;
        }
        
        /**
         * Load the front-end scripts and localize the required js data 
         *
         * @since 1.0
         * @return void
         */
		public function add_frontend_scripts() {
			wp_enqueue_style( 'wpsl-css', WPSL_URL . 'css/styles.css', false );
            wp_enqueue_script( 'wpsl-dropdown', WPSL_URL.'js/jquery.easydropdown.min.js', array( 'jquery' ) ); //not minified version is in the js folder
            wp_enqueue_script( 'wpsl-gmap', ( "//maps.google.com/maps/api/js?sensor=false".$this->get_gmap_api_attributes() ),'' ,'' ,true );
            
            if ( $this->settings['marker_clusters'] ) {  
                wp_enqueue_script( 'wpsl-cluster', WPSL_URL . 'js/markerclusterer.min.js' ); //not minified version is in the /js folder
            }
            
            wp_enqueue_script( 'wpsl-js', WPSL_URL.'js/wpsl-gmap.js', array( 'jquery' ) );
            
            $dropdown_defaults = $this->get_dropdown_defaults();
            
			$settings = array(
                'startMarker'       => $this->create_retina_filename( $this->settings['start_marker'] ),
                'storeMarker'       => $this->create_retina_filename( $this->settings['store_marker'] ),
                'markerClusters'    => $this->settings['marker_clusters'],
				'autoLocate'        => $this->settings['auto_locate'],
                'autoLoad'          => $this->settings['auto_load'],
				'mapType'           => $this->settings['map_type'],
				'zoomLevel'         => $this->settings['zoom_level'],
				'zoomLatlng'        => $this->settings['zoom_latlng'],
				'streetView'        => $this->settings['streetview'],
                'panControls'       => $this->settings['pan_controls'],
				'controlPosition'   => $this->settings['control_position'],
				'controlStyle'      => $this->settings['control_style'],
				'markerBounce'      => $this->settings['marker_bounce'],
                'newWindow'         => $this->settings['new_window'],
                'resetMap'          => $this->settings['reset_map'],
                'directionRedirect' => $this->settings['direction_redirect'],
                'moreInfo'          => $this->settings['more_info'],
                'storeUrl'          => $this->settings['store_url'],
                'phoneUrl'          => $this->settings['phone_url'],
                'moreInfoLocation'  => $this->settings['more_info_location'],
                'mouseFocus'        => $this->settings['mouse_focus'],
                'templateId'        => $this->settings['template_id'],
                'markerStreetView'  => $this->settings['marker_streetview'],
                'markerZoomTo'      => $this->settings['marker_zoom_to'],
                'maxResults'        => $dropdown_defaults['max_results'],
                'searchRadius'      => $dropdown_defaults['search_radius'],
				'distanceUnit'      => $this->settings['distance_unit'],
				'ajaxurl'           => admin_url( 'admin-ajax.php' ),
				'path'              => WPSL_URL,
			);
            
            /* If the marker clusters are enabled, include the required script and setting values */
            if ( $this->settings['marker_clusters'] ) {                
                $settings['clusterZoom'] = $this->settings['cluster_zoom'];
                $settings['clusterSize'] = $this->settings['cluster_size'];
            }
            
            /* The __( string, 'wpsl' ) makes the labels accessible in wpml */
			$labels = array( 
				'preloader'         => stripslashes( __( $this->settings['preloader_label'], 'wpsl' ) ),
				'noResults'         => stripslashes( __( $this->settings['no_results_label'], 'wpsl' ) ),
                'moreInfo'          => stripslashes( __( $this->settings['more_label'], 'wpsl' ) ),
				'generalError'      => stripslashes( __( $this->settings['error_label'], 'wpsl' ) ),
				'queryLimit'        => stripslashes( __( $this->settings['limit_label'], 'wpsl' ) ),
				'directions'        => stripslashes( __( $this->settings['directions_label'], 'wpsl' ) ),
                'noDirectionsFound' => stripslashes( __( $this->settings['no_directions_label'], 'wpsl' ) ),
				'phone'             => stripslashes( __( $this->settings['phone_label'], 'wpsl' ) ),
				'fax'               => stripslashes( __( $this->settings['fax_label'], 'wpsl' ) ),
				'hours'             => stripslashes( __( $this->settings['hours_label'], 'wpsl' ) ),
                'startPoint'        => stripslashes( __( $this->settings['start_label'], 'wpsl' ) ),
                'back'              => stripslashes( __( $this->settings['back_label'], 'wpsl' ) ),
                'streetView'        => stripslashes( __( $this->settings['street_view_label'], 'wpsl' ) ),
                'zoomHere'          => stripslashes( __( $this->settings['zoom_here_label'], 'wpsl' ) )
			);			

			wp_localize_script( 'wpsl-js', 'wpslSettings', $settings );
			wp_localize_script( 'wpsl-js', 'wpslLabels', $labels );
		}

    }

new WPSL_Frontend;

}