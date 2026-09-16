<?php
echo $cat_id;
global $wp_query;
$args = array(
	'category__and' => $cat_id, 
	'posts_per_page' => 3
);
$posts = get_posts($args);
		
if( $posts ){
?>
	<div class="posts">
		<?php
			foreach( $posts as $post ){
				the_post();
				$post_id = $post->ID;
				$featured_image_url = get_the_post_thumbnail_url();
				
		?>
				<article id="post-<?php echo $post_id; ?>" class="post">
					<a href="<?php the_permalink(); ?>" class="post-link" rel="bookmark">
						<figure class="post-figure">
							<img src="<?php echo $featured_image_url; ?>" alt="<?php the_title(); ?>" class="post-figure-image" />
						</figure>
						<h3 class="post-title"><?php the_title(); ?></h3>
						<div class="post-excerpt">
							<?php the_excerpt(); ?>
						</div>
					</a>
				</article>
		<?php
			}
			wp_reset_query();
		?>
	</div>
<?php
}

