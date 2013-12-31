<?php 
echo $this->get_custom_css(); 

$show_results_filter = $this->settings['results_dropdown'];
$results_filter_class = ( $show_results_filter ) ? '' : 'wpsl-no-results';
?>

<div id="wpsl-wrap">
	<div class="wpsl-search clearfix <?php echo $results_filter_class; ?>">
		<div id="wpsl-search-wrap">
            <div class="wpsl-input">
                <label for="wpsl-search-input"><?php echo esc_attr( $this->settings['search_label'] ); ?></label>
                <input autocomplete="off" id="wpsl-search-input" type="text" value="" name="wpsl-search-input" />
            </div>
            <div class="wpsl-select-wrap">
                <div id="wpsl-radius">
                    <label for="wpsl-radius"><?php echo esc_attr( $this->settings['radius_label'] ); ?></label>
                    <select autocomplete="off" class="wpsl-dropdown" name="wpsl-radius">
                        <?php echo $this->get_dropdown_list( 'search_radius' ); ?>
                    </select>
                </div>
                <?php if ( $show_results_filter ) { ?>
                    <div id="wpsl-results">
                        <label for="wpsl-results"><?php echo esc_attr( $this->settings['results_label'] ); ?></label>
                        <select autocomplete="off" class="wpsl-dropdown" name="wpsl-results">
                            <?php echo $this->get_dropdown_list( 'max_results' ); ?>
                        </select>
                    </div>
                <?php } ?>
                <input id="wpsl-search-btn" type="submit" value="<?php echo esc_attr( $this->settings['search_btn_label'] ); ?>" />
            </div>    
        </div> 		
    </div>
    
	<div id="wpsl-result-list">
		<div id="wpsl-stores">
			<ul></ul>
		</div>
		<div id="wpsl-direction-details">
			<ul></ul>
		</div>
	</div>
    
    <div id="wpsl-gmap"></div>
</div>