<mk-home-timeline>
	<mk-timeline ref="timeline" init={ init } more={ more } empty={ '表示する投稿がありません。誰かしらをフォローするなどしましょう。' }></mk-timeline>
	<style>
		:scope
			display block

	</style>
	<script>
		@mixin \api
		@mixin \stream

		@init = new Promise (res, rej) ~>
			@api \posts/timeline
			.then (posts) ~>
				res posts
				@trigger \loaded

		@on \mount ~>
			@stream.on \post @on-stream-post
			@stream.on \follow @on-stream-follow
			@stream.on \unfollow @on-stream-unfollow

		@on \unmount ~>
			@stream.off \post @on-stream-post
			@stream.off \follow @on-stream-follow
			@stream.off \unfollow @on-stream-unfollow

		@more = ~>
			@api \posts/timeline do
				max_id: @refs.timeline.tail!.id

		@on-stream-post = (post) ~>
			@is-empty = false
			@update!
			@refs.timeline.add-post post

		@on-stream-follow = ~>
			@fetch!

		@on-stream-unfollow = ~>
			@fetch!
	</script>
</mk-home-timeline>
