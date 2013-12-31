<?php
require_once WPSL_PLUGIN_DIR . 'admin/class-store-overview.php';

$store_overview = new WPSL_Store_Overview();
$store_overview->prepare_items(); 
?>

<div id="wpsl-store-overview" class="wrap">
    <h2>WP Store Locator</h2>
    <?php settings_errors(); ?>
    
    <ul id="wpsl-mainnav">
        <li><a class="nav-tab nav-tab-active" href="<?php echo admin_url( 'admin.php?page=wpsl_store_editor' ); ?>"><?php _e( 'Current Stores', 'wpsl' ); ?></a></li>
        <li><a class="nav-tab" href="<?php echo admin_url( 'admin.php?page=wpsl_add_store' ); ?>"><?php _e( 'Add Store', 'wpsl' ); ?></a></li>
        <li><a class="nav-tab" href="<?php echo admin_url( 'admin.php?page=wpsl_settings' ); ?>"><?php _e( 'Settings', 'wpsl' ); ?></a></li>
    </ul>
                    
    <form method="post">
        <?php
            $store_overview->search_box( 'search', 'search_id' );
            $store_overview->display(); 
        ?>
    </form>
</div>