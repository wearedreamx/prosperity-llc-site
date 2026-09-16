<?php
if( have_rows('home_banners') ){
	echo '<section class="home-hero">';
		while( have_rows('home_banners') ){
			the_row();
			$content = get_sub_field('home_banner_content');
			$video = get_sub_field('home_banner_bg_video');
			$image = get_sub_field('home_banner_bg_image');
			
			echo '<div class="home-hero-banner">';
				if( $content ){
					echo '<div class="home-hero-banner-content animate-in fade-in">' . $content . '</div>';
				}
				
				if( $video ){
?>
					<div class="home-hero-banner-video-bg"></div>
					<video autoplay muted loop class="home-hero-banner-video" id="heroVideo">
						<source src="<?php echo $video['url']; ?>" type="video/mp4">
					</video>
					<style>
						.home-hero-banner-video-bg	{
							background-image: url(<?php echo $video['url']; ?>) !important;
							background-size: 100% auto !important;
						}
						
						@media (max-width: 720px){
							.home-hero-banner-video-bg	{
								background-size: auto 100% !important;
							}
						}
					</style>
<?php
				}elseif( $image ){
					echo '<figure class="home-hero-banner-figure">
						<img src="' . $image['url'] . '" alt="' . $image['alt'] . '" class="home-hero-banner-image" />
					</figure>';
				}
			echo '</div>';
		}
	echo '</section>';
}