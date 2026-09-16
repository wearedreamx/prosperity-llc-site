<div class="team-filters-container">
	<ul class="team-filters">
		<li class="team-filter">
			<div class="team-filter-header">Title</div>
			<ul class="team-filter-dropdown">
				<li class="team-filter-link active" data-term="all">All</li>
				<?php
					$title_key = "field_6679cee8fa574";
					$title = get_field_object( $title_key );
					if( $title ){
						foreach( $title['choices'] as $k => $v ){
							echo '<li class="team-filter-link" data-term="' . $k . '">' . $v . '</li>';
						}
					}
				?>
			</ul>
		</li>
		<li class="team-filter">
			<div class="team-filter-header">Service Line</div>
			<ul class="team-filter-dropdown">
				<li class="team-filter-link active" data-term="all">All</li>
				<?php
					$specs_key = "field_6695315a92f52";
					$specs = get_field_object( $specs_key );
					if( $specs ){
						foreach( $specs['choices'] as $k => $v ){
							echo '<li class="team-filter-link" data-term="' . $k . '">' . $v . '</li>';
						}
					}
				?>
			</ul>
		</li>
		<?php
			if( !is_singular( 'location' ) ){
		?>
				<li class="team-filter">
					<div class="team-filter-header">Location</div>
					<ul class="team-filter-dropdown">
						<li class="team-filter-link active" data-term="all">All</li>
						<li class="team-filter-link" data-term="burlington">Burlington</li>
						<li class="team-filter-link" data-term="chicago">Chicago</li>
						<li class="team-filter-link" data-term="detroit">Detroit</li>
						<li class="team-filter-link" data-term="houston">Houston</li>
						<li class="team-filter-link" data-term="iselin">Iselin</li>
						<li class="team-filter-link" data-term="kansas-city">Kansas City</li>
						<li class="team-filter-link" data-term="new-york-city">New York City</li>
						<li class="team-filter-link" data-term="mumbai">Mumbai</li>
						<li class="team-filter-link" data-term="santa-barbara">Santa Barbara</li>
						<li class="team-filter-link" data-term="washington-dc">Washington DC - TAX</li>
						<li class="team-filter-link" data-term="washington-dc-transaction-advisory">Washington DC - Transaction Advisory</li>
					</ul>
				</li>
		<?php
			}
		?>
		<li class="team-filter"><span class="team-filter-reset">Reset</span></li>
	</ul>
	<div class="team-search">
		<form role="search" method="get" id="searchform" class="searchform" action="/">
			<label class="screen-reader-text team-search-label" for="s">Search for:</label>
			<input type="hidden" name="post_type" value="personnel" />
			<input class="team-search-input" placeholder="Search members" type="text" name="s" id="s" />
			<input class="team-search-button" type="submit" value="Search" />
		</form>
	</div>
	<?php
		if( is_singular( 'location' ) ){
			$args = array(
				'post_type' => 'location',
				'post_status' => 'publish',
				'posts_per_page' => -1, 
				'orderby' => 'title',
				'order' => 'ASC'
			);
			$arr_posts = new WP_Query( $args );
			if ( $arr_posts->have_posts() ){
	?>
				<div class="team-locations">
					<select class="team-locations-select" onchange="document.location.href=this.value">
						<option value="">Locations</option>
						<?php
							while ( $arr_posts->have_posts() ){
								$arr_posts->the_post();
								$post_id = get_the_ID();
								$link = get_permalink( $post_id );
								$title = get_the_title( $post_id );
								
								echo '<option class="team-locations-option" value="' . $link . '">' . $title . '</option>';
							}
						?>
					</select>
				</div>
	<?php
			}
		}
	?>
</div>