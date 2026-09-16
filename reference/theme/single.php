<?php
// Single post template
get_header();

$post_id = get_the_ID();

// Author Info
$author_id = get_the_author_meta('ID');
$author_title = get_the_author_meta('title');
$user_title = get_the_author_meta('user_title');
$author_url = get_author_posts_url( $author_id );
$author_name = get_the_author();

$featured_image_url = get_the_post_thumbnail_url();
?>

	<section class="page-banner">
		<div class="page-banner-content">
			<div class="page-banner-container container">
				<h2 class="page-banner-title"><?php
					$primary_term_id = yoast_get_primary_term_id( 'category', $post_id );
					if ( $primary_term_id ) {
						$primary_term = get_term( $primary_term_id );
						$primary_link = get_term_link( $primary_term_id );
						$primary_name = $primary_term->name;
						$category_link = $primary_link;
						$category_name = $primary_name;
						
					}else{
						$categories = get_the_category( $post_id );
						$cat_id = $categories[0]->term_id;
						$cat_name = $categories[0]->name;
						$cat_link = get_term_link( $cat_id );
						$category_link = $cat_link;
						$category_name = $cat_name;
					}
					
					echo '<a class="page-banner-title-link" href="' . $category_link . '">' . $category_name . '</a>';
				?></h2>
			</div>
		</div>
	</section>
	<section class="single-post-container">
		<div class="single-post-content-container container">
			<?php
				$gallery = get_field('slideshow_gallery');
				if( $gallery ){
					echo '<div class="single-post-slideshow"><div class="single-post-slideshow-container">';
						foreach( $gallery as $slide ){
			?>
							<div class="single-post-slideshow-slide">
								<img src="<?php echo esc_url( $slide['url'] ); ?>" alt="<?php echo esc_attr( $slide['alt'] ); ?>" class="single-post-slideshow-slide-image" />
							</div>
			<?php
						}
					echo '</div></div>';
				}elseif( $featured_image_url ){
					echo '<figure class="single-post-figure"><img src="' . $featured_image_url . '" alt="" class="single-post-image"></figure>';
				}
			?>
			<div class="single-post-content">
				<h5 class="single-post-meta"><?php the_date('F j, Y'); ?></h5>
				<h1 class="single-post-title"><?php the_title(); ?></h1>
				<div class="content">
					<?php
						while( have_posts() ){
							the_post();
							the_content();
						}
					?>
				</div>
			</div>
		</div>
		<style>
			@media only screen{<?php
				include('wp-content/themes/ndhcpawp/assets/css/pages/single.css');
				
				if( $gallery ){
					include('wp-content/themes/ndhcpawp/assets/css/plugins/slick.css');
				}
			?>}
		</style>
	</section>

<?php
get_footer();