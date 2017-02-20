<mk-following-setuper>
	<p class="title">気になるユーザーをフォロー:</p>
	<div class="users" if={ !loading && users.length > 0 }>
		<div class="user" each={ users }><a class="avatar-anchor" href={ CONFIG.url + '/' + username }><img class="avatar" src={ avatar_url + '?thumbnail&size=42' } alt="" data-user-preview={ id }/></a>
			<div class="body"><a class="name" href={ CONFIG.url + '/' + username } target="_blank" data-user-preview={ id }>{ name }</a>
				<p class="username">@{ username }</p>
			</div>
			<mk-follow-button user={ this }></mk-follow-button>
		</div>
	</div>
	<p class="empty" if={ !loading && users.length == 0 }>おすすめのユーザーは見つかりませんでした。</p>
	<p class="loading" if={ loading }><i class="fa fa-spinner fa-pulse fa-fw"></i>読み込んでいます
		<mk-ellipsis></mk-ellipsis>
	</p><a class="refresh" onclick={ refresh }>もっと見る</a>
	<button class="close" onclick={ close } title="閉じる"><i class="fa fa-times"></i></button>
	<style>
		:scope
			display block
			padding 24px
			background #fff

			> .title
				margin 0 0 12px 0
				font-size 1em
				font-weight bold
				color #888

			> .users
				&:after
					content ""
					display block
					clear both

				> .user
					padding 16px
					width 238px
					float left

					&:after
						content ""
						display block
						clear both

					> .avatar-anchor
						display block
						float left
						margin 0 12px 0 0

						> .avatar
							display block
							width 42px
							height 42px
							margin 0
							border-radius 8px
							vertical-align bottom

					> .body
						float left
						width calc(100% - 54px)

						> .name
							margin 0
							font-size 16px
							line-height 24px
							color #555

						> .username
							margin 0
							font-size 15px
							line-height 16px
							color #ccc

					> mk-follow-button
						position absolute
						top 16px
						right 16px

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

			> .refresh
				display block
				margin 0 8px 0 0
				text-align right
				font-size 0.9em
				color #999

			> .close
				cursor pointer
				display block
				position absolute
				top 6px
				right 6px
				z-index 1
				margin 0
				padding 0
				font-size 1.2em
				color #999
				border none
				outline none
				background transparent

				&:hover
					color #555

				&:active
					color #222

				> i
					padding 14px

	</style>
	<script>
		this.mixin('api');
		this.mixin('user-preview');

		this.users = null
		this.loading = true

		this.limit = 6users
		this.page = 0

		this.on('mount', () => {
			@load!

		load() {
			this.loading = true
			this.users = null
			this.update();

			this.api 'users/recommendation' do
				limit: @limit
				offset: @limit * @page
			.then (users) =>
				this.loading = false
				this.users = users
				this.update();
			.catch (err, text-status) ->
				console.error err

		refresh() {
			if @users.length < @limit
				this.page = 0
			else
				@page++
			@load!

		close() {
			this.unmount();
	</script>
</mk-following-setuper>
