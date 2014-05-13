<div id="wpsl-wrap" class="wrap wpsl-settings">
	<h2>WP Store Locator: <?php _e( 'FAQ', 'wpsl' ); ?></h2>
    
    <div id="wpsl-faq">
        <dl>
            <dt><?php _e( 'How do I show the store locator on my page?', 'wpsl' ); ?></dt>
            <dd>
                <p><?php _e( 'Add this shortcode <code>[wpsl]</code> to the page where you want to show the store locator.', 'wpsl' ); ?></p>
            </dd>
        </dl>
        <dl>
            <dt><?php _e( 'The map doesn\'t display properly. It\'s either broken in half or doesn\'t load at all.', 'wpsl'); ?></dt>
            <dd>
                <p><?php _e( 'Make sure you have defined a start point for the map under settings -> map settings.', 'wpsl'); ?></p>
            </dd>
        </dl>
        <dl>
            <dt><?php _e( 'I get an error saying the "sensor" parameter specified in the request must be set to either "true" or "false".', 'wpsl'); ?></dt>
            <dd>
                <p><?php _e( 'Make sure you don\'t have any security plugins, or custom functions running that strip away version numbers from file paths.', 'wpsl'); ?></p>
            </dd>
        </dl>
        <dl>
            <dt><?php _e( 'The store locator doesn\'t load, it only shows the number 1?', 'wpsl' ); ?></dt>
            <dd>
                <p><?php _e( 'This is most likely caused by your theme using ajax navigation ( the loading of content without reloading the page ), or a conflict with another plugin. Try to disable the ajax navigation in the theme settings, or deactivate the plugin that enables it to see if that solves the problem.', 'wpsl' ); ?></p>
                <p><?php _e( 'If you don\'t use ajax navigation, but do see the number 1 it\'s probably a conflict with another plugin. Try to disable the plugins one by one to see if one of them is causing a conflict.', 'wpsl' ); ?></p>
                <p><?php echo sprintf( __( 'If you find a plugin or theme that causes a conflict, please report it on the <a href="%s">support page</a>.', 'wpsl' ), 'http://wordpress.org/support/plugin/wp-store-locator' ); ?></p> 
            </dd>
        </dl>
        <dl>
            <dt><?php _e( 'Why does it show the location I searched for in the wrong country?', 'wpsl' ); ?></dt>
            <dd>
                <p><?php _e( 'Some location names exist in more then one country, and Google will guess which one you mean. This can be fixed by setting the correct "Map Region" on the settings page -> "API Settings".', 'wpsl' ); ?></p>
            </dd>
        </dl>
    </div>
</div>