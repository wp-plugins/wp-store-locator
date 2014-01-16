<div id="wpsl-wrap" class="wrap wpsl-settings">
	<h2>WP Store Locator: <?php _e( 'Settings', 'wpsl' ); ?></h2>
    
    <?php global $wpdb; ?>

    <?php settings_errors(); ?>
    <ul id="wpsl-mainnav" class="nav-tab-wrapper">
        <li><a class="nav-tab" href="<?php echo admin_url( 'admin.php?page=wpsl_store_editor' ); ?>"><?php _e( 'Current Stores', 'wpsl' ); ?></a></li>
        <li><a class="nav-tab" href="<?php echo admin_url( 'admin.php?page=wpsl_add_store' ); ?>"><?php _e( 'Add Store', 'wpsl' ); ?></a></li>
        <li><a class="nav-tab nav-tab-active" href="<?php echo admin_url( 'admin.php?page=wpsl_settings' ); ?>"><?php _e( 'Settings', 'wpsl' ); ?></a></li>
    </ul>
                    
    <form id="wpsl-settings-form" method="post" action="options.php" accept-charset="utf-8">
        <div class="postbox-container">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'API Settings', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                            <label for="wpsl-api-key"><?php _e( 'API key:', 'wpsl' ); ?> *</label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['api_key'] ); ?>" name="wpsl_api[key]" placeholder="<?php _e( 'Optional', 'wpsl' ) ?>" class="textinput" id="wpsl-api-key">
                        </p> 
                        <p>
                            <label for="wpsl-api-language"><?php _e( 'Map language:', 'wpsl' ); ?></label> 
                            <select id="wpsl-api-language" name="wpsl_api[language]">
                                <?php 
									echo $this->get_api_option_list( 'language' );
                                ?>          	
                            </select>
                        </p>
                        <p>
                            <label for="wpsl-api-region"><?php _e( 'Map region:', 'wpsl' ); ?></label> 
                            <select id="wpsl-api-region" name="wpsl_api[region]">
                                <?php 
                                   echo $this->get_api_option_list( 'region' );
                                ?>          	
                            </select>
                        </p>
                        <em><?php _e( '* A valid <a href="https://developers.google.com/maps/documentation/javascript/tutorial#api_key">API key</a> allows you to monitor the API usage <br> and is required if you need to purchase additional quota.', 'wpsl' ); ?></em>
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
                           <input type="checkbox" value="" <?php checked( $this->settings['marker_bounce'] == '1', true ); ?> name="wpsl_map[marker_bounce]" id="wpsl-bounce">
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
                           <input type="checkbox" value="" <?php checked( $this->settings['auto_locate'] == '1', true ); ?> name="wpsl_map[auto_locate]" id="wpsl-auto-locate">
                        </p>
                        <p>
                           <label for="wpsl-auto-load"><?php _e( 'Load all stores on page load:', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['auto_load'] == '1', true ); ?> name="wpsl_map[auto_load]" id="wpsl-auto-locate">
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
                           <input type="checkbox" value="" <?php checked( $this->settings['streetview'] == '1', true ); ?> name="wpsl_map[streetview]" id="wpsl-streetview">
                        </p>
                        <p>
                           <label for="wpsl-pan-controls"><?php _e( 'Show the pan controls?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['pan_controls'] == '1', true ); ?> name="wpsl_map[pan_controls]" id="wpsl-pan-controls">
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
                           <label for="wpsl-design-results"><?php _e( 'Show the limit results dropdown?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['results_dropdown'] == '1', true ); ?> name="wpsl_design[design_results]">
                        </p>
                        <p>
                           <label for="wpsl-new-window"><?php _e( 'Open links in a new window?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['new_window'] == '1', true ); ?> name="wpsl_design[new_window]" id="wpsl-new-window">
                        </p>
                        <p>
                           <label for="wpsl-reset-map"><?php _e( 'Show a reset map button?', 'wpsl' ); ?></label> 
                           <input type="checkbox" value="" <?php checked( $this->settings['reset_map'] == '1', true ); ?> name="wpsl_design[reset_map]" id="wpsl-reset-map">
                        </p> 
                        <em><?php _e( '* This is the text that is placed before the search input and radius dropdown', 'wpsl' ); ?></em>
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
                            <input type="text" value="<?php echo esc_attr( $this->settings['search_label'] ); ?>" name="wpsl_label[search]" class="textinput" id="wpsl-search">
                        </p>
                        <p>
                            <label for="wpsl-search-radius"><?php _e( 'Search radius:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['radius_label'] ); ?>" name="wpsl_label[radius]" class="textinput" id="wpsl-search-radius">
                        </p>
                        <p>
                            <label for="wpsl-no-results"><?php _e( 'No results found:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['no_results_label'] ); ?>" name="wpsl_label[no_results]" class="textinput" id="wpsl-no-results">
                        </p>
                        <p>
                            <label for="wpsl-search-btn"><?php _e( 'Search:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['search_btn_label'] ); ?>" name="wpsl_label[search_btn]" class="textinput" id="wpsl-search-btn">
                        </p>
                        <p>
                            <label for="wpsl-preloader"><?php _e( 'Searching (preloader text):', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['preloader_label'] ); ?>" name="wpsl_label[preloader]" class="textinput" id="wpsl-preloader">
                        </p>
                        <p>
                            <label for="wpsl-results"><?php _e( 'Results:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['results_label'] ); ?>" name="wpsl_label[results]" class="textinput" id="wpsl-results">
                        </p>
                        <p>
                            <label for="wpsl-phone"><?php _e( 'Phone:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['phone_label'] ); ?>" name="wpsl_label[phone]" class="textinput" id="wpsl-phone">
                        </p>                        
                        <p>
                            <label for="wpsl-fax"><?php _e( 'Fax:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['fax_label'] ); ?>" name="wpsl_label[fax]" class="textinput" id="wpsl-fax">
                        </p>
                        <p>
                            <label for="wpsl-hours"><?php _e( 'Hours:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['hours_label'] ); ?>" name="wpsl_label[hours]" class="textinput" id="wpsl-hours">
                        </p>
                        <p>
                            <label for="wpsl-start"><?php _e( 'Start location:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['start_label'] ); ?>" name="wpsl_label[start]" class="textinput" id="wpsl-start">
                        </p>
                        <p>
                            <label for="wpsl-directions"><?php _e( 'Get directions:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['directions_label'] ); ?>" name="wpsl_label[directions]" class="textinput" id="wpsl-directions">
                        </p>
                        <p>
                            <label for="wpsl-error"><?php _e( 'General error:', 'wpsl' ); ?></label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['error_label'] ); ?>" name="wpsl_label[error]" class="textinput" id="wpsl-error">
                        </p>
                        <p>
                            <label for="wpsl-limit"><?php _e( 'Query limit error:', 'wpsl' ); ?> *</label> 
                            <input type="text" value="<?php echo esc_attr( $this->settings['limit_label'] ); ?>" name="wpsl_label[limit]" class="textinput" id="wpsl-limit">
                        </p>
                        <em><?php _e( '* You can raise the <a href="https://developers.google.com/maps/documentation/javascript/usage#usage_limits">usage limit</a> by obtaining an API <a href="https://developers.google.com/maps/documentation/javascript/tutorial#api_key">key</a>, <br> and fill in the "API key" field at the top of this page.', 'wpsl' ); ?></em>
                    </div>        
                </div>   
            </div>  
        </div>
        
        <input type="submit" value="<?php _e( 'Update Settings', 'wpsl' ); ?>" class="button-primary" name="wpsl-save-settings" id="wpsl-save-settings">
        <?php settings_fields( 'wpsl_settings' ); ?>
    </form>
    
</div>    