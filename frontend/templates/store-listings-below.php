<?php 
$output = $this->get_custom_css(); 

$show_results_filter = $this->settings['results_dropdown'];
$results_filter_class = ( $show_results_filter ) ? '' : 'wpsl-no-results';

$output .= '<div id="wpsl-wrap" class="wpsl-store-below">' . "\r\n";
$output .= '<div class="wpsl-search clearfix ' . $results_filter_class . '">' . "\r\n";
$output .= '<div id="wpsl-search-wrap">' . "\r\n";
$output .= '<div class="wpsl-input">' . "\r\n";
$output .= '<div><label for="wpsl-search-input">' . esc_html_x( stripslashes( $this->settings['search_label'] ), 'wpsl' ) . '</label></div>' . "\r\n";
$output .= '<input autocomplete="off" id="wpsl-search-input" type="text" value="" name="wpsl-search-input" />' . "\r\n";
$output .= '</div>' . "\r\n";
$output .= '<div class="wpsl-select-wrap">' . "\r\n";
$output .=      '<div id="wpsl-radius">' . "\r\n";
$output .=          '<label for="wpsl-radius-label">' . esc_html_x( stripslashes( $this->settings['radius_label'] ), 'wpsl' ).'</label>' . "\r\n";
$output .=          '<select autocomplete="off" id="wpsl-radius-label" class="wpsl-dropdown" name="wpsl-radius">' . "\r\n";
$output .=              $this->get_dropdown_list( 'search_radius' );
$output .=          '</select>' . "\r\n";
$output .=      '</div>' . "\r\n";

if ( $show_results_filter ) {
    $output .=          '<div id="wpsl-results">' . "\r\n";
    $output .=              '<label for="wpsl-results-label">' . esc_html_x( stripslashes( $this->settings['results_label'] ), 'wpsl' ) . '</label>' . "\r\n";
    $output .=              '<select autocomplete="off" id="wpsl-results-label" class="wpsl-dropdown" name="wpsl-results">' . "\r\n";
    $output .=                  $this->get_dropdown_list( 'max_results' );
    $output .=              '</select>' . "\r\n";
    $output .=          '</div>' . "\r\n";
} 

$output .=      '<div><input id="wpsl-search-btn" type="submit" value='. esc_attr_x( stripslashes( $this->settings['search_btn_label'] ), 'wpsl' ) . '></div>' . "\r\n";
$output .=      '</div>' . "\r\n";
$output .=   '</div>' . "\r\n";
$output .= '</div>' . "\r\n";
    
if ( $this->settings['reset_map'] ) { 
    
    /* If the control position is set to right, we need to adjust to right space to make sure it doesn't cover map controls.  */
    if ( $this->settings['control_position'] == 'right' ) {
        $align_class = 'class="wpsl-right-controls"';
    } else {
        $align_class = '';
    }
    
    $output .= '<div class="wpsl-gmap-wrap">' . "\r\n";
    $output .= '<div id="wpsl-reset-map" ' . $align_class . '>' . esc_html_x( stripslashes( $this->settings['reset_label'] ), 'wpsl' ) . '</div>' . "\r\n";
    $output .= '<div id="wpsl-gmap"></div>' . "\r\n";
    $output .= '</div>' . "\r\n";
} else {
    $output .= '<div id="wpsl-gmap"></div>' . "\r\n";
}

$output .= '<div id="wpsl-result-list">' . "\r\n";
$output .=      '<div id="wpsl-stores">' . "\r\n";
$output .=          '<ul></ul>' . "\r\n";
$output .=      '</div>' . "\r\n";
$output .=      '<div id="wpsl-direction-details">' . "\r\n";
$output .=          '<ul></ul>' . "\r\n";
$output .=      '</div>' . "\r\n";
$output .= '</div>' . "\r\n";

$output .= '</div>' . "\r\n";

return $output;