<div id="wpsl-wrap" class="wrap wpsl-add-stores">
	<h2>WP Store Locator</h2>
    <?php settings_errors(); ?>
    
    <?php echo $this->create_menu(); ?>
    
    <form method="post" action="" accept-charset="utf-8">
        <input type="hidden" name="wpsl_actions" value="add_new_store" />
        <?php wp_nonce_field( 'wpsl_add_new_store' ); ?>
        <div class="wpsl-add-store">
            <div class="metabox-holder">
                <div class="postbox">
                    <h3><span><?php _e( 'Store details', 'wpsl' ); ?></span></h3>
                    <div class="inside">
                        <p>
                            <label for="wpsl-store-name"><?php _e( 'Store Name:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-name" name="wpsl[store]" type="text" class="textinput <?php if ( isset( $_POST['wpsl'] ) && empty( $_POST['wpsl']['store'] ) ) { echo 'wpsl-error'; } ?>" value="<?php if ( !empty( $_POST['wpsl']['store'] ) ) { echo esc_attr( stripslashes( $_POST['wpsl']['store'] ) );  } ?>" />
                        </p>
                        <p>
                            <label for="wpsl-store-address"><?php _e( 'Address:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-address" name="wpsl[address]" type="text" class="textinput <?php if ( isset( $_POST['wpsl'] ) && empty( $_POST['wpsl']['address'] ) ) { echo 'wpsl-error'; } ?>" value="<?php if ( !empty( $_POST['wpsl']['address'] ) ) { echo esc_attr( stripslashes( $_POST['wpsl']['address'] ) );  } ?>" />
                        </p>
                        <p>
                            <label for="wpsl-store-address2"><?php _e( 'Address 2:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-address2" name="wpsl[address2]" type="text" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['address2'] ) ) { echo esc_attr( stripslashes( $_POST['wpsl']['address2'] ) );  } ?>" />
                        </p>
                        <p>
                            <label for="wpsl-store-city"><?php _e( 'City:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-city" name="wpsl[city]" type="text" class="textinput <?php if ( isset( $_POST['wpsl'] ) && empty( $_POST['wpsl']['city'] ) ) { echo 'wpsl-error'; } ?>" value="<?php if ( !empty( $_POST['wpsl']['city'] ) ) { echo esc_attr( stripslashes( $_POST['wpsl']['city'] ) );  } ?>" />
                        </p>
                        <p>
                            <label for="wpsl-store-state"><?php _e( 'State / Province:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-state" name="wpsl[state]" type="text" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['state'] ) ) { echo esc_attr( stripslashes( $_POST['wpsl']['state'] ) );  } ?>" />
                        </p>                        
                        <p>
                            <label for="wpsl-store-zip"><?php _e( 'Zip Code:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-zip" name="wpsl[zip]" type="text" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['zip'] ) ) { echo esc_attr( stripslashes( $_POST['wpsl']['zip'] ) );  } ?>" />
                        </p>
                        <p>
                            <label for="wpsl-store-country"><?php _e( 'Country:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-country" name="wpsl[country]" type="text" class="textinput <?php if ( isset( $_POST['wpsl'] ) && empty( $_POST['wpsl']['country'] ) ) { echo 'wpsl-error'; } ?>" value="<?php if ( !empty( $_POST['wpsl']['country'] ) ) { echo esc_attr( stripslashes( $_POST['wpsl']['country'] ) );  } else { echo esc_attr( stripslashes( $this->settings['editor_country'] ) ); } ?>" />
                            <input id="wpsl-country-iso" type="hidden" name="wpsl[country-iso]" value="<?php if ( !empty( $_POST['wpsl']['country-iso'] ) ) { echo esc_attr( $_POST['wpsl']['country-iso'] );  } ?>" />
                        </p>
                        <p>
                            <label for="wpsl-store-lat"><?php _e( 'Latitude:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-lat" name="wpsl[lat]" type="text" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['lat'] ) ) { echo esc_attr( $_POST['wpsl']['lat'] ); } ?>" />
                        </p>
                        <p>
                            <label for="wpsl-store-lng"><?php _e( 'Longitude:', 'wpsl' ); ?></label>
                            <input id="wpsl-store-lng" name="wpsl[lng]" type="text" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['lng'] ) ) { echo esc_attr( $_POST['wpsl']['lng'] ); } ?>" />
                        </p>  
                        <p class="wpsl-submit-wrap">
                            <input id="wpsl-lookup-location" type="submit" name="wpsl-lookup-location" class="button-primary" value="<?php _e( 'Preview location on the map', 'wpsl' ); ?>" />
                            <em class="nwm-desc"><?php _e( 'You can adjust the location by dragging the marker around', 'wpsl' ); ?></em>
                        </p>
                     </div>
                </div>
            </div> 
        
            <div id="wpsl-gmap-wrap"></div>
        </div>
          
        <div class="metabox-holder">
            <div class="postbox">
                <h3><span><?php _e( 'Extra details', 'wpsl' ); ?></span></h3>     
                <div class="inside">    
                    <p>
                        <label for="wpsl-store-phone"><?php _e( 'Phone:', 'wpsl' ); ?></label>
                        <input id="wpsl-store-phone" name="wpsl[phone]" type="text" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['phone'] ) ) { echo esc_attr( $_POST['wpsl']['phone'] ); } ?>">
                    </p>
                    <p>
                        <label for="wpsl-store-fax"><?php _e( 'Fax:', 'wpsl' ); ?></label>
                        <input id="wpsl-store-fax" name="wpsl[fax]" type="text" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['fax'] ) ) { echo esc_attr( $_POST['wpsl']['fax'] ); } ?>">
                    </p>
                    <p>
                        <label for="wpsl-store-email"><?php _e( 'Email:', 'wpsl' ); ?></label>
                        <input id="wpsl-store-email" name="wpsl[email]" type="email" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['email'] ) ) { echo esc_attr( $_POST['wpsl']['email'] ); } ?>">
                    </p>
                    <p>
                        <label for="wpsl-store-url"><?php _e( 'Url:', 'wpsl' ); ?></label>
                        <input id="wpsl-store-url" name="wpsl[url]" type="url" class="textinput" value="<?php if ( !empty( $_POST['wpsl']['url'] ) ) { echo esc_url( $_POST['wpsl']['url'] ); } ?>">
                    </p>
                    <p>
                        <label for="wpsl-store-desc"><?php _e( 'Description:', 'wpsl' ); ?></label>
                        <textarea id="wpsl-store-desc" name="wpsl[desc]" cols="5" rows="5"><?php if ( !empty( $_POST['wpsl']['desc'] ) ) { echo esc_textarea( stripslashes( $_POST['wpsl']['desc'] ) ); } ?></textarea>
                    </p>
                    <p>
                        <label for="wpsl-store-hours"><?php _e( 'Operation Hours:', 'wpsl' ); ?></label>
                        <textarea id="wpsl-store-hours" name="wpsl[hours]" cols="5" rows="5"><?php if ( !empty( $_POST['wpsl']['hours'] ) ) { echo esc_textarea( stripslashes( $_POST['wpsl']['hours'] ) ); } ?></textarea>
                    </p>
                    <?php if ( current_user_can( 'upload_files' ) ) { ?>
                    <div id="wpsl-thumb-wrap">
                        <p>
                            <label><?php _e( 'Thumbnail:', 'wpsl' ); ?></label>
                            <span class="wpsl-thumb-placeholder"></span>
                        </p>
                        <div>
                            <input id="wpsl-media-upload" class="button-primary" type="button" name="text" value="<?php _e( 'Change thumbnail', 'wpsl' ); ?>" />
                            <input id="wpsl-remove-thumb" class="button-primary" type="button" name="text" value="<?php _e( 'Remove', 'wpsl' ); ?>" />
                            <input type="hidden" id="wpsl-thumb-id" name="wpsl[thumb-id]" value="" />
                        </div> 
                    </div>
                    <?php } ?>
                </div>
            </div>   
            
            <p><input id="wpsl-add-store" type="submit" name="wpsl-add-store" class="button-primary" value="<?php _e( 'Add Store', 'wpsl' ); ?>" /></p>
         </div>
    </form>

</div>