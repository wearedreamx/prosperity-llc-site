<?php
if( have_rows('content_blocks') ){
	$c = 1;
	while( have_rows('content_blocks') ){
		the_row();
		$columns = get_sub_field('content_block_columns');
		$image_side = get_sub_field('content_block_image_side');
		$image = get_sub_field('content_block_image');
		$content1 = get_sub_field('content_block_content1');
		$content2 = get_sub_field('content_block_content2');
		$content3 = get_sub_field('content_block_content3');
		$content4 = get_sub_field('content_block_content4');
		$content5 = get_sub_field('content_block_content5');
		$sidebar_title = get_sub_field('content_block_sidebar_title');

		$carousel_heading = get_sub_field('content_block_carousel_heading');

		$block_id = get_sub_field('content_block_id');
		$custom_class = get_sub_field('content_block_class');
		
		$block_class = 'content-block';
		$container_class = 'content-block-container container';
		$container_class .= ' content-block-container-' . $columns;
		if( $columns == 'twoimage' ){
			$container_class .= ' content-block-container-with-image-' . $image_side;
		}
		
		if( $custom_class ){
			$block_class .= ' ' . $custom_class;
		}

		echo '<section class="' . $block_class . '">';
			if( $block_id ){
				echo '<div class="anchor-point" id="' . $block_id . '"></div>';
			}
			echo '<div class="' . $container_class . '">';
				if( $columns == 'carousel' ){
					if( have_rows('content_block_carousel') ){
						
						if( $carousel_heading ){
							echo '<div class="content-block-content content">' . $carousel_heading . '</div>';
						}

						echo '<div class="content-block-carousel" id="content-block-carousel-' . $c . '">';
							while( have_rows('content_block_carousel') ){
								the_row();
								$content = get_sub_field('content_block_carousel_item');
					
								echo '<article class="content-block-carousel-item"><div class="content">' . $content . '</div></article>';
							}
						echo '</div>';
					}
				}elseif( $columns == 'tiles' ){
					if( have_rows('content_block_tiles') ){
						echo '<div class="content-block-tiles">';
							while( have_rows('content_block_tiles') ){
								the_row();
								$tile_type = get_sub_field('content_block_tile_type');
								$tile_post = get_sub_field('content_block_tile_page');
								$tile_cat = get_sub_field('content_block_tile_category');
								
								if( $tile_type == 'post' ){
									$link = get_the_permalink($tile_post);
									$title = get_the_title($tile_post);
									$image = get_the_post_thumbnail_url($tile_post);
									$excerpt = get_field('service_page_excerpt', $tile_post);
								}elseif( $tile_type == 'category' ){

									$link = get_category_link($tile_cat);
									$title = get_term( $tile_cat )->name;

									$image = get_field('post_category_tile_image', 'category_' . $tile_cat);
									$excerpt = get_field('post_category_tile_excerpt', 'category_' . $tile_cat);
								}
						?>
									<article class="content-block-tiles-item">
										<a class="content-block-tiles-item-link" href="<?php echo $link; ?>" rel="bookmark">
											<figure class="content-block-tiles-item-figure">
												<img src="<?php echo $image; ?>" alt="<?php echo $title; ?>" class="content-block-tiles-item-image">
											</figure>
											<div class="content-block-tiles-item-content">
												<h3 class="content-block-tiles-item-title"><?php echo $title; ?></h3>
												<div class="content-block-tiles-item-excerpt"><?php echo $excerpt; ?></div>
											</div>
										</a>
									</article>
						<?php
								
							}
						echo '</div>';
					}
				}elseif( $columns == 'sidebar' ){
					echo '<div class="content-block-content content">' . $content1 . '</div>';
					
					if( have_rows('content_block_team_members') ){
						echo '<div class="content-block-sidebar">';
							
							if( $sidebar_title ){
								echo '<h2 class="content-block-sidebar-title">' . $sidebar_title . '</h2>';
							}
							while( have_rows('content_block_team_members') ){
								the_row();
								$member_id = get_sub_field('content_block_team_member');
								$member_image = get_the_post_thumbnail_url($member_id);
								$member_name = get_the_title($member_id);
								$member_title = get_field( 'personnel_title', $member_id );
								$member_link = get_the_permalink($member_id);
								
								echo '<div class="content-block-sidebar-member"><a href="' . $member_link . '" class="content-block-sidebar-member-link">';
								
									if( $member_image ){
										echo '<figure class="content-block-sidebar-member-figure">
											<img class="content-block-sidebar-member-image" src="' . $member_image . '" alt="' . $member_name . '" />
										</figure>';
									}

									echo '<h3 class="content-block-sidebar-member-name">' . $member_name . '</h3>';
									
									if( $member_title ){
										echo '<h3 class="content-block-sidebar-member-title">';
											if( $member_title == 'partners' ){
												echo 'Partner';
											}elseif( $member_title == 'managers' ){
												echo 'Manager';
											}elseif( $member_title == 'directors' ){
												echo 'Director';
											}elseif( $member_title == 'associates' ){
												echo 'Associate';
											}elseif( $member_title == 'senior-manager' ){
												echo 'Senior Manager';
											}
										echo '</h3>';
									}
							
									$member_location = get_field('personnel_location', $member_id);
									if( $member_location ){
										if( is_array( $member_location ) ){
											echo '<h4 class="content-block-sidebar-member-location">';
												$i = 0;
												foreach( $member_location as $loc ){
													$location_id = $loc;
													$loc_name = get_the_title( $location_id );
													$loc_link = get_permalink( $location_id );
											
													if( $i > 0 ){
														echo ', ';
													}
													
													echo $loc_name;
													$i++;
												}
											echo '</h4>';
										}else{
											$location_name = get_the_title( $member_location );
									
											echo '<h4 class="content-block-sidebar-member-location">' . $location_name . '</h4>';
										}
									}

								echo '</a></div>';
							}
						echo '</div>';
					}
				}else{
					if( $image && $columns == 'twoimage' ){
						echo '<figure class="content-block-figure"><img src="' . $image['url'] . '" alt="' . $image['alt'] . '" class="content-block-image" loading="lazy" /></figure>';
					}
					
					echo '<div class="content-block-content content">' . $content1 . '</div>';
					
					if( $columns == 'two' || $columns == 'three' || $columns == 'four' || $columns == 'five' ){
						if( $content2 ){
							echo '<div class="content-block-content content">' . $content2 . '</div>';
						}
					}
					
					if( $columns == 'three' || $columns == 'four' || $columns == 'five' ){
						if( $content3 ){
							echo '<div class="content-block-content content">' . $content3 . '</div>';
						}
					}
					
					if( $columns == 'four' || $columns == 'five' ){
						if( $content4 ){
							echo '<div class="content-block-content content">' . $content4 . '</div>';
						}
					}

					if( $columns == 'five' ){
						if( $content5 ){
							echo '<div class="content-block-content content">' . $content5 . '</div>';
						}
					}
				}
			echo '</div>';
		echo '</section>';
		$c++;
	}
	
	echo '<style>@media only screen{';
		include('wp-content/themes/ndhcpawp/assets/css/elements/content_blocks.css');
	echo '}</style>';
}else{
	echo '<div class="content-container"><div class="container"><div class="content">';
		while( have_posts() ){
			the_post();
			the_content();
		}
	echo '</div></div></div>';
}