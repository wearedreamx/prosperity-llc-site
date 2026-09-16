<?php
$tdir = get_template_directory_uri();
get_template_part( 'parts/cta' );
?>

	</main>
	<footer class="footer">
		<div class="footer-container container">
			<div class="footer-columns">
				<div class="footer-column">
					<?php dynamic_sidebar('footer-widgets-1'); ?>
				</div>
				<div class="footer-column">
					<?php dynamic_sidebar('footer-widgets-2'); ?>
				</div>
				<div class="footer-column">
					<?php dynamic_sidebar('footer-widgets-3'); ?>
				</div>
				<div class="footer-column">
					<?php dynamic_sidebar('footer-widgets-4'); ?>
				</div>
			</div>
		</div>
		<?php
			get_template_part( 'parts/footer/locations' );
			get_template_part( 'parts/footer/disclaimer' );
			get_template_part( 'parts/footer/copyright' );
		?>
	</footer>
	<link rel="preload" as="style" href="<?=$tdir?>/assets/css/screen.css?v=3" media="screen" onload="this.onload=null;this.rel='stylesheet'" />
	<?php
		get_template_part( 'parts/footer/mobilemenu' );
		wp_footer();
		get_template_part( 'parts/footer/conditionals' );
	?>
</body>
</html>