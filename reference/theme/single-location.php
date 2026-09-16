<?php
// Single post template
$post_id = $post->ID;
get_header();

$bg = get_field('page_banner_image');
if( $bg ){
?>

	<section class="page-banner">
		<div class="page-banner-content">
			<div class="page-banner-container container"></div>
		</div>
		<figure class="page-banner-figure">
			<img src="<?php echo $bg['url']; ?>" alt="<?php echo $bg['alt']; ?>" class="page-banner-image" />
		</figure>
	</section>
<?php
}
?>

	<section class="single-location-container">
		<div class="container">
			<div class="single-location-top">
				<div class="single-location-address">
					<?php
						echo '<h1 class="single-location-title">' . get_the_title() . '</h1>';
						echo '<address>' . get_field('location_address' ) . '</address>';
					?>
				</div>
				<div class="single-location-content content">
					<?php
						while( have_posts() ){
							the_post();
							the_content();
						}
					?>
				</div>
			</div>
			<?php
				$page_id = get_the_ID();
				$args = array(
					'post_type' => 'personnel',
					'post_status' => 'publish',
					'posts_per_page' => -1, 
					'meta_key' => 'personnel_last_name',
					'orderby' => 'meta_value title', 
					'order' => 'ASC', 
					'meta_query' => array(
						array(
							'key' => 'personnel_location',
							'value' => $page_id, 
							'compare' => 'LIKE'
						)
					),
				);
				
				$loop = new WP_Query( $args );

				if( $loop->have_posts() ) {
					get_template_part( 'pages/team/filters' );
			?>
					<div class="team-container">
						<?php
							// three original members, controlled by the field in the admin
							$pinned = array();
							while( have_rows('team_members', $page_id ) ){
								the_row();
								$member = get_sub_field('team_member');
								
								$link = get_permalink( $member );
								$thumbnail = get_post_thumbnail_id( $member );
								$image = wp_get_attachment_url( $thumbnail );
								$name = get_the_title( $member );
								$title = get_field( 'personnel_title', $member );
								$certs = get_field( 'personnel_certifications', $member );
								$specs = get_field( 'personnel_specializations', $member );
		
								$member_class = 'team-member active';
								$member_class .= ' ' . $title;
								$member_class .= ' ' . $location_slug;
								if( $specs ){
									foreach( $specs as $spec ){
										$member_class .= ' ' . $spec;
									}
								}
								
								echo '<article class="' . $member_class . '">';
									echo '<a href="' . $link . '" class="team-member-link">';
										if( $image ){
											echo '<figure class="team-member-figure">
												<img src="' . $image . '" alt="' . $title . '" class="team-member-img" />
											</figure>';
										}
										
										echo '<div class="team-member-content">';
											echo '<h3 class="team-member-name">';
												echo $name;
												if( $certs ){
													$cert_list = implode( ', ', $certs );
													echo '<span class="team-member-certs">';
														print_r( $cert_list );
													echo '</span>';
												}
											echo '</h3>';
											
											if( $title ){
												echo '<h5 class="team-member-title">';
													if( $title == 'partners' ){
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
												echo '</h5>';
											}
										echo '</div>';
									echo '</a>';
								echo '</article>';
								
								array_push( $pinned, $member );
							}
							
							while( $loop->have_posts() ){
								$loop->the_post();
								$member_id = get_the_ID();
								
								$link = get_permalink( $member_id );
								$thumbnail = get_post_thumbnail_id( $member_id );
								$image = wp_get_attachment_url( $thumbnail );
								$name = get_the_title( $member_id );
								$title = get_field( 'personnel_title', $member_id );
								$certs = get_field( 'personnel_certifications', $member_id );
								$specs = get_field( 'personnel_specializations', $member_id );
										
								$member_class = 'team-member active';
								$member_class .= ' ' . $title;
								$member_class .= ' ' . $location_slug;
								if( $specs ){
									foreach( $specs as $spec ){
										$member_class .= ' ' . $spec;
									}
								}
								
								if( !in_array( $member_id, $pinned ) ){
									echo '<article class="' . $member_class . '">';
										echo '<a href="' . $link . '" class="team-member-link">';
											if( $image ){
												echo '<figure class="team-member-figure">
													<img src="' . $image . '" alt="' . $title . '" class="team-member-img" />
												</figure>';
											}
											
											echo '<div class="team-member-content">';
												echo '<h3 class="team-member-name">';
													echo $name;
													if( $certs ){
														$cert_list = implode( ', ', $certs );
														echo '<span class="team-member-certs">';
															print_r( $cert_list );
														echo '</span>';
													}
												echo '</h3>';
												
												if( $title ){
													echo '<h5 class="team-member-title">';
														if( $title == 'partners' ){
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
													echo '</h5>';
												}
											echo '</div>';
										echo '</a>';
									echo '</article>';
								}
							}
						?>
					</div>
			<?php
				}
				wp_reset_query();
			?>
		</div>
		<style>
			@media only screen{<?php
				include('wp-content/themes/ndhcpawp/assets/css/pages/single-location.css');
				include('wp-content/themes/ndhcpawp/assets/css/pages/team.css');
			?>}
		</style>
	</section>

<?php
get_footer();