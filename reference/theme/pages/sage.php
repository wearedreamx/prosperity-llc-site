<?php
/* Template Name: Sage */
get_header();

get_template_part( 'parts/page-banner' );
echo '<nav class="sage-menu"><div class="sage-menu-container container">';
	wp_nav_menu(array( 'theme_location' => 'sage-menu'));
echo '</div></nav>';
get_template_part( 'parts/content', 'blocks' );

get_footer();