<?php
get_header();
$term = get_queried_object();
?>

	<section class="page-banner">
		<div class="page-banner-content">
			<div class="page-banner-content-container container">
				<h1 class="page-banner-title"><?php printf(__( '%s' ), single_cat_title( '', false )); ?></h1>
				<?php
					// Category description
					$category_description = category_description();
					if ( ! empty( $category_description ) ){
						echo '<div class="content">' . $category_description . '</div>';
					}
				?>
			</div>
		</div>
		<?php
			$bg = get_field('post_category_banner_image', $term);
			if( $bg ){
				echo '<figure class="page-banner-figure">';
					echo '<img src="' . $bg['url'] . '" alt="' . $bg['alt'] . '" class="page-banner-image" />';
				echo '</figure>';
			}
		?>
	</section>
	<section class="index-container">
		<div class="container">
			<?php
				if( have_posts() ){
					echo '<div class="posts">';
						while( have_posts() ){
							the_post();
							get_template_part( 'parts/content' );
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

<?php
get_footer();