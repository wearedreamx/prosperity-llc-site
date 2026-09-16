<?php
$featured = get_field('home_content_featured');
$featured_image_url = get_the_post_thumbnail_url( $featured );

$title = get_field('home_content_title');
$content = get_field('home_content_content');
if( $title || $content ){
?>
	<section class="home-content">
		<div class="home-content-container container">
			<?php
				if( $featured ){
			?>
					<div class="home-content-post animate-in fade-in">
						<article class="post home-content-featured">
							<div class="home-content-featured-heading">What's New!</div>
							<a href="<?php the_permalink( $featured ); ?>" class="post-link" rel="bookmark">
								<figure class="post-figure">
									<img src="<?php echo $featured_image_url; ?>" alt="<?php echo get_the_title( $featured ); ?>" class="post-figure-image" />
								</figure>
								<div class="post-content">
									<h3 class="post-title"><?php echo get_the_title( $featured ); ?></h3>
									<div class="post-excerpt">
										<?php echo get_the_excerpt( $featured ); ?>
									</div>
								</div>
							</a>
						</article>
					</div>
			<?php
				}

			echo '<div class="home-content-content">';
				if( $title ){
					echo '<h2 class="home-content-title animate-in fade-up">' . $title . '</h2>';
				}
	
				echo '<div class="content animate-in fade-in">' . $content . '</div>';
			echo '</div>';
?>
		</div>
	</section>
<?php
}