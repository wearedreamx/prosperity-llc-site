<?php
$cat_id = 1;

$args = array(
	'post_type' => 'post', 
	'post_status' => 'publish', 
	'category__in' => $cat_id, 
	'posts_per_page' => 3, 
);
$arr_posts = new WP_Query( $args );
if ( $arr_posts->have_posts() ){
?>
    <section class="home-posts">
        <div class="container">
            <?php
                // title
				$title = get_cat_name( $cat_id );
                if( $title ){
                    echo '<h2 class="home-posts-title">' . $title . '</h2>';
                }
            ?>
            <div class="home-posts-container">
                <?php
                    while ( $arr_posts->have_posts() ){
                        $arr_posts->the_post();
                        $post_id = get_the_ID();
                        
                        $thumbnail = get_post_thumbnail_id( $post_id );
                        $image = wp_get_attachment_url( $thumbnail );
                        
                        $title = get_the_title( $post_id );
                        $link = get_permalink( $post_id );
                        $excerpt = get_the_excerpt( $post_id );
                ?>
                        <article class="home-post">
                            <a class="home-post-link" href="<?php echo $link; ?>" rel="bookmark">
                                <figure class="home-post-figure animate-in fade-in">
                                    <img src="<?php echo $image; ?>" alt="<?php echo $title; ?>" class="home-post-img" loading="lazy" height="480" width="640" />
                                </figure>
                                <div class="home-post-content">
                                    <h5 class="home-post-date"><?php echo get_the_date( 'F d, Y', $post_id ) ?></h5>
                                    <h3 class="home-post-title"><?php echo $title; ?></h3>
                                    <p class="home-post-excerpt"><?php echo $excerpt; ?> <span class="home-post-read-more">Read More</span></p>
                                </div>
                            </a>
                        </article>
                <?php
                    }
                ?>
            </div>
        </div>
    </section>
<?php
}