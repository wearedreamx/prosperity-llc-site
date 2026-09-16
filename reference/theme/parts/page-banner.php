<?php
$title = get_field('page_banner_title');
$content = get_field('page_banner_description');
$bg = get_field('page_banner_image');

if( $title ){
	$page_title = $title;
}else{
	$page_title = get_the_title();
}
?>
	<section class="page-banner">
		<div class="page-banner-content">
			<div class="page-banner-content-container container">
				<h1 class="page-banner-title"><?php echo $page_title; ?></h1>
				<?php
					if( $content ){
						echo '<div class="content">' . $content . '</div>';
					}
				?>
			</div>
		</div>
		<?php
			if( $bg ){
				echo '<figure class="page-banner-figure">';
					echo '<img src="' . $bg['url'] . '" alt="' . $bg['alt'] . '" class="page-banner-image" />';
				echo '</figure>';
			}
		?>
	</section>
<?php
