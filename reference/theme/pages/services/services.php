<?php
if( have_rows('page_services') ){
    echo '<section class="services-grid"><div class="container"><div class="services-grid-container">';
        while( have_rows('page_services') ){
            the_row();
            $service_id = get_sub_field('page_service');
            $link = get_the_permalink($service_id);
            $title = get_the_title($service_id);
            $image = get_the_post_thumbnail_url($service_id);
            $excerpt = get_field('service_page_excerpt', $service_id);
?>
            <article class="services-grid-item">
                <a class="services-grid-item-link" href="<?php echo $link; ?>" rel="bookmark">
                    <figure class="services-grid-item-figure">
                        <img src="<?php echo $image; ?>" alt="<?php echo $title; ?>" class="services-grid-item-image">
                    </figure>
                    <div class="services-grid-item-content">
                        <h3 class="services-grid-item-title"><?php echo $title; ?></h3>
                        <div class="services-grid-item-excerpt"><?php echo $excerpt; ?></div>
                    </div>
                </a>
            </article>
<?php
        }
    echo '</div></div></section>';
}