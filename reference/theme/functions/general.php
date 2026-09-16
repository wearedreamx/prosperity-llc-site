<?php
add_theme_support('automatic-feed-links');


// add title tag
add_theme_support('title-tag');


// lazy loading
add_filter( 'wp_lazy_loading_enabled', '__return_true' );


// Remove default gallery styling
add_filter( 'use_default_gallery_style', '__return_false' );


// Add post thumbnails
add_theme_support('post-thumbnails');


// Add options page
if( function_exists('acf_add_options_page') ){
	acf_add_options_page(array(
		'page_title' => 'Site Settings',
		'menu_title' => 'Global Settings',
		'menu_slug' => 'theme-general-settings',
		'capability' => 'edit_posts',
		'icon_url' => 'dashicons-art',
		'redirect' => false
	));
}


// Get current URL
function wp_get_current_url() {
	return home_url( $_SERVER['REQUEST_URI'] );
}


// Post primary category
function get_post_primary_category($post_id, $term='category', $return_all_categories=false){
	$return = array();
	
	if (class_exists('WPSEO_Primary_Term')){
		// Show Primary category by Yoast if it is enabled & set
		$wpseo_primary_term = new WPSEO_Primary_Term( $term, $post_id );
		$primary_term = get_term($wpseo_primary_term->get_primary_term());
	
		if (!is_wp_error($primary_term)){
			$return['primary_category'] = $primary_term;
		}
	}
	
	if (empty($return['primary_category']) || $return_all_categories){
		$categories_list = get_the_terms($post_id, $term);
	
		if (empty($return['primary_category']) && !empty($categories_list)){
			$return['primary_category'] = $categories_list[0];  //get the first category
		}

		if ($return_all_categories){
			$return['all_categories'] = array();
			
			if (!empty($categories_list)){
				foreach($categories_list as &$category){
					$return['all_categories'][] = $category->term_id;
				}
			}
		}
	}
	
	return $return;
}


function has_carousel_block() {
	if( have_rows('content_blocks') ){
		while( have_rows('content_blocks') ){
			the_row();
			$columns = get_sub_field('content_block_columns');
			if( $columns == 'carousel' ){
				return true;
			}
		}
	}
	return false;
}


// enqueue scripts
function theme_enqueue_scripts() {
	if( is_single() || has_carousel_block() ){
		wp_enqueue_script(
			'slick',
			get_template_directory_uri() . '/assets/js/slick.min.js',
			array( 'jquery' ),
			'1.8.1',
			true
		);

		wp_enqueue_style(
			'slick-css',
			get_template_directory_uri() . '/assets/css/plugins/slick.css',
			array(),
			'1.8.1'
		);
	}

    wp_enqueue_script(
        'theme-main',
        get_template_directory_uri() . '/assets/js/g.min.js',
        array( 'jquery' ),
        '1.0.2',
        true
    );

	wp_enqueue_style(
		'theme-print',
		get_template_directory_uri() . '/assets/css/print.css',
		array(),
		'2',
		'print'
	);

	wp_enqueue_style(
		'google-fonts-urbanist',
		'https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap',
		array(),
		null
	);
}
add_action( 'wp_enqueue_scripts', 'theme_enqueue_scripts' );


function add_google_fonts_preconnect() {
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}
add_action( 'wp_head', 'add_google_fonts_preconnect' );

