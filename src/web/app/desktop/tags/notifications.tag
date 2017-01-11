<mk-notifications>
	<div class="notifications" if={ notifications.length != 0 }>
		<virtual each={ notification, i in notifications }>
			<div class="notification { notification.type }">
				<mk-time time={ notification.created_at }></mk-time>
				<div class="main" if={ notification.type == 'like' }><a class="avatar-anchor" href={ CONFIG.url + '/' + notification.user.username } data-user-preview={ notification.user.id }><img class="avatar" src={ notification.user.avatar_url + '?thumbnail&amp;size=48' } alt="avatar"/></a>
					<div class="text">
						<p><i class="fa fa-thumbs-o-up"></i><a href={ CONFIG.url + '/' + notification.user.username } data-user-preview={ notification.user.id }>{ notification.user.name }</a></p><a class="post-ref" href={ CONFIG.url + '/' + notification.post.user.username + '/' + notification.post.id }>{ getPostSummary(notification.post) }</a>
					</div>
				</div>
				<div class="main" if={ notification.type == 'repost' }><a class="avatar-anchor" href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }><img class="avatar" src={ notification.post.user.avatar_url + '?thumbnail&amp;size=48' } alt="avatar"/></a>
					<div class="text">
						<p><i class="fa fa-retweet"></i><a href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }>{ notification.post.user.name }</a></p><a class="post-ref" href={ CONFIG.url + '/' + notification.post.user.username + '/' + notification.post.id }>{ getPostSummary(notification.post.repost) }</a>
					</div>
				</div>
				<div class="main" if={ notification.type == 'quote' }><a class="avatar-anchor" href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }><img class="avatar" src={ notification.post.user.avatar_url + '?thumbnail&amp;size=48' } alt="avatar"/></a>
					<div class="text">
						<p><i class="fa fa-quote-left"></i><a href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }>{ notification.post.user.name }</a></p><a class="post-preview" href={ CONFIG.url + '/' + notification.post.user.username + '/' + notification.post.id }>{ getPostSummary(notification.post) }</a>
					</div>
				</div>
				<div class="main" if={ notification.type == 'follow' }><a class="avatar-anchor" href={ CONFIG.url + '/' + notification.user.username } data-user-preview={ notification.user.id }><img class="avatar" src={ notification.user.avatar_url + '?thumbnail&amp;size=48' } alt="avatar"/></a>
					<div class="text">
						<p><i class="fa fa-user-plus"></i><a href={ CONFIG.url + '/' + notification.user.username } data-user-preview={ notification.user.id }>{ notification.user.name }</a></p>
					</div>
				</div>
				<div class="main" if={ notification.type == 'reply' }><a class="avatar-anchor" href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }><img class="avatar" src={ notification.post.user.avatar_url + '?thumbnail&amp;size=48' } alt="avatar"/></a>
					<div class="text">
						<p><i class="fa fa-reply"></i><a href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }>{ notification.post.user.name }</a></p><a class="post-preview" href={ CONFIG.url + '/' + notification.post.user.username + '/' + notification.post.id }>{ getPostSummary(notification.post) }</a>
					</div>
				</div>
				<div class="main" if={ notification.type == 'mention' }><a class="avatar-anchor" href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }><img class="avatar" src={ notification.post.user.avatar_url + '?thumbnail&amp;size=48' } alt="avatar"/></a>
					<div class="text">
						<p><i class="fa fa-at"></i><a href={ CONFIG.url + '/' + notification.post.user.username } data-user-preview={ notification.post.user_id }>{ notification.post.user.name }</a></p><a class="post-preview" href={ CONFIG.url + '/' + notification.post.user.username + '/' + notification.post.id }>{ getPostSummary(notification.post) }</a>
					</div>
				</div>
			</div>
			<p class="date" if={ i != notifications.length - 1 &amp;&amp; notification._date != notifications[i + 1]._date }><span><i class="fa fa-angle-up"></i>{ notification._datetext }</span><span><i class="fa fa-angle-down"></i>{ notifications[i + 1]._datetext }</span></p>
		</virtual>
	</div>
	<p class="empty" if={ notifications.length == 0 &amp;&amp; !loading }>ありません！</p>
	<p class="loading" if={ loading }><i class="fa fa-spinner fa-pulse fa-fw"></i>読み込んでいます
		<mk-ellipsis></mk-ellipsis>
	</p>
	<style type="stylus">
		:scope
			display block

			> .notifications
				> .notification
					margin 0
					padding 16px
					font-size 0.9em
					border-bottom solid 1px rgba(0, 0, 0, 0.05)

					&:last-child
						border-bottom none

					> mk-time
						display inline
						position absolute
						top 16px
						right 12px
						vertical-align top
						color rgba(0, 0, 0, 0.6)
						font-size small

					> .main
						word-wrap break-word

					&:after
						content ""
						display block
						clear both

					.avatar-anchor
						display block
						float left

						img
							min-width 36px
							min-height 36px
							max-width 36px
							max-height 36px
							border-radius 6px

					.text
						float right
						width calc(100% - 36px)
						padding-left 8px

						p
							margin 0

							i
								margin-right 4px

					.post-preview
						color rgba(0, 0, 0, 0.7)

					.post-ref
						color rgba(0, 0, 0, 0.7)

						&:before, &:after
							font-family FontAwesome
							font-size 1em
							font-weight normal
							font-style normal
							display inline-block
							margin-right 3px

						&:before
							content "\f10d"

						&:after
							content "\f10e"

					&.like
						.text p i
							color #FFAC33

					&.repost, &.quote
						.text p i
							color #77B255

					&.follow
						.text p i
							color #53c7ce

					&.reply, &.mention
						.text p i
							color #555

				> .date
					display block
					margin 0
					line-height 32px
					text-align center
					font-size 0.8em
					color #aaa
					background #fdfdfd
					border-bottom solid 1px rgba(0, 0, 0, 0.05)

					span
						margin 0 16px

					i
						margin-right 8px

			> .empty
				margin 0
				padding 16px
				text-align center
				color #aaa

			> .loading
				margin 0
				padding 16px
				text-align center
				color #aaa

				> i
					margin-right 4px

	</style>
	<script>
		@mixin \api
		@mixin \stream
		@mixin \user-preview
		@mixin \get-post-summary

		@notifications = []
		@loading = true

		@on \mount ~>
			@api \i/notifications
			.then (notifications) ~>
				@notifications = notifications
				@loading = false
				@update!
			.catch (err, text-status) ->
				console.error err

			@stream.on \notification @on-notification

		@on \unmount ~>
			@stream.off \notification @on-notification

		@on-notification = (notification) ~>
			@notifications.unshift notification
			@update!

		@on \update ~>
			@notifications.for-each (notification) ~>
				date = (new Date notification.created_at).get-date!
				month = (new Date notification.created_at).get-month! + 1
				notification._date = date
				notification._datetext = month + '月 ' + date + '日'
	</script>
</mk-notifications>
