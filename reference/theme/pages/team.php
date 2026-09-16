<?php
/* Template Name: Team page */
get_header();
get_template_part( 'parts/page-banner' );

if ( have_rows('team_members') ){
?>
	<section class="team">
		<div class="container">
			<?php get_template_part( 'pages/team/filters' ); ?>
			<div class="team-container">
				<?php
					// original members, controlled by the field in the admin
					$pinned = array();
					while( have_rows('team_members') ){
						the_row();
						$member = get_sub_field('team_member');
						
						$link = get_permalink( $member );
						$thumbnail = get_post_thumbnail_id( $member );
						$image = wp_get_attachment_url( $thumbnail );
						$name = get_the_title( $member );
						$title = get_field( 'personnel_title', $member );
						$certs = get_field( 'personnel_certifications', $member );
						$specs = get_field( 'personnel_specializations', $member );
						$locations = get_field('personnel_location', $member);
						if( is_array( $locations ) ){
							$location_slug = '';
							foreach( $locations as $loc ){
								$location_id = $loc;
								$loc_slug = ' ' . get_post_field( 'post_name', $location_id );
								$location_slug .= $loc_slug;
							}
						}else{
							$location_slug = ' ' . get_post_field( 'post_name', $locations );
						}

						$member_class = 'team-member active';
						$member_class .= ' ' . $title;
						$member_class .= $location_slug;
						if( $specs ){
							foreach( $specs as $spec ){
								$member_class .= ' ' . $spec;
							}
						}
						
						echo '<article class="' . $member_class . '"';
							if( $title ){
								echo ' data-member-title="' . $title . '"';
							}

							if( $location_slug ){
								echo ' data-member-location="' . $location_slug . '"';
							}

							if( $specs ){
								echo ' data-member-specs="';
									foreach( $specs as $spec ){
										echo $spec . ' ';
									}
								echo '"';
							}
						echo '>';

							echo '<a href="' . $link . '" class="team-member-link">';
								if( $image ){
									echo '<figure class="team-member-figure">
										<img src="' . $image . '" alt="' . $title . '" class="team-member-img" />
									</figure>';
								}
								
								echo '<div class="team-member-content">';
									// name
									echo '<h3 class="team-member-name">';
										echo $name;
										if( $certs ){
											$cert_list = implode( ', ', $certs );
											echo '<span class="team-member-certs">';
												print_r( $cert_list );
											echo '</span>';
										}
									echo '</h3>';
									
									// title
									if( $title ){
										echo '<h5 class="team-member-title">';
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
										echo '</h5>';
									}
									
									// locations
									if( $locations ){
										if( is_array( $locations ) ){
											echo '<p class="team-member-location">';
												$i = 0;
												foreach( $locations as $loc ){
													$location_id = $loc;
													$loc_name = get_the_title( $location_id );
											
													if( $i > 0 ){
														echo ', ';
													}
													
													echo $loc_name;
													$i++;
												}
											echo '</p>';
										}else{
											$location_name = get_the_title( $locations );
											echo '<p class="team-member-location">' . $location_name . '</p>';
										}
									}
								echo '</div>';
							echo '</a>';
						echo '</article>';
						
						array_push( $pinned, $member );
					}
					
					// the rest of the team member in alphabetical order by last name
					$args = array(
						'post_type' => 'personnel',
						'post_status' => 'publish',
						'posts_per_page' => -1, 
						'meta_key' => 'personnel_last_name',
						'orderby' => 'meta_value title', 
						'order' => 'ASC',  
					);
					
					$loop = new WP_Query( $args );
		
					if( $loop->have_posts() ) {
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
							
							$mlocations = get_field('personnel_location', $member_id);
							if( is_array( $mlocations ) ){
								$mlocation_slug = '';
								foreach( $mlocations as $mloc ){
									$mlocation_id = $mloc;
									$mloc_slug = ' ' . get_post_field( 'post_name', $mlocation_id );
									$mlocation_slug .= $mloc_slug;
								}
							}else{
								$mlocation_slug = ' ' . get_post_field( 'post_name', $mlocations );
							}

							$member_class = 'team-member active';
							$member_class .= ' ' . $title;
							$member_class .= ' ' . $mlocation_slug;
							if( $specs ){
								foreach( $specs as $spec ){
									$member_class .= ' ' . $spec;
								}
							}
							
							if( !in_array( $member_id, $pinned ) ){
								echo '<article class="' . $member_class . '"';
									if( $title ){
										echo ' data-member-title="' . $title . '"';
									}

									if( $mlocation_slug ){
										echo ' data-member-location="' . $mlocation_slug . '"';
									}

									if( $specs ){
										echo ' data-member-specs="';
											foreach( $specs as $spec ){
												echo $spec . ' ';
											}
										echo '"';
									}
								echo '>';

									echo '<a href="' . $link . '" class="team-member-link">';
										// image
										if( $image ){
											echo '<figure class="team-member-figure">
												<img src="' . $image . '" alt="' . $title . '" class="team-member-img" />
											</figure>';
										}
										
										echo '<div class="team-member-content">';
											// name
											echo '<h3 class="team-member-name">';
												echo $name;
												if( $certs ){
													$cert_list = implode( ', ', $certs );
													echo '<span class="team-member-certs">';
														print_r( $cert_list );
													echo '</span>';
												}
											echo '</h3>';
											
											// title
											if( $title ){
												echo '<h5 class="team-member-title">';
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
												echo '</h5>';
											}
											
											// locations
											if( is_array( $mlocations ) ){
												echo '<p class="team-member-location">';
													$i = 0;
													foreach( $mlocations as $mloc ){
														$mlocation_id = $mloc;
														$mloc_name = get_the_title( $mlocation_id );
												
														if( $i > 0 ){
															echo ', ';
														}
														
														echo $mloc_name;
														$i++;
													}
												echo '</p>';
											}else{
												$mlocation_name = get_the_title( $mlocations );
												echo '<p class="team-member-location">' . $mlocation_name . '</p>';
											}
										echo '</div>';
									echo '</a>';
								echo '</article>';
							}
						}
					}
				?>
			</div>
		</div>
	</section>
	<style>
		@media only screen{<?php include('wp-content/themes/ndhcpawp/assets/css/pages/team.css'); ?>}
	</style>
<?php
}
get_footer();