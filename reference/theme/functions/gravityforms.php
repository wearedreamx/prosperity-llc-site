<?php
// Remove Gravity Forms CSS
add_filter('pre_option_rg_gforms_disable_css', '__return_true');


// Gravity Forms load script in footer
add_filter("gform_init_scripts_footer", "init_scripts");
function init_scripts() {
	return true;
}