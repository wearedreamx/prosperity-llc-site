<?php
$post_id = $post->ID;
$featured_image_url = get_the_post_thumbnail_url();
?>
<article id="post-<?php echo $post_id; ?>" class="post">
	<a href="<?php the_permalink(); ?>" class="post-link" rel="bookmark">
		<figure class="post-figure">
			<img src="<?php echo $featured_image_url; ?>" alt="<?php the_title(); ?>" class="post-figure-image" />
		</figure>
		<div class="post-content">
			<h3 class="post-title"><?php the_title(); ?></h3>
			<div class="post-excerpt">
				<?php the_excerpt(); ?>
			</div>
		</div>
	</a>
</article>