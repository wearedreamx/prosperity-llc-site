<?php
add_action( 'widgets_init', 'widget_registration' );
function widget_registration(){
	register_sidebar(
		array(
			'id' => 'blog-sidebar', 
			'name' => _('Blog Sidebar'),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget' => '</aside>',
			'before_title' => '<header class="widget-title"><h3>',
			'after_title' => '</h3></header>'
		)
	);
	
	register_sidebar(
		array(
			'id' => 'footer-widgets-1', 
			'name' => _('Top Footer Widgets 1'),
			'before_widget' => '<div id="%1$s" class="widget-footer %2$s">',
			'after_widget' => '</div>',
			'before_title' => '<h3 class="widget-footer-title">',
			'after_title' => '</h3>',
		)
	);
	
	register_sidebar(
		array(
			'id' => 'footer-widgets-2', 
			'name' => _('Top Footer Widgets 2'),
			'before_widget' => '<div id="%1$s" class="widget-footer %2$s">',
			'after_widget' => '</div>',
			'before_title' => '<h3 class="widget-footer-title">',
			'after_title' => '</h3>',
		)
	);
	
	register_sidebar(
		array(
			'id' => 'footer-widgets-3', 
			'name' => _('Top Footer Widgets 3'),
			'before_widget' => '<div id="%1$s" class="widget-footer %2$s">',
			'after_widget' => '</div>',
			'before_title' => '<h3 class="widget-footer-title">',
			'after_title' => '</h3>',
		)
	);
	
	register_sidebar(
		array(
			'id' => 'footer-widgets-4', 
			'name' => _('Top Footer Widgets 4'),
			'before_widget' => '<div id="%1$s" class="widget-footer %2$s">',
			'after_widget' => '</div>',
			'before_title' => '<h3 class="widget-footer-title">',
			'after_title' => '</h3>',
		)
	);
	
	register_sidebar(
		array(
			'id' => 'footer-widget-bottom', 
			'name' => _('Bottom Footer Widgets'),
			'before_widget' => '<div id="%1$s" class="widget-footer-bottom %2$s">',
			'after_widget' => '</div>',
			'before_title' => '<h3 class="widget-footer-bottom-title">',
			'after_title' => '</h3>',
		)
	);
}