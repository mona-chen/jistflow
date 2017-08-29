<mk-init-following>
	<p class="title">気になるユーザーをフォロー:</p>
	<div class="users" if={ !fetching && users.length > 0 }>
		<div class="user" each={ users }>
			<header style={ banner_url ? 'background-image: url(' + banner_url + '?thumbnail&size=1024)' : '' }>
				<a href={ '/' + username }>
					<img src={ avatar_url + '?thumbnail&size=200' } alt="avatar"/>
				</a>
			</header>
			<a class="name" href={ '/' + username } target="_blank">{ name }</a>
			<p class="username">@{ username }</p>
			<mk-follow-button user={ this }/>
		</div>
	</div>
	<p class="empty" if={ !fetching && users.length == 0 }>おすすめのユーザーは見つかりませんでした。</p>
	<p class="fetching" if={ fetching }><i class="fa fa-spinner fa-pulse fa-fw"></i>読み込んでいます<mk-ellipsis/></p>
	<a class="refresh" onclick={ refresh }>もっと見る</a>
	<button class="close" onclick={ close } title="閉じる"><i class="fa fa-times"></i></button>
	<style>
		:scope
			display block
			background #fff
			border-radius 8px
			box-shadow 0 0 0 1px rgba(0, 0, 0, 0.2)

			> .title
				margin 0
				padding 8px 16px
				font-size 1em
				font-weight bold
				color #888

			> .users
				overflow-x scroll
				-webkit-overflow-scrolling touch
				white-space nowrap
				padding 16px
				background #eee

				> .user
					display inline-block
					width 200px
					text-align center
					border-radius 8px
					background #fff

					&:not(:last-child)
						margin-right 16px

					> header
						display block
						height 80px
						background-color #ddd
						background-size cover
						background-position center
						border-radius 8px 8px 0 0

						> a
							> img
								position absolute
								top 20px
								left calc(50% - 40px)
								width 80px
								height 80px
								border solid 2px #fff
								border-radius 8px

					> .name
						display block
						margin 24px 0 2px 0
						font-size 16px
						color #555

					> .username
						margin 0
						font-size 15px
						color #ccc

					> mk-follow-button
						display inline-block
						margin 8px 0 16px 0

			> .empty
				margin 0
				padding 16px
				text-align center
				color #aaa

			> .fetching
				margin 0
				padding 16px
				text-align center
				color #aaa

				> i
					margin-right 4px

			> .refresh
				display block
				margin 0
				padding 8px 16px
				text-align right
				font-size 0.9em
				color #999

			> .close
				cursor pointer
				display block
				position absolute
				top 0
				right 0
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
					padding 10px

	</style>
	<script>
		this.mixin('api');

		this.users = null;
		this.fetching = true;

		this.limit = 6;
		this.page = 0;

		this.on('mount', () => {
			this.fetch();
		});

		this.fetch = () => {
			this.update({
				fetching: true,
				users: null
			});

			this.api('users/recommendation', {
				limit: this.limit,
				offset: this.limit * this.page
			}).then(users => {
				this.fetching = false
				this.users = users
				this.update({
					fetching: false,
					users: users
				});
			});
		};

		this.refresh = () => {
			if (this.users.length < this.limit) {
				this.page = 0;
			} else {
				this.page++;
			}
			this.fetch();
		};

		this.close = () => {
			this.unmount();
		};
	</script>
</mk-init-following>
