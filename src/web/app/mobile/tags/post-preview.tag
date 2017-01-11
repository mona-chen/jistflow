<mk-post-preview>
	<article><a class="avatar-anchor" href="{ CONFIG.url + '/' + post.user.username }"><img class="avatar" src="{ post.user.avatar_url + '?thumbnail&amp;size=64' }" alt="avatar"/></a>
		<div class="main">
			<header><a class="name" href="{ CONFIG.url + '/' + post.user.username }">{ post.user.name }</a><span class="username">@{ post.user.username }</span><a class="time" href="{ CONFIG.url + '/' + post.user.username + '/' + post.id }">
					<mk-time time="{ post.created_at }"></mk-time></a></header>
			<div class="body">
				<mk-sub-post-content class="text" post="{ post }"></mk-sub-post-content>
			</div>
		</div>
	</article>
	<style type="stylus">
		:scope
			display block
			margin 0
			padding 0
			font-size 0.9em
			background #fff

			> article

				&:after
					content ""
					display block
					clear both

				&:hover
					> .main > footer > button
						color #888

				> .avatar-anchor
					display block
					float left
					margin 0 12px 0 0

					> .avatar
						display block
						width 48px
						height 48px
						margin 0
						border-radius 8px
						vertical-align bottom

				> .main
					float left
					width calc(100% - 60px)

					> header
						margin-bottom 4px
						white-space nowrap

						> .name
							display inline
							margin 0
							padding 0
							color #607073
							font-size 1em
							font-weight 700
							text-align left
							text-decoration none

							&:hover
								text-decoration underline

						> .username
							text-align left
							margin 0 0 0 8px
							color #d1d8da

						> .time
							position absolute
							top 0
							right 0
							color #b2b8bb

					> .body

						> .text
							cursor default
							margin 0
							padding 0
							font-size 1.1em
							color #717171

	</style>
	<script>@post = @opts.post</script>
</mk-post-preview>
