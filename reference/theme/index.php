<?php
get_header();

if ( function_exists('yoast_breadcrumb') ) {
	yoast_breadcrumb( '<div class="breadcrumbs-container container"><div class="breadcrumbs">', '</div></div>' );
}
?>

	<div class="index-container container">
		<h1 class="page-title">Blog</h1>
		<?php
			if( have_posts() ){
				echo '<div class="posts">';
					while( have_posts() ){
						the_post();
						get_template_part( 'parts/content' );
					}
				
					if( function_exists('wp_paginate') ){
						wp_paginate();
					}
				echo '</div>';
			}else{
				get_template_part( 'parts/content', 'none' );
			}
		?>
	</section>

<?php
get_footer();