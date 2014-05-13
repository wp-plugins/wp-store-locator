<div id="wpsl-wrap" class="wrap wpsl-settings">
	<h2>WP Store Locator: <?php _e( 'Settings', 'wpsl' ); ?></h2>
    
    <?php 
    global $wpdb;
    
    settings_errors();
    
    echo $this->create_menu();
    ?>
                    
    <form id="wpsl-settings-form" method="post" action="options.php" accept-charset="utf-8">
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'API Settings', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                            <label for="wpsl-api-key"><?php _e( 'API key:', 'wpsl' ); ?> *</label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['api_key'] ); ?>" name="wpsl_api[key]" placeholder="<?php _e( 'Optional', 'wpsl' ); ?>" class="textinput" id="wpsl-api-key">
                        </p> 
                        <p>
                            <label for="wpsl-api-language"><?php _e( 'Map language:', 'wpsl' ); ?></label> 
                            <select id="wpsl-api-language" name="wpsl_api[language]">
                                <?php echo $this->get_api_option_list( 'language' ); ?>          	
                            </select>
                        </p>
                        <p>
                            <label for="wpsl-api-region"><?php _e( 'Map region:', 'wpsl' ); ?></label> 
                            <select id="wpsl-api-region" name="wpsl_api[region]">
                                <?php echo $this->get_api_option_list( 'region' ); ?>          	
                            </select>
                        </p>
                        <em><?php echo sprintf( __( '* A valid <a href="%s">API key</a> allows you to monitor the API usage <br> and is required if you need to purchase additional quota.', 'wpsl' ), 'https://developers.google.com/maps/documentation/javascript/tutorial#api_key' ); ?></em>
                    </div>        
                </div>   
            </div>  
        </div>
                
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'Search Settings', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                            <label for="wpsl-distance-unit"><?php _e( 'Distance unit:', 'wpsl' ); ?></label> 
                            <?php echo $this->show_distance_units(); ?>
                        </p>
                        <p>
                            <label for="wpsl-max-results"><?php _e( 'Max search results:', 'wpsl' ); ?> *</label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['max_results'] ); ?>" name="wpsl_search[max_results]" class="textinput" id="wpsl-max-results">
                        </p>
                        <p>
                            <label for="wpsl-search-radius"><?php _e( 'Search radius options:', 'wpsl' ); ?> *</label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['search_radius'] ); ?>" name="wpsl_search[radius]" class="textinput" id="wpsl-search-radius">
                        </p>
                        <p>
                           <label for="wpsl-bounce"><?php _e( 'If a user hovers over the search results, the corresponding marker will bounce?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['marker_bounce'], true ); ?> name="wpsl_map[marker_bounce]" id="wpsl-bounce">
                        </p>   
                        <em><?php _e( '* The default value is set between the ( )', 'wpsl' ); ?></em>
                    </div>        
                </div>   
            </div>  
        </div>
    
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'Map Settings', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                           <label for="wpsl-auto-locate"><?php _e( 'Attempt to auto-locate the user:', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['auto_locate'], true ); ?> name="wpsl_map[auto_locate]" id="wpsl-auto-locate">
                        </p>
                        <p>
                           <label for="wpsl-auto-load"><?php _e( 'Load all stores on page load:', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['auto_load'], true ); ?> name="wpsl_map[auto_load]" id="wpsl-auto-locate">
                        </p> 
                        <p>
                            <label for="wpsl-zoom-name"><?php _e( 'Start point: *', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['zoom_name'] ); ?>" name="wpsl_map[zoom_name]" class="textinput" id="wpsl-zoom-name">
                            <input type="hidden" value="<?php echo esc_attr( $this->settings['zoom_latlng'] ); ?>" name="wpsl_map[zoom_latlng]" id="wpsl-latlng" />
                        </p>
                        <p>
                            <label for="wpsl-zoom-level"><?php _e( 'Zoom level:', 'wpsl' ); ?></label> 
                            <?php echo $this->show_zoom_levels(); ?>
                        </p>
                        <p>
                            <label for="wpsl-map-type"><?php _e( 'Map type:', 'wpsl' ); ?></label> 
                            <?php echo $this->show_map_types(); ?>
                        </p>
                        <p>
                           <label for="wpsl-streetview"><?php _e( 'Show the street view controls?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['streetview'], true ); ?> name="wpsl_map[streetview]" id="wpsl-streetview">
                        </p>
                        <p>
                           <label for="wpsl-pan-controls"><?php _e( 'Show the pan controls?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['pan_controls'], true ); ?> name="wpsl_map[pan_controls]" id="wpsl-pan-controls">
                        </p> 
                        <p>
                            <label><?php _e( 'Position of the map controls:', 'wpsl' ); ?></label>
                            <span class="wpsl_radioboxes">
                                <input type="radio" value="left" <?php checked( 'left', $this->settings['control_position'], true ); ?> name="wpsl_map[control_position]" id="wpsl-control-left">
                                <label for="wpsl-control-left"><?php _e( 'Left', 'wpsl' ); ?></label>
                                <input type="radio" value="right" <?php checked( 'right', $this->settings['control_position'], true ); ?> name="wpsl_map[control_position]" id="wpsl-control-right">
                                <label for="wpsl-control-right"><?php _e( 'Right', 'wpsl' ); ?></label>
                            </span>
                        </p>
                        <p>
                            <label><?php _e( 'Zoom control style:', 'wpsl' ); ?></label>
                            <span class="wpsl_radioboxes">
                                <input type="radio" value="small" <?php checked( 'small', $this->settings['control_style'], true ); ?> name="wpsl_map[control_style]" id="wpsl-small-style">
                                <label for="wpsl-small-style"><?php _e( 'Small', 'wpsl' ); ?></label>
                                <input type="radio" value="large" <?php checked( 'large', $this->settings['control_style'], true ); ?> name="wpsl_map[control_style]" id="wpsl-large-style">
                                <label for="wpsl-large-style"><?php _e( 'Large', 'wpsl' ); ?></label>
                            </span>
                        </p>
                        <em><?php _e( '* Required field. If auto-locating the user is disabled or fails, the center of the provided city or country will be used as the initial starting point for the user.', 'wpsl' ); ?></em>
                    </div>        
                </div>   
            </div>  
        </div>
        
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'Design Settings', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                            <label for="wpsl-design-height"><?php _e( 'Store Locator height', 'wpsl' ); ?></label> 
                            <input size="3" value="<?php echo esc_attr( $this->settings['height'] ); ?>" id="wpsl-design-height" name="wpsl_design[height_value]"> px
                        </p> 
                        <p>
                            <label for="wpsl-infowindow-width"><?php _e( 'Max width for the infowindow', 'wpsl' ); ?></label> 
                            <input size="3" value="<?php echo esc_attr( $this->settings['infowindow_width'] ); ?>" id="wpsl-infowindow-width" name="wpsl_design[infowindow_width]"> px
                        </p>
                        <p>
                            <label for="wpsl-search-width"><?php _e( 'Search field width', 'wpsl' ); ?></label> 
                            <input size="3" value="<?php echo esc_attr( $this->settings['search_width'] ); ?>" id="wpsl-search-width" name="wpsl_design[search_width]"> px
                        </p>
                        <p>
                            <label for="wpsl-label-width"><?php _e( 'Search and radius label width *', 'wpsl' ); ?></label> 
                            <input size="3" value="<?php echo esc_attr( $this->settings['label_width'] ); ?>" id="wpsl-label-width" name="wpsl_design[label_width]"> px
                        </p> 
                        <p>
                           <label for="wpsl-store-template"><?php _e( 'Select template', 'wpsl' ); ?></label> 
                           <?php echo $this->show_template_options(); ?>
                        </p>
                        <p id="wpsl-store-below-scroll" <?php if ( $this->settings['template_id'] != '1' ) { echo 'style="display:none;"'; } ?>>
                            <label for="wpsl-more-info-list"><?php _e( 'Hide the scrollbar?', 'wpsl' ); ?></label>
                            <input type="checkbox" value="" <?php checked( $this->settings['store_below_scroll'], true ); ?> name="wpsl_design[store_below_scroll]" id="wpsl-store-below-scroll">
                        </p>
                        <p>
                           <label for="wpsl-design-results"><?php _e( 'Show the limit results dropdown?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['results_dropdown'], true ); ?> name="wpsl_design[design_results]">
                        </p>
                        <p>
                           <label for="wpsl-new-window"><?php _e( 'Open links in a new window?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['new_window'], true ); ?> name="wpsl_design[new_window]" id="wpsl-new-window">
                        </p>
                        <p>
                           <label for="wpsl-reset-map"><?php _e( 'Show a reset map button?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['reset_map'], true ); ?> name="wpsl_design[reset_map]" id="wpsl-reset-map">
                        </p> 
                        <p>
                           <label for="wpsl-direction-redirect"><?php _e( 'When a user clicks on "Directions", open a new window and show the route on maps.google.com', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['direction_redirect'], true ); ?> name="wpsl_design[direction_redirect]" id="wpsl-direction-redirect">
                        </p>
                        <p>
                           <label for="wpsl-more-info"><?php _e( 'Show a "More info" link in the store listings?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['more_info'], true ); ?> name="wpsl_design[more_info]" id="wpsl-more-info">
                        </p>                        
                        <p id="wpsl-more-info-options" <?php if ( $this->settings['more_info'] == '0' ) { echo 'style="display:none;"'; } ?>>
                            <label for="wpsl-more-info-list"><?php _e( 'Where do you want to show the "More info" details?', 'wpsl' ); ?></label>
                            <?php echo $this->show_more_info_options(); ?>
                        </p>
                        <p>
                           <label for="wpsl-store-url"><?php _e( 'If a store url exists, make the store name clickable?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['store_url'], true ); ?> name="wpsl_design[store_url]" id="wpsl-store-url">
                        </p>
                        <p>
                           <label for="wpsl-phone-url"><?php _e( 'Make the phone number clickable on mobile devices?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['phone_url'], true ); ?> name="wpsl_design[phone_url]" id="wpsl-phone-url">
                        </p>
                        <p>
                           <label for="wpsl-marker-streetview"><?php _e( 'If available for the current location, show a link to enable street view from the infowindow?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['marker_streetview'], true ); ?> name="wpsl_design[marker_streetview]" id="wpsl-marker-streetview">
                        </p>
                        <p>
                           <label for="wpsl-marker-zoom-to"><?php _e( 'Show a "zoom to" link in the infowindow?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['marker_zoom_to'], true ); ?> name="wpsl_design[marker_zoom_to]" id="wpsl-marker-zoom-to">
                        </p>
                        <p>
                           <label for="wpsl-mouse-focus"><?php _e( 'On pageload move the mousecursor to the input field. **', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['mouse_focus'], true ); ?> name="wpsl_design[mouse_focus]" id="wpsl-mouse-focus">
                        </p> 
                        <em><?php _e( '* This is the text that is placed before the search input and radius dropdown', 'wpsl' ); ?></em>
                        <em><?php _e( '** If the store locator is not placed at the top of the page, enabling this feature can result in the page sliding down.', 'wpsl' ); ?></em>
                    </div>        
                </div>   
            </div>  
        </div>
  
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'Markers', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <?php echo $this->show_marker_options(); ?>
                        <p>
                           <label for="wpsl-marker-clusters"><?php _e( 'Enable marker clusters? *', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['marker_clusters'], true ); ?> name="wpsl_map[marker_clusters]" id="wpsl-marker-clusters">
                        </p>
                        <p class="wpsl-cluster-options" <?php if ( !$this->settings['marker_clusters'] ) { echo 'style="display:none;"'; } ?>>
                           <label for="wpsl-marker-zoom"><?php _e( 'Max zoom level:', 'wpsl' ); ?></label> 
                           <?php echo $this->show_cluster_options( 'cluster_zoom' ); ?>
                        </p>
                        <p class="wpsl-cluster-options" <?php if ( !$this->settings['marker_clusters'] ) { echo 'style="display:none;"'; } ?>>
                           <label for="wpsl-marker-cluster-size"><?php _e( 'Cluster size:', 'wpsl' ); ?></label> 
                           <?php echo $this->show_cluster_options( 'cluster_size' ); ?>
                        </p>
                       <em><?php _e( '* Recommended for maps with a large amounts of markers.', 'wpsl' ); ?></em>
                    </div>
                </div>   
            </div>  
        </div>
        
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'Store Editor Settings', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                            <label for="wpsl-editor-country"><?php _e( 'Default country that will be used on the "Add Store" page.', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['editor_country'] ) ); ?>" name="wpsl_editor[default_country]" class="textinput" id="wpsl-editor-country">
                        </p>
                    </div>        
                </div>   
            </div>  
        </div>
        
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'Labels', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                            <label for="wpsl-search"><?php _e( 'Your location:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['search_label'] ) ); ?>" name="wpsl_label[search]" class="textinput" id="wpsl-search">
                        </p>
                        <p>
                            <label for="wpsl-search-radius"><?php _e( 'Search radius:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['radius_label'] ) ); ?>" name="wpsl_label[radius]" class="textinput" id="wpsl-search-radius">
                        </p>
                        <p>
                            <label for="wpsl-no-results"><?php _e( 'No results found:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['no_results_label'] ) ); ?>" name="wpsl_label[no_results]" class="textinput" id="wpsl-no-results">
                        </p>
                        <p>
                            <label for="wpsl-search-btn"><?php _e( 'Search:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['search_btn_label'] ) ); ?>" name="wpsl_label[search_btn]" class="textinput" id="wpsl-search-btn">
                        </p>
                        <p>
                            <label for="wpsl-preloader"><?php _e( 'Searching (preloader text):', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['preloader_label'] ) ); ?>" name="wpsl_label[preloader]" class="textinput" id="wpsl-preloader">
                        </p>
                        <p>
                            <label for="wpsl-results"><?php _e( 'Results:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['results_label'] ) ); ?>" name="wpsl_label[results]" class="textinput" id="wpsl-results">
                        </p>
                        <p>
                            <label for="wpsl-more-info"><?php _e( 'More info:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['more_label'] ) ); ?>" name="wpsl_label[more]" class="textinput" id="wpsl-more-info">
                        </p>
                        <p>
                            <label for="wpsl-phone"><?php _e( 'Phone:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['phone_label'] ) ); ?>" name="wpsl_label[phone]" class="textinput" id="wpsl-phone">
                        </p>                        
                        <p>
                            <label for="wpsl-fax"><?php _e( 'Fax:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['fax_label'] ) ); ?>" name="wpsl_label[fax]" class="textinput" id="wpsl-fax">
                        </p>
                        <p>
                            <label for="wpsl-hours"><?php _e( 'Hours:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['hours_label'] ) ); ?>" name="wpsl_label[hours]" class="textinput" id="wpsl-hours">
                        </p>
                        <p>
                            <label for="wpsl-start"><?php _e( 'Start location:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['start_label'] ) ); ?>" name="wpsl_label[start]" class="textinput" id="wpsl-start">
                        </p>
                        <p>
                            <label for="wpsl-directions"><?php _e( 'Get directions:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['directions_label'] ) ); ?>" name="wpsl_label[directions]" class="textinput" id="wpsl-directions">
                        </p>
                        <p>
                            <label for="wpsl-no-directions"><?php _e( 'No directions found:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['no_directions_label'] ) ); ?>" name="wpsl_label[no_directions]" class="textinput" id="wpsl-no-directions">
                        </p>
                        <p>
                            <label for="wpsl-back"><?php _e( 'Back:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['back_label'] ) ); ?>" name="wpsl_label[back]" class="textinput" id="wpsl-back">
                        </p>
                        <p>
                            <label for="wpsl-reset"><?php _e( 'Reset:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['reset_label'] ) ); ?>" name="wpsl_label[reset]" class="textinput" id="wpsl-reset">
                        </p>
                        <p>
                            <label for="wpsl-street-view"><?php _e( 'Street view:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['street_view_label'] ) ); ?>" name="wpsl_label[street_view]" class="textinput" id="wpsl-street-view">
                        </p> 
                        <p>
                            <label for="wpsl-zoom-here"><?php _e( 'Zoom here:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['zoom_here_label'] ) ); ?>" name="wpsl_label[zoom_here]" class="textinput" id="wpsl-zoom-here">
                        </p>
                        <p>
                            <label for="wpsl-error"><?php _e( 'General error:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['error_label'] ) ); ?>" name="wpsl_label[error]" class="textinput" id="wpsl-error">
                        </p>
                        <p>
                            <label for="wpsl-limit"><?php _e( 'Query limit error:', 'wpsl' ); ?> *</label> 
                            <input type="text" value="<?php echo esc_attr( stripslashes( $this->settings['limit_label'] ) ); ?>" name="wpsl_label[limit]" class="textinput" id="wpsl-limit">
                        </p>
                        <em><?php echo sprintf( __( '* You can raise the <a href="%s">usage limit</a> by obtaining an API <a href="%s">key</a>, <br> and fill in the "API key" field at the top of this page.', 'wpsl' ), 'https://developers.google.com/maps/documentation/javascript/usage#usage_limits', 'https://developers.google.com/maps/documentation/javascript/tutorial#api_key' ); ?></em>
                    </div>        
                </div>   
            </div>  
        </div>
        
        <input type="submit" value="<?php _e( 'Update Settings', 'wpsl' ); ?>" class="button-primary" name="wpsl-save-settings" id="wpsl-save-settings">
        <?php settings_fields( 'wpsl_settings' ); ?>
    </form>
    
</div>    