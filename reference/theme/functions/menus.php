<?php
add_action( 'init', 'register_my_menus' );
add_theme_support( 'automatic-feed-links' );

function register_my_menus() {
	register_nav_menus(
		array(
			'main-menu' => __( 'Main Menu' ), 
			'mobile-menu' => __( 'Mobile Menu' ), 
			'sage-menu' => __( 'Sage Menu' ), 
		)
	);
}