<?php
$post_id = $post->ID;
$featured_image_url = get_the_post_thumbnail_url();
if( $featured_image_url ){
	$image = $featured_image_url;
}else{
	$image = '/wp-content/uploads/2024/07/prosperity-team.jpg';
}
?>
<article id="post-<?php echo $post_id; ?>" class="post post-search">
	<a href="<?php the_permalink(); ?>" class="post-link" rel="bookmark">
		<figure class="post-figure">
			<img src="<?php echo $image; ?>" alt="<?php the_title(); ?>" class="post-figure-image" />
		</figure>
		<div class="post-content">
			<h3 class="post-title"><?php the_title(); ?></h3>
			<div class="post-excerpt">
				<?php the_excerpt(); ?>
			</div>
		</div>
	</a>
</article>