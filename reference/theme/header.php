<?php
$tdir = get_template_directory_uri();
?><!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<style>
		@media only screen{<?php include 'wp-content/themes/ndhcpawp/assets/css/layout.css'; ?>}
	</style>
	<?php
		get_template_part( 'parts/favicon' );
		wp_head();
	?>
</head>
<body <?php body_class(); ?>>
	<header class="header">
		<div class="header-container container">
			<?php
				get_template_part( 'parts/header/logo' );
				get_template_part( 'parts/header/search' );
				
				echo '<nav class="main-menu">';
					wp_nav_menu(array( 'theme_location' => 'main-menu'));
				echo '</nav>';
			?>
			<div class="hamburger-container">
				<div class="hamburger">
					<span></span>
				</div>
			</div>
		</div>
	</header>
	<main role="main">