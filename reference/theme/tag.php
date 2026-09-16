<?php
get_header();
?>

	<section class="page-banner">
		<div class="page-banner-container container">
			<h1 class="page-banner-title"><?php printf( __( '%s' ), '<span>' . single_tag_title( '', false ) . '</span>' ); ?></h1>
			<?php
				// Category description
				$category_description = tag_description();
				if ( ! empty( $category_description ) ){
					echo '<div class="page-banner-content">' . $category_description . '</div>';
				}
			?>
		</div>
	</section>
	<section class="page-container">
		<div class="posts-container container">
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
				
				get_sidebar();
			?>
		</div>
	</section>

<?php
get_footer();