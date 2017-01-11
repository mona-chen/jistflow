<mk-search-posts>
	<div class="loading" if={ isLoading }>
		<mk-ellipsis-icon></mk-ellipsis-icon>
	</div>
	<p class="empty" if={ isEmpty }><i class="fa fa-search"></i>「{ query }」に関する投稿は見つかりませんでした。</p>
	<mk-timeline ref="timeline"><yield to="footer"><i class="fa fa-moon-o" if={ !parent.moreLoading }></i><i class="fa fa-spinner fa-pulse fa-fw" if={ parent.moreLoading }></i></yield></mk-timeline>
	<style type="stylus">
		:scope
			display block
			background #fff

			> .loading
				padding 64px 0

			> .empty
				display block
				margin 0 auto
				padding 32px
				max-width 400px
				text-align center
				color #999

				> i
					display block
					margin-bottom 16px
					font-size 3em
					color #ccc

	</style>
	<script>
		@mixin \api
		@mixin \get-post-summary

		@query = @opts.query
		@is-loading = true
		@is-empty = false
		@more-loading = false
		@page = 0

		@on \mount ~>
			document.add-event-listener \keydown @on-document-keydown
			window.add-event-listener \scroll @on-scroll

			@api \posts/search do
				query: @query
			.then (posts) ~>
				@is-loading = false
				@is-empty = posts.length == 0
				@update!
				@refs.timeline.set-posts posts
				@trigger \loaded
			.catch (err) ~>
				console.error err

		@on \unmount ~>
			document.remove-event-listener \keydown @on-document-keydown
			window.remove-event-listener \scroll @on-scroll

		@on-document-keydown = (e) ~>
			tag = e.target.tag-name.to-lower-case!
			if tag != \input and tag != \textarea
				if e.which == 84 # t
					@refs.timeline.focus!

		@more = ~>
			if @more-loading or @is-loading or @timeline.posts.length == 0
				return
			@more-loading = true
			@update!
			@api \posts/search do
				query: @query
				page: @page + 1
			.then (posts) ~>
				@more-loading = false
				@page++
				@update!
				@refs.timeline.prepend-posts posts
			.catch (err) ~>
				console.error err

		@on-scroll = ~>
			current = window.scroll-y + window.inner-height
			if current > document.body.offset-height - 16 # 遊び
				@more!
	</script>
</mk-search-posts>
