<?php
// content search form
function content_search_form() {
	$search_form = '<form class="content-searchform" method="get" id="search-form-alt" action="'. esc_url(home_url('/')) .'">
		<input class="content-searchform-input" type="text" name="s" id="s" placeholder="Can\'t find what you are looking for? Type it in the search bar ..." />
	</form>';
	return $search_form;
}
add_shortcode('display_search_form', 'content_search_form');


// Divider
function content_divider() {
	$divider = '<div class="divider"></div>';
	return $divider;
}
add_shortcode('divider', 'content_divider');


// posts
function category_posts_shortcode( $atts ) {
	$atts = shortcode_atts( array(
		'category' => '',
	), $atts );
	
	$category = get_category_by_slug( $atts['category'] );
	$cat_id = $category->term_id;
	$cat_link = get_category_link( $cat_id );
	
	$args = array(
		'category__in' => array( $cat_id ),
		'posts_per_page' => 3,
	);
	$query = new WP_Query( $args );
	
	$output = '';
	
	// Loop through the posts and add them to the output
	if ( $query->have_posts() ) {
		$output .= '<div class="posts">';
		while ( $query->have_posts() ) {
			$query->the_post();
			$output .= '<article class="post">
					<a href="' . get_permalink() . '" class="post-link" rel="bookmark">
						<figure class="post-figure">
							<img src="' . get_the_post_thumbnail_url() . '" alt="' . get_the_title() . '" class="post-figure-image" />
						</figure>
						<div class="post-content">
							<h5 class="post-date">' . get_the_date( 'F d, Y' ) . '</h5>
							<h3 class="post-title">' . get_the_title() . '</h3>
							<div class="post-excerpt">' . get_the_excerpt() . ' <span class="post-read-more">Read More</span></div>
						</div>
					</a>
				</article>';
		}
		$output .= '</div>';
	}
	
	wp_reset_postdata();
	return $output;
}
add_shortcode( 'category_posts', 'category_posts_shortcode' );