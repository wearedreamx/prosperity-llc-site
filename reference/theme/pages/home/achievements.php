<?php
$title = get_field('home_achievements_title');
$content = get_field('home_achievements_content');

if( $title || $content ){
    echo '<section class="home-achievements">
        <div class="home-achievements-container container">';
            if( $title ){
                echo '<h2 class="home-achievements-title">' . $title . '</h2>';
            }

            if( $content ){
                echo '<div class="home-achievements-content content">' . $content . '</div>';
            }
        echo '</div>
    </section>';
}