<?php
/* Template Name: Client Portal */
get_header();

get_template_part( 'parts/page-banner' );
?>

<section class="content-container">
	<div class="container">
		<div class="content">
			<form class="client-portal-form" action="https://www.clientaxcess.com/embeddedLogin.aspx" target="_blank" method="post">
				<p class="client-portal-row"><input name="txtbxUserID" placeholder="Enter your user ID" type="email" class="client-portal-field" /></p>
				<p class="client-portal-row"><input name="txtbxPassword" placeholder="Enter your password" type="password" class="client-portal-field" /></p>
				<p class="client-portal-row"><input type="submit" class="client-portal-button button solid blue" value="Log In" /></p>
				<p class="client-portal-row"><a href="https://www.clientaxcess.com/#/forgot" target="_blank">Forgot password?</a></p>
				<p class="client-portal-row"><a href="/wp-content/uploads/2024/07/CCH-Client-Axcess-User-Guide.pdf" target="_blank" rel="noopener">Portal User Guide</a></p>
			</form>
		</div>
	</div>
</section>

<?php
get_footer();