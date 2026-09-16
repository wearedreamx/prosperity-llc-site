<?php
$post_type = $_GET['post_types'];
get_header();
?>

	<section class="page-banner">
		<div class="page-banner-content">
			<div class="page-banner-container container">
				<h1 class="page-banner-title"><?php printf( __( 'Search Results for: %s' ), get_search_query() ); ?></h1>
			</div>
		</div>
	</section>
	<section class="search-results-container">
		<div class="container">
			<?php
				if( have_posts() ){
					echo '<div class="posts">';
						while( have_posts() ){
							the_post();
							get_template_part( 'parts/content', 'search' );
						}
					echo '</div>';
					
					if( function_exists('wp_paginate') ){
						wp_paginate();
					}
				}else{
					get_template_part( 'parts/content', 'none' );
				}
			?>
		</div>
	</section>
	<style>
		@media only screen{<?php include('wp-content/themes/ndhcpawp/assets/css/pages/search.css'); ?>}
	</style>

<?php
get_footer();