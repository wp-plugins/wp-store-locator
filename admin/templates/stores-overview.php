<?php
require_once WPSL_PLUGIN_DIR . 'admin/class-store-overview.php';

$store_overview = new WPSL_Store_Overview();
$store_overview->prepare_items(); 
?>

<div id="wpsl-store-overview" class="wrap">
    <h2>WP Store Locator</h2>
    <?php settings_errors(); ?>
    
    <?php echo $this->create_menu(); ?>
                    
    <form method="post">
        <?php
            $store_overview->search_box( 'search', 'search_id' );
            $store_overview->display(); 
        ?>
    </form>
</div>