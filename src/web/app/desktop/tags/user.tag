<mk-user>
	<div class="user" if={ !fetching }>
		<header>
			<mk-user-header user={ user }></mk-user-header>
		</header>
		<div class="body">
			<mk-user-home if={ page == 'home' } user={ user }></mk-user-home>
			<mk-user-graphs if={ page == 'graphs' } user={ user }></mk-user-graphs>
		</div>
	</div>
	<style>
		:scope
			display block
			background #fff

			> .user
				> header
					max-width 560px + 270px
					margin 0 auto
					padding 0 16px

					> mk-user-header
						border solid 1px rgba(0, 0, 0, 0.075)
						border-top none
						border-radius 0 0 6px 6px
						overflow hidden

				> .body
					max-width 560px + 270px
					margin 0 auto
					padding 0 16px

	</style>
	<script>
		@mixin \api

		@username = @opts.user
		@page = if @opts.page? then @opts.page else \home
		@fetching = true
		@user = null

		@on \mount ~>
			@api \users/show do
				username: @username
			.then (user) ~>
				@fetching = false
				@user = user
				@update!
				@trigger \loaded
	</script>
</mk-user>
