<?php
// Single post template
get_header();

$featured_image_url = get_the_post_thumbnail_url();
$title = get_field( 'personnel_title' );
$certs = get_field( 'personnel_certifications' );
?>

	<section class="page-banner">
		<div class="page-banner-content">
			<div class="page-banner-container container">
				<h2 class="page-banner-title"><a class="page-banner-title-link" href="/meet-the-team/">Meet the Team</a></h2>
			</div>
		</div>
	</section>
	<section class="single-post-container">
		<div class="single-post-content-container container">
			<?php
				if( $featured_image_url ){
					echo '<figure class="single-post-figure"><img src="' . $featured_image_url . '" alt="" class="single-post-image"></figure>';
				}
			?>
			<div class="single-post-content">
				<h1 class="single-personnel-name"><?php
					the_title();
					
					if( $certs ){
						$cert_list = implode( ', ', $certs );
						echo '<span class="single-personnel-certs">';
							print_r( $cert_list );
						echo '</span>';
					}
				?></h1>
				<?php
					if( $title ){
						echo '<h3 class="single-personnel-title">';
							if( $title == 'ceo' ){
								echo 'Chief Executive Officer';
							}elseif( $title == 'partners' ){
								echo 'Partner';
							}elseif( $title == 'managers' ){
								echo 'Manager';
							}elseif( $title == 'directors' ){
								echo 'Director';
							}elseif( $title == 'associates' ){
								echo 'Associate';
							}elseif( $title == 'senior-manager' ){
								echo 'Senior Manager';
							}
						echo '</h3>';
					}
					
					// location(sS
					$locations = get_field( 'personnel_location' );
					
					
					if( $locations ){
						if( is_array( $locations ) ){
							echo '<h4 class="single-personnel-location">';
								$i = 0;
								foreach( $locations as $loc ){
									$location_id = $loc;
									$loc_name = get_the_title( $location_id );
									$loc_link = get_permalink( $location_id );
							
									if( $i > 0 ){
										echo ', ';
									}
									
									echo '<a href="' . $loc_link . '" class="single-personnel-location-link">' . $loc_name . '</a>';
									$i++;
								}
							echo '</h4>';
						}else{
							$location_name = get_the_title( $locations );
							$location_link = get_permalink( $locations );
					
							echo '<h4 class="single-personnel-location"><a href="' . $location_link . '" class="single-personnel-location-link">' . $location_name . '</a></h4>';
						}
					}
				?>
				<div class="single-personnel-content content">
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
				include('wp-content/themes/ndhcpawp/assets/css/pages/single-personnel.css');
			?>}
		</style>
	</section>

<?php
get_footer();